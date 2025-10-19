# services/serpapi_provider.py
from __future__ import annotations
import os, math, asyncio, httpx, re
from typing import List, Dict, Any, Optional
from models.product_links import ProductLink
# add near the top
import re
from urllib.parse import urlparse
import logging


SERP_ENDPOINT = "https://serpapi.com/search.json"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _guess_currency(raw: Optional[str]) -> Optional[str]:
    if not raw: return None
    if "AED" in raw: return "AED"
    if "₹" in raw: return "INR"
    if "$" in raw: return "USD"
    if "£" in raw: return "GBP"
    if "€" in raw: return "EUR"
    return None

def _parse_price(raw: Optional[str]) -> Optional[float]:
    if not raw: return None
    m = re.search(r"[\d,.]+", raw)
    if not m: return None
    try:
        return float(m.group(0).replace(",", ""))
    except Exception:
        return None
    
# add helper
def _sanitize_query(q: str) -> str:
    if not q:
        return ""
    q = re.sub(r"\((.*?)\)", " ", q)       # drop parenthetical notes e.g. (Namshi)
    q = q.replace("&", " and ")            # H&M -> H and M (avoids param parsing edge-cases)
    q = re.sub(r"\s+", " ", q).strip()
    return q


class SerpApiShoppingProvider:
    """
    Thin async client for Google Shopping via SerpAPI.
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        gl: str = os.getenv("SHOPPING_REGION", "ae"),
        hl: str = os.getenv("SHOPPING_LANG", "en"),
        location: Optional[str] = os.getenv("SHOPPING_LOCATION"),
        timeout: float = 20.0,
        per_page: int = 1,
        max_results: int = 1, # we are changing it to 1 so that we will get only 1result
        max_retries: int = 3,
        backoff_base: float = 0.7,
    ):
        self.api_key = api_key or os.getenv("SERPAPI_KEY", "")
        if not self.api_key:
            raise RuntimeError("SERPAPI_KEY missing")
        self.gl, self.hl, self.location = gl, hl, location
        self.timeout = timeout
        self.per_page = per_page
        self.max_results = max_results
        self.max_retries = max_retries
        self.backoff_base = backoff_base

    async def _fetch(self, client: httpx.AsyncClient, params: Dict[str, Any]) -> Dict[str, Any]:
        last_err = None
        tried_without_prices = False
        for attempt in range(self.max_retries):
            try:
                r = await client.get(SERP_ENDPOINT, params=params)
                if r.status_code == 429:
                    await asyncio.sleep(self.backoff_base * (2 ** attempt))
                    last_err = RuntimeError(f"SerpAPI 429: {r.text[:200]}")
                    continue
                if r.status_code == 400:
                    # log server message for debug
                    body = (r.text or "")[:500]
                    # one graceful retry: drop price filters (sometimes 400 is due to ranges)
                    if not tried_without_prices and ("min_price" in params or "max_price" in params):
                        tried_without_prices = True
                        clean = {k: v for k, v in params.items() if k not in ("min_price", "max_price")}
                        await asyncio.sleep(self.backoff_base * (2 ** attempt))
                        r2 = await client.get(SERP_ENDPOINT, params=clean)
                        if r2.status_code < 400:
                            return r2.json()
                        # if still 400, fall through to raise for status
                    # otherwise raise as usual with context
                    raise httpx.HTTPStatusError(f"400 from SerpAPI: {body}", request=r.request, response=r)
                r.raise_for_status()
                logger.info(f"SerpAPI request successful: {r.json().get('search_metadata', {}).get('status')}")
                # logger.info(f"SerpAPI request successful: {r.json().get('shopping_results', {})}")
                return r.json()
            except (httpx.HTTPError, ValueError) as e:
                last_err = e
                await asyncio.sleep(self.backoff_base * (2 ** attempt))
        raise last_err or RuntimeError("SerpAPI error")

    async def search(self, query: str, price_min: Optional[float] = None, price_max: Optional[float] = None) -> List[ProductLink]:
        q = _sanitize_query(query)
        params: Dict[str, Any] = {
            "engine": "google_shopping",
            "q": q,
            "api_key": self.api_key,
            "gl": self.gl,
            "hl": self.hl,
            "num": self.per_page,
        }
        if self.location: params["location"] = self.location
        if price_min is not None: params["min_price"] = int(price_min)
        if price_max is not None: params["max_price"] = int(price_max)

        out: List[ProductLink] = []
        # pages = math.ceil(self.max_results / self.per_page)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            # next_params = params.copy()
            # for _ in range(pages):
            #     data = await self._fetch(client, next_params)
            #     results = data.get("shopping_results") or []
            #     for it in results:
            #         price = it.get("extracted_price")
            #         if price is None:
            #             price = _parse_price(it.get("price"))
            #         url = it.get("serpapi_link") or it.get("link")
            #         pl = ProductLink(
            #             title=it.get("title") or query,
            #             url=url,
            #             price=price,
            #             currency=_guess_currency(it.get("price")),
            #             image_url=it.get("thumbnail"),
            #             source=it.get("source") or "Google Shopping",
            #             in_stock=None
            #         )
            #         out.append(pl)

            #     # simple pagination support
            #     pag = data.get("serpapi_pagination") or {}
            #     token = pag.get("next_page_token")
            #     if token:
            #         next_params = params | {"start": token}
            #     else:
            #         break
            data = await self._fetch(client, params)
            results = data.get("shopping_results") or []
            logger.info(f"SerpAPI returned {len(results)} results for query '{q}'")
            if results:
                # Take only the first item and process it
                it = results[0]
                url = it.get("serpapi_link") or it.get("link") or it.get("product_link")
                if not isinstance(url, str):
                    return None # Return None if the first result is invalid
                
                price = it.get("extracted_price")
                if price is None:
                    price = _parse_price(it.get("price"))
                
                pl = ProductLink(
                    title=it.get("title") or query,
                    url=url,
                    price=price,
                    currency=_guess_currency(it.get("price")),
                    image_url=it.get("thumbnail"),
                    source=it.get("source") or "Google Shopping",
                    in_stock=None
                )
                out.append(pl)
                return out
            
            return None # No results were found

        # de-dupe + trim
        seen, uniq = set(), []
        for p in out:
            key = (p.url or "").split("#")[0].lower()
            if key in seen: continue
            seen.add(key); uniq.append(p)
            if len(uniq) >= self.max_results: break
        return uniq
