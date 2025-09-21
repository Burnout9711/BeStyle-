from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from models.outfit_generation import GenerateOutfitsRequest, GenerateOutfitsResponse, OutfitCard
from services.recommendation_engine import RecommendationEngine
from services.user_outfit_service import UserOutfitService
from dependencies.session_dep import get_or_create_session
from models.session import SessionDoc
from database import get_database

router = APIRouter(prefix="/api/generate", tags=["generate"])

@router.post("/outfits", response_model=GenerateOutfitsResponse)
async def generate_outfits(
    body: GenerateOutfitsRequest,
    session: SessionDoc = Depends(get_or_create_session),
):
    if not session.session_id:
        raise HTTPException(400, "Missing session")

    engine = RecommendationEngine()
    outfits = await engine.generate_outfits_from_answers(body.answers.model_dump(), count=body.count)
    print("Generated outfits:", outfits)
    saved = False
    if body.save:
        svc = UserOutfitService(get_database())
        await svc.save_generated_outfits(
            outfits=outfits,
            user_id=str(session.user_id) if session.user_id else None,
            session_id=session.session_id,
            source="generated",
        )
        saved = True

    # Convert dicts to wire model
    cards: List[OutfitCard] = [OutfitCard(**o) for o in outfits]
    return GenerateOutfitsResponse(items=cards, saved=saved)
