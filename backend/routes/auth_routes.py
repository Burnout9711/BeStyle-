from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Cookie, Response
from pydantic import BaseModel, EmailStr
from services.auth_service import signup_user, login_user
from dependencies.session_dep import get_or_create_session
from models.session import SessionDoc
from models.user import User
from services.session_service import COOKIE_NAME

router = APIRouter(prefix="/api/auth", tags=["auth"])

class SignupIn(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

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
