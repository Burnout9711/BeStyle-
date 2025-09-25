# services/user_service.py
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from database import get_collection
from models.user import User

import os
import httpx
import logging

USERS = "users"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"


async def upsert_user_from_google_userinfo(ui: Dict[str, Any]) -> User:
    """
    Upsert a user using Google OpenID userinfo dict.
    Prefers match by providers.google.sub, else (if verified) by email.
    Returns a User model.
    """
    if not ui or "sub" not in ui:
        raise HTTPException(400, "Invalid Google userinfo")

    sub = ui["sub"]
    email = (ui.get("email") or "").lower() or None
    email_verified = bool(ui.get("email_verified"))
    name = ui.get("name") or ui.get("given_name") or "New User"
    picture = ui.get("picture")

    coll = get_collection(USERS)

    # Ensure helpful indexes (no-op if already exist)
    try:
        await coll.create_index("email", unique=False)
        await coll.create_index("auth.providers.google.sub", unique=True, sparse=True)
    except Exception:
        pass

    now = datetime.utcnow()

    # 1) Try by google sub
    doc = await coll.find_one({"auth.google.id": ui["sub"]})
    if doc:
        # Update profile surface + google provider info
        await coll.update_one(
            {"_id": doc["_id"]},
            {"$set": {
                "name": name if name else doc.get("name"),
                "email": email if email else doc.get("email"),
                "avatar_url": picture or doc.get("avatar_url"),
                "email_verified": email_verified or doc.get("email_verified", False),
                "auth.providers.google": {
                    "sub": sub,
                    "email": email,
                    "email_verified": email_verified,
                    "name": name,
                    "picture": picture,
                    "last_login_at": now,
                },
                "last_login_at": now,
                "updated_at": now,
            }}
        )
        doc = await coll.find_one({"_id": doc["_id"]})
        return User.model_validate(doc) 

    # 2) Try to attach to existing account by verified email
    if email and email_verified:
      by_email = await coll.find_one({"email": email})
      if by_email:
        await coll.update_one(
          {"_id": by_email["_id"]},
          {"$set": {
            "name": name if name else by_email.get("name"),
            "avatar_url": picture or by_email.get("avatar_url"),
            "email_verified": True,
            # NEW: Set the provider string and the nested google object
            "auth.providers": "google", 
            "auth.google": {
                "sub": sub,
                "email": email,
                "email_verified": True,
                "name": name,
                "picture": picture,
                "last_login_at": now,
            },
            "last_login_at": now,
            "updated_at": now,
          }}
        )
        doc = await coll.find_one({"_id": by_email["_id"]})
        return User.model_validate(doc) # <--- Correct way

    # 3) Create new user
    payload: Dict[str, Any] = {
        "name": name,
        "email": email,
        "email_verified": email_verified,
        "avatar_url": picture,
        "auth": {
            "providers": "google",  # CORRECT: The provider is a simple string
            "google": {             # NEW: This is the nested Google data
                "sub": sub,
                "email": email,
                "email_verified": email_verified,
                "name": name,
                "picture": picture,
                "last_login_at": now,
            }
        },
        "created_at": now,
        "updated_at": now,
        "last_login_at": now,
    }


    # Validate and insert
    user = User.model_validate(payload)
    res = await coll.insert_one(user.model_dump(by_alias=True))
    created = await coll.find_one({"_id": res.inserted_id})
    return User.model_validate(created)


async def get_or_create_user_from_google(*, code: str, redirect_uri: str) -> User:
    """
    Full Google OAuth flow:
      - Exchange code for tokens
      - Fetch userinfo
      - Upsert user
    Returns User model.
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(500, "Google OAuth not configured")

    # Exchange code -> tokens
    async with httpx.AsyncClient(timeout=15) as client:
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        try:
            logger.error(f"Google token exchange successful: {token_resp.json()}")
            token_resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.error(f"Google token exchange failed: {e.response.text}")
            logger.error(f"data: {token_resp.data}")
            raise HTTPException(400, f"Google token exchange failed: {e.response.text}") from e

        token_payload = token_resp.json()
        access_token = token_payload.get("access_token")
        if not access_token:
            raise HTTPException(400, "Google token exchange did not return access_token")

        # Fetch userinfo (OpenID)
        ui_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        try:
            ui_resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(400, f"Google userinfo fetch failed: {e.response.text}") from e

        ui = ui_resp.json()

    # Upsert & return User
    return await upsert_user_from_google_userinfo(ui)
