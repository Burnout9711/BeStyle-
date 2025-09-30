# services/auth_google_service.py
import os
from typing import Optional, Tuple
from urllib.parse import urlencode

from fastapi import HTTPException
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from services.session_service import (
    create_session,
    attach_user,
    set_session_fields,
    pop_session_field,
)
from services.user_service import get_or_create_user_from_google  # you should already have this
# or whatever you named your upsert logic

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")  # e.g. http://localhost:8000/api/auth/google/callback
GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_SCOPE = "openid email profile"
# If you use Google token exchange, you’ll likely also need TOKEN endpoint + client secret in another helper.

class StartLoginResult(BaseModel):
    sid: str
    redirect_url: str

class CallbackResult(BaseModel):
    sid: str
    user_id: str
    redirect_to: str

def _build_google_auth_url(*, state: str) -> str:
    if not GOOGLE_CLIENT_ID or not GOOGLE_REDIRECT_URI:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured")
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": GOOGLE_SCOPE,
        "state": state,  # we store sid here
        "prompt": "consent",          # tweak: none/consent/select_account
        "access_type": "offline",     # if you want refresh token
        "include_granted_scopes": "true",
    }
    return f"{GOOGLE_AUTH_ENDPOINT}?{urlencode(params)}"

async def start_login(*, ua: Optional[str], ip: Optional[str], redirect_to: str) -> StartLoginResult:
    # 1) create an app session (sid)
    sess = await create_session(ua=ua, ip=ip)
    # 2) remember where to send the browser after callback
    await set_session_fields(sess.session_id, {"redirect_to": redirect_to})
    # 3) build Google URL with state=sid
    url = _build_google_auth_url(state=sess.session_id)
    return StartLoginResult(sid=sess.session_id, redirect_url=url)

async def handle_callback(*, state: str, code: str) -> CallbackResult:
    # state = sid
    sid = state
    # 1) exchange the code -> id_token/profile (you implement this)
    #    For brevity we’ll assume your user service can do it and return user dict with _id.
    logger.info(f"Handling Google callback with code: {code} and state (sid): {state}")
    logger.info("Exchanging code for user info...")
    user = await get_or_create_user_from_google(code=code, redirect_uri=GOOGLE_REDIRECT_URI)
    if not user or not user.get("_id"):
        raise HTTPException(status_code=401, detail="Google login failed")
    logger.info("get or create done")
    # 2) attach user to the session
    await attach_user(sid, str(user["_id"]))

    # 3) pop the redirect_to we saved in start_login()
    redirect_to = await pop_session_field(sid, "redirect_to") or "/profile"

    return CallbackResult(sid=sid, user_id=str(user["_id"]), redirect_to=redirect_to)
