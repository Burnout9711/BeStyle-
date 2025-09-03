import logging
import os
from typing import Optional
from fastapi import Depends, Cookie, Response, Request
from services.session_service import find_by_sid, create_session, touch_session, COOKIE_NAME

COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

async def get_or_create_session(
    response: Response,
    request: Request,
    sid: Optional[str] = Cookie(default=None, alias=COOKIE_NAME),
):
    # Try existing
    if sid:
        sess = await find_by_sid(sid)
        if sess:
            await touch_session(sid)
            return sess

    # Create new
    ua = request.headers.get("user-agent")
    ip = request.client.host if request.client else None
    sess = await create_session(ua=ua, ip=ip)

    # set httpOnly cookie
    response.set_cookie(
        key=COOKIE_NAME,
        value=sess.session_id,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        max_age=60 * 60 * 24 * 14,  # 14 days (matching TTL)
        path="/",
    )
    logging.info(f"Now returning session: {sess.session_id}")
    return sess
