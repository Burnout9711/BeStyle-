# services/search_service.py
import os, httpx, asyncio
from typing import List
from models.recs import SuggestionItem, ProductLink

SERPAPI_KEY = os.getenv("SERPAPI_KEY")

def _query_for_item(i: SuggestionItem) -> str:
    parts = [i.label]
    if i.color: parts.append(i.color)
    if i.category: parts.append(i.category)
    # prefer brand if given
    if i.brand_pref: parts.append(i.brand_pref[0])
    return " ".join(parts)

async def find_links_for_item(i: SuggestionItem) -> List[ProductLink]:
    q = _query_for_item(i)
    if not SERPAPI_KEY:
        return []  # or raise

    params = {
        "engine": "google_shopping",
        "q": q,
        "api_key": SERPAPI_KEY,
        "num": 10,
        "gl": "in",   # set region; try "ae" if targeting UAE results
        "hl": "en",
    }
    # optional filters
    if i.price_min is not None: params["min_price"] = i.price_min
    if i.price_max is not None: params["max_price"] = i.price_max

    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get("https://serpapi.com/search.json", params=params)
        r.raise_for_status()
        data = r.json()

    items = data.get("shopping_results") or []
    out: List[ProductLink] = []
    for it in items:
        price = _parse_price(it.get("price"))
        currency = _guess_currency(it.get("price"))
        out.append(ProductLink(
            title=it.get("title") or "",
            url=it.get("link"),
            price=price,
            currency=currency,
            image_url=it.get("thumbnail"),
            source=(it.get("source") or "Google Shopping"),
            in_stock=None  # SerpAPI sometimes has "extracted" availability; add if needed
        ))
    # hard filter price if both min/max present
    out = [p for p in out if _within_budget(p.price, i.price_min, i.price_max)]
    return out

def _within_budget(price, lo, hi):
    if price is None: return True
    if lo is not None and price < lo: return False
    if hi is not None and price > hi: return False
    return True

def _parse_price(s: str | None):
    if not s: return None
    # "₹1,990", "AED 129.00", "$39.99"
    import re
    nums = re.findall(r"[\d,.]+", s)
    if not nums: return None
    return float(nums[0].replace(",", ""))

def _guess_currency(s: str | None):
    if not s: return None
    if "₹" in s: return "INR"
    if "AED" in s: return "AED"
    if "$" in s: return "USD"
    if "£" in s: return "GBP"
    if "€" in s: return "EUR"
    return None
