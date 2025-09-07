# routes/user_routes.py
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from database import get_database
from models.user import User
from services.user_service import (
    get_user_by_id, create_user, patch_section, set_avatar_url, update_user_fields
)
from models.session import SessionDoc
from dependencies.session_dep import get_or_create_session

router = APIRouter(prefix="/api/user", tags=["user"])

# --- Helper: require logged-in user via session.user_id ---
def _require_user_id(session: SessionDoc) -> str:
    if not session.user_id:
        # Not logged in; you can change to 200 + anon profile if you support that
        raise HTTPException(status_code=401, detail="Login required")
    return str(session.user_id)

@router.get("/me", response_model=User)
async def me(session: SessionDoc = Depends(get_or_create_session)) -> User:
    user_id = _require_user_id(session)
    return await get_user_by_id(user_id)

@router.patch("/profile")
async def patch_profile(
    payload: Dict[str, Any],
    session: SessionDoc = Depends(get_or_create_session),
):
    """
    Accepts either full 'profile' object or dot-keys:
      { "profile": { "location": "Dubai", "measurements": { "height_cm": 185 } } }
      or
      { "profile.location": "Dubai", "profile.measurements.height_cm": 185 }
    """
    user_id = _require_user_id(session)
    if "profile" in payload and isinstance(payload["profile"], dict):
        await patch_section(user_id, "profile", payload["profile"])
    else:
        # assume dot-paths
        await update_user_fields(user_id, payload)
    return {"ok": True}

@router.patch("/style")
async def patch_style(
    payload: Dict[str, Any],
    session: SessionDoc = Depends(get_or_create_session),
):
    user_id = _require_user_id(session)
    if "style" not in payload:
        raise HTTPException(400, "Body must include 'style'")
    await patch_section(user_id, "style", payload["style"])
    return {"ok": True}

@router.patch("/lifestyle")
async def patch_lifestyle(
    payload: Dict[str, Any],
    session: SessionDoc = Depends(get_or_create_session),
):
    user_id = _require_user_id(session)
    if "lifestyle" not in payload:
        raise HTTPException(400, "Body must include 'lifestyle'")
    await patch_section(user_id, "lifestyle", payload["lifestyle"])
    return {"ok": True}

@router.patch("/notifications")
async def patch_notifications(
    payload: Dict[str, Any],
    session: SessionDoc = Depends(get_or_create_session),
):
    user_id = _require_user_id(session)
    if "notifications" not in payload:
        raise HTTPException(400, "Body must include 'notifications'")
    await patch_section(user_id, "notifications", payload["notifications"])
    return {"ok": True}

@router.post("/avatar")
async def upload_avatar(
    body: Dict[str, Any],
    session: SessionDoc = Depends(get_or_create_session),
):
    user_id = _require_user_id(session)
    url: Optional[str] = body.get("avatar_url")
    if not url:
        raise HTTPException(400, "avatar_url required")
    await set_avatar_url(user_id, url)
    return {"ok": True}

# (Optional) Admin/dev endpoints – remove or protect in production
@router.post("")
async def admin_create_user(
    body: Dict[str, Any],
):
    new_id = await create_user(body)
    return {"id": new_id}

@router.patch("")
async def admin_patch(
    body: Dict[str, Any],
    session: SessionDoc = Depends(get_or_create_session),
):
    """
    Generic dot-path patch: { "name": "Abhishek", "style.current": ["Minimalist"] }
    """
    user_id = _require_user_id(session)
    await update_user_fields(user_id, body)
    return {"ok": True}
