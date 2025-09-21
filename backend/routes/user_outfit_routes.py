import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from dependencies.session_dep import get_or_create_session
from models.session import SessionDoc
from services.user_outfit_service import UserOutfitService
from services.recommendation_engine import RecommendationEngine
from database import get_database

router = APIRouter(prefix="/api/user/outfits", tags=["user-outfits"])

class GenerateRequest(BaseModel):
    # You can pass quiz answers or a session id (if you already stored quiz in DB).
    # Using session-based quiz state in your QuizService is fine; adjust as needed.
    session_id: Optional[str] = None
    # Optional overrides to influence generation (occasion, colors, etc.)
    overrides: Optional[Dict[str, Any]] = None

@router.get("/")
async def list_outfits(
    favorite: Optional[bool] = None,
    limit: int = 50,
    skip: int = 0,
    session: SessionDoc = Depends(get_or_create_session),
):

    logging.info("we are here in list outfits  ")
    if not session.user_id and not session.session_id:
        raise HTTPException(400, "No active session")

    svc = UserOutfitService(get_database())
    items = await svc.list_outfits(
        user_id=str(session.user_id) if session.user_id else None,
        session_id=session.session_id if not session.user_id else None,
        favorite=favorite,
        limit=limit,
        skip=skip,
    )
    logging.info(f"Listed {len(items)} outfits for user_id={session.user_id} session_id={session.session_id}")  
    return {"items": [i.model_dump(by_alias=True) for i in items]}

@router.post("/generate")
async def generate_and_save(
    body: GenerateRequest,
    session: SessionDoc = Depends(get_or_create_session),
):
    # Resolve the context to generate recommendations
    ctx_session_id = body.session_id or session.session_id
    if not ctx_session_id:
        raise HTTPException(400, "Session context required")

    # 1) generate outfits (use your existing engine)
    engine = RecommendationEngine()
    # You likely already have quiz answers in DB keyed by session_id via QuizService
    # Adjust this call to your engine signature:
    outfits: List[Dict[str, Any]] = await engine.generate_outfits_for_session(ctx_session_id, overrides=body.overrides or {})

    # 2) save snapshots to history
    svc = UserOutfitService(get_database())
    saved = await svc.save_generated_outfits(
        outfits=outfits,
        user_id=str(session.user_id) if session.user_id else None,
        session_id=session.session_id,
        source="generated",
    )
    return {"items": [s.model_dump(by_alias=True) for s in saved]}

class FavoriteRequest(BaseModel):
    favorite: bool

@router.post("/{outfit_id}/favorite")
async def set_favorite(
    outfit_id: str,
    body: FavoriteRequest,
    session: SessionDoc = Depends(get_or_create_session),
):
    if not session.user_id:
        raise HTTPException(401, "Login required")

    svc = UserOutfitService(get_database())
    ok = await svc.set_favorite(user_id=str(session.user_id), outfit_id=outfit_id, favorite=body.favorite)
    if not ok:
        raise HTTPException(404, "Outfit not found")
    return {"ok": True}

@router.delete("/{outfit_id}")
async def delete_outfit(
    outfit_id: str,
    session: SessionDoc = Depends(get_or_create_session),
):
    if not session.user_id:
        raise HTTPException(401, "Login required")

    svc = UserOutfitService(get_database())
    ok = await svc.delete_outfit(user_id=str(session.user_id), outfit_id=outfit_id)
    if not ok:
        raise HTTPException(404, "Outfit not found")
    return {"ok": True}

@router.post("/save-one")
async def save_one(
    outfit: Dict[str, Any],
    session: SessionDoc = Depends(get_or_create_session),
):
    svc = UserOutfitService(get_database())
    saved = await svc.save_generated_outfits(
        outfits=[outfit],
        user_id=str(session.user_id) if session.user_id else None,
        session_id=session.session_id,
        source="generated",
    )
    return saved[0].model_dump(by_alias=True)
