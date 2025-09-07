# services/user_service.py
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from database import get_collection
from models.user import User

USERS = "users"

def _oid(user_id: str) -> ObjectId:
    try:
        return ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")

def _flatten(prefix: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Turn {"a": {"b": 1}} into {"a.b": 1} for $set updates."""
    out: Dict[str, Any] = {}
    for k, v in data.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out.update(_flatten(key, v))
        else:
            out[key] = v
    return out

async def get_user_by_id(user_id: str) -> User:
    coll = get_collection(USERS)
    doc = await coll.find_one({"_id": _oid(user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**doc)

async def get_user_by_email(email: str) -> Optional[User]:
    coll = get_collection(USERS)
    doc = await coll.find_one({"email": email.lower()})
    return User(**doc) if doc else None

async def create_user(payload: Dict[str, Any]) -> str:
    """Minimal create (for admin/seeding). For signup, use your auth flow."""
    coll = get_collection(USERS)
    if "email" not in payload:
        raise HTTPException(400, "email required")
    if await coll.find_one({"email": payload["email"].lower()}):
        raise HTTPException(400, "Email already exists")
    # Let Pydantic validate/shape the document
    user = User(**payload)
    res = await coll.insert_one(user.model_dump(by_alias=True))
    return str(res.inserted_id)

async def update_user_fields(user_id: str, fields: Dict[str, Any]) -> None:
    """$set arbitrary (already flattened) fields; touches updated_at."""
    if not fields:
        return
    coll = get_collection(USERS)
    fields["updated_at"] = datetime.utcnow()
    await coll.update_one({"_id": _oid(user_id)}, {"$set": fields})

async def patch_section(user_id: str, section: str, data: Dict[str, Any]) -> None:
    """PATCH a top-level section (profile/style/lifestyle/notifications)."""
    flattened = _flatten(section, data)
    await update_user_fields(user_id, flattened)

async def set_avatar_url(user_id: str, url: str) -> None:
    await update_user_fields(user_id, {"avatar_url": url})

async def change_password_hash(user_id: str, password_hash: str) -> None:
    await update_user_fields(user_id, {"auth.password_hash": password_hash})
