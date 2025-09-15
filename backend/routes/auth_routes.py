import logging
from typing import Optional
from fastapi import APIRouter, Request, Depends, Header, HTTPException, Cookie, Response
from pydantic import BaseModel, EmailStr
from services.auth_service import signup_user, login_user
from dependencies.session_dep import get_or_create_session
from models.session import SessionDoc
from models.user import User
from services.session_service import COOKIE_NAME
from fastapi.responses import JSONResponse
from services.session_service import find_by_sid
from services.user_service import get_user_by_id

router = APIRouter(prefix="/api/auth", tags=["auth"])

class SignupIn(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class VerifyResponse(BaseModel):
    valid: bool
    user: Optional[User] = None


@router.post("/signup", response_model=User)
async def signup(body: SignupIn, session: SessionDoc = Depends(get_or_create_session)):
    user = await signup_user(body.model_dump(), session.session_id)
    return user

@router.post("/login", response_model=User)
async def login(body: LoginIn, session: SessionDoc = Depends(get_or_create_session)):
    user = await login_user(body.email, body.password, session.session_id)
    return user

@router.post("/logout")
async def logout(response: Response):
    # Clear the sid cookie ONLY if you want logouts to start a fresh anon session next request.
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}

@router.get("/me", response_model=User)
async def me(session: SessionDoc = Depends(get_or_create_session)):
    if not session.user_id:
        raise HTTPException(401, "Not logged in")
    # lazy import to avoid cycles
    from services.user_service import get_user_by_id
    return await get_user_by_id(str(session.user_id))

@router.get("/verify", response_model=VerifyResponse)
async def verify_session_endpoint(request: Request):
    # This single change will fix the issue
    logging.info(f"Verifying session with sid: {request}")
    sid = request.cookies.get("sid") 
    if not sid:
        return VerifyResponse(valid=False, user=None)
    
    # Now, use `sid` to look up the user in your session store
    logging.info(f"Session ID from cookie: {sid}")
    session_data = await find_by_sid(sid.__str__())
    logging.info(f"Session data found: {session_data}")
    user_data = await get_user_by_id(str(session_data.user_id)) if session_data and session_data.user_id else None
    logging.info(f"User data found: {user_data}")
    if user_data:
        user_model = User(
            id=user_data.id,
            name=user_data.name,
            email=user_data.email
        )
        return VerifyResponse(valid=True, user=user_model)
    else:
        return VerifyResponse(valid=False, user=None)