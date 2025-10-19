from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List
from models.outfit_generation import GenerateOutfitsRequest, GenerateOutfitsResponse, OutfitCard
from services.recommendation_engine import RecommendationEngine
from services.user_outfit_service import UserOutfitService
from dependencies.session_dep import get_or_create_session
from models.session import SessionDoc
from database import get_database
from models.product_links import GenerateOutfitsWithLinksResponse
from services.link_enrichment_service import LinkEnrichmentService
from services.serpapi_provider import SerpApiShoppingProvider
import logging

logger = logging.getLogger(__name__)

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

@router.post("/outfits-with-links", response_model=GenerateOutfitsWithLinksResponse)
async def generate_outfits_with_links(
    body: GenerateOutfitsRequest,
    background: BackgroundTasks,
    session: SessionDoc = Depends(get_or_create_session),
):
    if not session.session_id:
        raise HTTPException(400, "Missing session")

    logger.info(f"Generating outfits with links for session {session.session_id}, user {session.user_id}")  
    engine = RecommendationEngine()
    outfits = await engine.generate_from_answers_ai_for_serp(body.answers.model_dump())
    logger.info(f"Generated {len(outfits)} outfits")
    logger.info(f"Outfit IDs: {[o for o in outfits]}")

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

    # Enrich with shopping links (synchronously or background).
    # If you prefer NOT to block, move this block into a background task.
    db = get_database()
    enrichment = LinkEnrichmentService(db, provider=SerpApiShoppingProvider())
    links = await enrichment.enrich_outfits(
        outfits=outfits,
        user_id=str(session.user_id) if session.user_id else None,
        session_id=session.session_id
    )
    logger.info(f"Enriched {len(links)} outfits with product links")
    logger.info(f"Outfit IDs with links: {[l.outfit_id for l in links]}")
    return GenerateOutfitsWithLinksResponse(
        items=outfits,    # list of dicts compatible with your OutfitCard
        links=links,
        saved=saved
    )
