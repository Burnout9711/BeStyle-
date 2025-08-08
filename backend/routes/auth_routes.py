"""
Authentication routes for social media login and user management
"""
from fastapi import APIRouter, HTTPException, Header, Response, Cookie
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import asyncio

# Import models and services
from models.user import User, UserSession, AuthResponse, ProfileResponse
from services.auth_service import AuthService
from database import get_database

router = APIRouter(prefix="/api/auth", tags=["authentication"])

class AuthRequest(BaseModel):
    session_id: str

@router.post("/login", response_model=AuthResponse)
async def login_with_social(
    auth_request: AuthRequest,
    response: Response
):
    """
    Handle social media login via Emergent authentication
    """
    try:
        db = get_database()
        auth_service = AuthService(db)
        
        # Verify session with Emergent
        emergent_data = await auth_service.verify_emergent_session(auth_request.session_id)
        
        if not emergent_data:
            raise HTTPException(status_code=401, detail="Invalid session ID")
        
        # Create or get user
        user = await auth_service.create_or_get_user(emergent_data)
        
        if not user:
            raise HTTPException(status_code=500, detail="Failed to create/get user")
        
        # Get session token from Emergent data
        session_token = emergent_data.get('session_token')
        if not session_token:
            raise HTTPException(status_code=500, detail="No session token provided")
        
        # Create user session in our database
        user_session = await auth_service.create_user_session(user, session_token)
        
        if not user_session:
            raise HTTPException(status_code=500, detail="Failed to create user session")
        
        # Set secure HTTP-only cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            max_age=7 * 24 * 60 * 60,  # 7 days
            httponly=True,
            secure=True,
            samesite="strict"
        )
        
        return AuthResponse(
            success=True,
            message="Login successful",
            user=user,
            session_token=session_token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/profile", response_model=ProfileResponse)
async def get_user_profile(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    """
    Get user profile using session token
    """
    try:
        # Try to get session token from cookie first, then header
        token = session_token
        if not token and authorization:
            if authorization.startswith("Bearer "):
                token = authorization[7:]  # Remove "Bearer " prefix
        
        if not token:
            raise HTTPException(status_code=401, detail="No session token provided")
        
        db = get_database()
        auth_service = AuthService(db)
        
        # Validate session and get user
        user = await auth_service.validate_session_token(token)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired session token")
        
        return ProfileResponse(
            success=True,
            user=user,
            message="Profile retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

@router.post("/logout")
async def logout_user(
    response: Response,
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    """
    Logout user by invalidating session token
    """
    try:
        # Try to get session token from cookie first, then header
        token = session_token
        if not token and authorization:
            if authorization.startswith("Bearer "):
                token = authorization[7:]  # Remove "Bearer " prefix
        
        if not token:
            return JSONResponse(content={"success": True, "message": "Already logged out"})
        
        db = get_database()
        auth_service = AuthService(db)
        
        # Remove session from database
        await auth_service.logout_user(token)
        
        # Clear the cookie
        response.delete_cookie("session_token")
        
        return JSONResponse(content={"success": True, "message": "Logout successful"})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")

@router.get("/verify")
async def verify_session(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    """
    Verify if current session is valid
    """
    try:
        # Try to get session token from cookie first, then header
        token = session_token
        if not token and authorization:
            if authorization.startswith("Bearer "):
                token = authorization[7:]  # Remove "Bearer " prefix
        
        if not token:
            return JSONResponse(content={"valid": False, "message": "No session token"})
        
        db = get_database()
        auth_service = AuthService(db)
        
        # Validate session
        user = await auth_service.validate_session_token(token)
        
        if user:
            return JSONResponse(content={
                "valid": True, 
                "message": "Session is valid",
                "user": user.dict()
            })
        else:
            return JSONResponse(content={"valid": False, "message": "Invalid session"})
            
    except Exception as e:
        return JSONResponse(content={"valid": False, "message": f"Verification failed: {str(e)}"})