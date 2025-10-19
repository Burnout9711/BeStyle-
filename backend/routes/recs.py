# routes/recs.py
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from bson import ObjectId
from datetime import datetime
import asyncio
import os
from models.recs import CreateRecommendation, Recommendation, ItemWithLinks, ProductLink
from services.search_service import find_links_for_item
from services.recs_processor import process_recommendation
from db import get_collection
from auth.dependencies import get_current_user  # returns your User model
from pymongo import ReturnDocument

router = APIRouter(prefix="/api/recs", tags=["recommendations"])

RECS = "recommendations"

@router.post("", response_model=Recommendation)
async def create_recommendation(
    body: CreateRecommendation,
    background: BackgroundTasks,
    user = Depends(get_current_user)
):
    coll = get_collection(RECS)
    rec = Recommendation(
        user_id=user.id,
        prompt=body.prompt,
        items=[ItemWithLinks(**i.model_dump()) for i in body.items],
        status="pending"
    )
    res = await coll.insert_one(rec.model_dump(by_alias=True))
    rec_id = res.inserted_id

    background.add_task(process_recommendation, rec_id, user.id)
    # immediate response so UI can poll
    inserted = await coll.find_one({"_id": rec_id})
    return Recommendation.model_validate(inserted)

@router.get("/{rec_id}", response_model=Recommendation)
async def get_recommendation(rec_id: str, user = Depends(get_current_user)):
    coll = get_collection(RECS)
    doc = await coll.find_one({"_id": ObjectId(rec_id), "user_id": user.id})
    if not doc:
        raise HTTPException(404, "Not found")
    return Recommendation.model_validate(doc)

@router.post("/{rec_id}/refresh", response_model=Recommendation)
async def refresh_recommendation(rec_id: str, background: BackgroundTasks, user = Depends(get_current_user)):
    coll = get_collection(RECS)
    doc = await coll.find_one({"_id": ObjectId(rec_id), "user_id": user.id})
    if not doc:
        raise HTTPException(404, "Not found")
    await coll.update_one({"_id": doc["_id"]}, {"$set": {"status": "pending", "updated_at": datetime.utcnow()}})
    background.add_task(process_recommendation, doc["_id"], user.id)
    refreshed = await coll.find_one({"_id": doc["_id"]})
    return Recommendation.model_validate(refreshed)
