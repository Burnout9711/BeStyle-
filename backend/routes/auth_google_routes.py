# routes/auth_google_routes.py
from fastapi import APIRouter, Request, Response, HTTPException, Query
from fastapi.responses import RedirectResponse, JSONResponse
from typing import Optional
import os

from services.auth_google_service import start_login, handle_callback
from services.session_service import COOKIE_NAME

router = APIRouter(prefix="/api/auth/google", tags=["auth"])

# You can control cookie security from env without touching code
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"  # set True in prod (https)
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "Lax")                  # 'Lax' | 'Strict' | 'None'
COOKIE_MAX_AGE = int(os.getenv("COOKIE_MAX_AGE_SECONDS", str(60 * 60 * 24 * 30)))  # 30 days

@router.get("/login")
async def google_login(
    request: Request,
    response: Response,
    redirect: Optional[str] = Query(None, description="Where to send the user after Google callback"),
):
    """
    Starts Google OAuth:
      1) Creates a backend session (sid)
      2) Stores the intended 'redirect' in that session
      3) Redirects the browser to Google (307)
      4) Sets the 'sid' cookie immediately so callback can correlate the same browser
    """
    try:
        ua = request.headers.get("user-agent", "")
        ip = request.client.host if request.client else None
        # Fallback if no redirect provided
        redirect_to = redirect or os.getenv("DEFAULT_POST_LOGIN_REDIRECT", "/profile")

        result = await start_login(ua=ua, ip=ip, redirect_to=redirect_to)

        # Prepare a 307 to Google's consent screen
        redir = RedirectResponse(url=result.redirect_url, status_code=307)
        redir.set_cookie(
            key=COOKIE_NAME,
            value=result.sid,
            httponly=True,
            secure=COOKIE_SECURE,
            samesite=COOKIE_SAMESITE,  # 'Lax' recommended; use 'None' for cross-site if needed (with secure=True)
            max_age=COOKIE_MAX_AGE,
            path="/",
        )
        return redir

    except HTTPException:
        raise
    except Exception as e:
        # Return a small JSON error instead of a blank 500
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed to start Google login: {str(e)}"},
        )


@router.get("/callback")
async def google_callback(
    request: Request,
    response: Response,
    state: str = Query(..., description="Opaque state we set to sid"),
    code: str = Query(..., description="Authorization code from Google"),
):
    """
    Completes Google OAuth:
      1) Exchanges 'code' for Google user info (handled in service)
      2) Upserts/gets your User
      3) Attaches the user to the session identified by 'state' (sid)
      4) Redirects the browser to the original 'redirect' we saved earlier
      5) Re-sets the 'sid' cookie (refresh cookie TTL)
    """
    try:
        result = await handle_callback(state=state, code=code)

        redir = RedirectResponse(url=result.redirect_to, status_code=307)
        redir.set_cookie(
            key=COOKIE_NAME,
            value=result.sid,
            httponly=True,
            secure=COOKIE_SECURE,
            samesite=COOKIE_SAMESITE,
            max_age=COOKIE_MAX_AGE,
            path="/",
        )
        return redir

    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Google callback failed: {str(e)}"},
        )
