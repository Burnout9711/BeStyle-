# routes/outfit_links_routes.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from dependencies.session_dep import get_or_create_session
from models.product_links import OutfitProducts
from database import get_database

links_router = APIRouter(prefix="/api/outfit-links", tags=["links"])

@links_router.get("", response_model=List[OutfitProducts])
async def get_links(
    outfit_ids: List[str] = Query(..., description="Repeatable ?outfit_ids=..."),
    session = Depends(get_or_create_session),
):
    db = get_database()
    coll = db["product_links"]
    cur = coll.find({"outfit_id": {"$in": outfit_ids}})
    docs = await cur.to_list(length=1000)
    if not docs:
        return []
    out: List[OutfitProducts] = []
    for d in docs:
        out.append(OutfitProducts(
            outfit_id=d["outfit_id"],
            products=d.get("products") or [
                # backward compatibility: if stored per item
                # each doc is per item; convert into OutfitProducts grouping
            ]
        ))
    # If you stored per-item docs, group them here:
    by_outfit: dict[str, list] = {}
    for d in docs:
        by_outfit.setdefault(d["outfit_id"], []).append({
            "item_name": d["item_name"],
            "links": d["links"]
        })
    return [OutfitProducts(outfit_id=o, products=p) for o, p in by_outfit.items()]
