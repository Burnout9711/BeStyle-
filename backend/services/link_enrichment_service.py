# services/link_enrichment_service.py
from __future__ import annotations
import asyncio
from datetime import datetime
import logging
from typing import List, Dict, Any, Optional
from models.product_links import ProductLink, ItemProducts, OutfitProducts
from services.serpapi_provider import SerpApiShoppingProvider

class LinkEnrichmentService:
    """
    Orchestrates link discovery for generated outfits and persists results.
    You pass in a `db` (from database.get_database()).
    """
    def __init__(self, db, provider: Optional[SerpApiShoppingProvider] = None, concurrency: int = 4):
        self.db = db
        self.provider = provider or SerpApiShoppingProvider()
        self.sem = asyncio.Semaphore(concurrency)

    async def ensure_indexes(self):
        coll = self.db["product_links"]
        await coll.create_index([("user_id", 1), ("session_id", 1)])
        await coll.create_index([("outfit_id", 1), ("item_name", 1)], unique=True)

    async def _search_one(self, query: str, price: Optional[float]) -> List[ProductLink]:
        async with self.sem:
            # spread price as a band if available
            lo = None
            hi = None
            if isinstance(price, (int, float)) and price > 0:
                lo = int(max(0, price * 0.6))   # ✅ ints
                hi = int(price * 1.4)           # ✅ ints
            return await self.provider.search(query, price_min=lo, price_max=hi)

    async def enrich_outfits(
        self,
        *,
        outfits: List[Dict[str, Any]],
        user_id: Optional[str],
        session_id: Optional[str]
    ) -> List[OutfitProducts]:
        """
        outfits: list of your OutfitCard dicts (as returned by engine)
        """
        await self.ensure_indexes()
        tasks = []
        for oc in outfits:
            outfit_id = oc["id"]
            for item in oc.get("items", []):
                name = item.get("name") or ""
                brand = item.get("brand")
                q = f"{brand} {name}".strip() if brand else name
                price = item.get("price")
                tasks.append((outfit_id, name, q, price))

        async def run(o_id: str, item_name: str, q: str, price: Optional[float]) -> ItemProducts:
            try:
                links = await self._search_one(q, price)
            except Exception as e:
                # log the error
                import logging
                logging.getLogger(__name__).warning(f"SerpAPI failed for '{q}': {e}")
                links = []
            await self._save_item_links(
                outfit_id=o_id,
                item_name=item_name,
                session_id=session_id,
                user_id=user_id,
                links=links
            )
            return ItemProducts(item_name=item_name, links=links)

        results_map: Dict[str, List[ItemProducts]] = {}
        coros = [run(o, n, q, p) for (o, n, q, p) in tasks]
        results = await asyncio.gather(*coros, return_exceptions=False)

        # rebuild by outfit
        for (o, n, q, p), item_products in zip(tasks, results):
            results_map.setdefault(o, []).append(item_products)

        return [OutfitProducts(outfit_id=o, products=plist) for o, plist in results_map.items()]

    async def _save_item_links(
        self,
        *,
        outfit_id: str,
        item_name: str,
        session_id: Optional[str],
        user_id: Optional[str],
        links: List[ProductLink],
    ):
        coll = self.db["product_links"]
        doc = {
            "outfit_id": outfit_id,
            "item_name": item_name,
            "session_id": session_id,
            "user_id": user_id,
            "links": [l.model_dump() for l in links],
            "updated_at": datetime.utcnow()
        }
        # Create the document fields that are only set on the first insert
        on_insert_fields = {
            "created_at": datetime.utcnow(),
        }
        # upsert by (outfit_id, item_name)
        await coll.update_one(
            {"outfit_id": outfit_id, "item_name": item_name},
            {"$set": doc, "$setOnInsert": on_insert_fields},
            upsert=True
        )
