from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException
from passlib.context import CryptContext
from bson import ObjectId

from database import get_collection
from models.user import User
from services.session_service import attach_user

USERS = "users"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _norm_email(email: str) -> str:
    return email.strip().lower()

async def _find_by_email(email: str) -> Optional[User]:
    coll = get_collection(USERS)
    doc = await coll.find_one({"email": _norm_email(email)})
    return User(**doc) if doc else None

async def signup_user(payload: Dict[str, Any], sid: Optional[str]) -> User:
    """
    Create a user, hash password, and attach current anon session to the user.
    payload: { name, email, password }
    """
    email = _norm_email(payload.get("email", ""))
    name  = payload.get("name") or None
    password = payload.get("password")
    if not email or not password:
        raise HTTPException(400, "email and password are required")

    if await _find_by_email(email):
        raise HTTPException(400, "Email already in use")

    coll = get_collection(USERS)
    user = User(
        email=email,
        name=name,
    )
    doc = user.model_dump(by_alias=True)
    doc["auth"]["password_hash"] = pwd.hash(password)
    await coll.insert_one(doc)

    # link session to this user
    if sid:
        await attach_user(sid, str(doc["_id"]))

    return User(**doc)

async def login_user(email: str, password: str, sid: Optional[str]) -> User:
    user = await _find_by_email(email)
    if not user or not user.auth.password_hash or not pwd.verify(password, user.auth.password_hash):
        raise HTTPException(401, "Invalid email or password")

    # link session to this user (upgrade anon -> logged in)
    if sid:
        await attach_user(sid, str(user.id))
    return user
