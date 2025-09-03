import os, secrets
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException
from database import get_collection
from models.session import SessionDoc, DEFAULT_TTL_DAYS
from bson import ObjectId

COLL = "sessions"
COOKIE_NAME = "sid"
SESSION_TTL_DAYS = int(os.getenv("SESSION_TTL_DAYS", str(DEFAULT_TTL_DAYS)))

def _new_session_id() -> str:
    # 32 bytes urlsafe token
    return secrets.token_urlsafe(32)

async def find_by_sid(sid: str) -> Optional[SessionDoc]:
    coll = get_collection(COLL)
    doc = await coll.find_one({"session_id": sid})
    return SessionDoc(**doc) if doc else None

async def create_session(ua: Optional[str] = None, ip: Optional[str] = None) -> SessionDoc:
    coll = get_collection(COLL)
    sid = _new_session_id()
    now = datetime.utcnow()
    doc = SessionDoc(
        session_id=sid,
        ua=ua,
        ip=ip,
        created_at=now,
        last_seen_at=now,
        expires_at=now + timedelta(days=SESSION_TTL_DAYS),
    )
    await coll.insert_one(doc.model_dump(by_alias=True))
    return doc

async def touch_session(sid: str) -> None:
    coll = get_collection(COLL)
    now = datetime.utcnow()
    await coll.update_one(
        {"session_id": sid},
        {"$set": {"last_seen_at": now, "expires_at": now + timedelta(days=SESSION_TTL_DAYS)}}
    )

async def attach_user(sid: str, user_id: str) -> None:
    coll = get_collection(COLL)
    await coll.update_one(
        {"session_id": sid},
        {"$set": {"user_id": ObjectId(user_id)}}
    )
