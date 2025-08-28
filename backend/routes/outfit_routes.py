from fastapi import APIRouter, HTTPException, Depends
from services.outfit_service import (
    create_outfit,
    get_outfit,
    get_all_outfits,
    update_outfit,
    delete_outfit,
)
from models.outfit import Outfit
from typing import List

router = APIRouter(prefix="/api/outfits", tags=["Outfits"])

@router.post("/", response_model=Outfit)
async def create_outfit_route(outfit: Outfit):
    result = await create_outfit(outfit.dict())
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create outfit")
    return result

@router.get("/", response_model=List[Outfit])
async def get_all_outfits_route():
    return await get_all_outfits()

@router.get("/{outfit_id}", response_model=Outfit)
async def get_outfit_route(outfit_id: str):
    outfit = await get_outfit(outfit_id)
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return outfit

@router.put("/{outfit_id}", response_model=Outfit)
async def update_outfit_route(outfit_id: str, outfit: Outfit):
    updated = await update_outfit(outfit_id, outfit.dict())
    if not updated:
        raise HTTPException(status_code=404, detail="Outfit not found or not updated")
    return updated

@router.delete("/{outfit_id}")
async def delete_outfit_route(outfit_id: str):
    deleted = await delete_outfit(outfit_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Outfit not found or not deleted")
    return {"success": True}