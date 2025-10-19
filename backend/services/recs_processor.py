# services/recs_processor.py
import asyncio
from datetime import datetime
from bson import ObjectId
from typing import List
from db import get_collection
from models.recs import Recommendation, ItemWithLinks, ProductLink
from services.search_service import find_links_for_item

RECS = "recommendations"

async def process_recommendation(rec_id: ObjectId, user_id: ObjectId):
    coll = get_collection(RECS)
    doc = await coll.find_one({"_id": rec_id, "user_id": user_id})
    if not doc:
        return

    rec = Recommendation.model_validate(doc)
    try:
        # fetch links concurrently (throttle with a semaphore if needed)
        results = await asyncio.gather(*[
            find_links_for_item(item) for item in rec.items
        ])

        # attach results to items
        for i, links in enumerate(results):
            # keep top 6 unique links per item
            unique, seen = [], set()
            for l in links:
                key = canonical_key(l.url)
                if key in seen: continue
                seen.add(key)
                unique.append(l)
                if len(unique) >= 6: break
            rec.items[i].links = unique

        await coll.update_one(
            {"_id": rec.id},
            {"$set": {
                "items": [i.model_dump() for i in rec.items],
                "status": "complete",
                "updated_at": datetime.utcnow(),
            }}
        )
    except Exception as e:
        await coll.update_one(
            {"_id": rec.id},
            {"$set": {"status": "error", "meta.error": str(e), "updated_at": datetime.utcnow()}}
        )

def canonical_key(url: str) -> str:
    # strip utm params etc. (tune as needed)
    from urllib.parse import urlparse, parse_qsl, urlunparse, urlencode
    p = urlparse(url)
    q = [(k,v) for k,v in parse_qsl(p.query, keep_blank_values=True)
         if not k.lower().startswith("utm_") and k.lower() not in {"gclid","fbclid"}]
    clean = p._replace(query=urlencode(q, doseq=True), fragment="")
    return urlunparse(clean).lower()
