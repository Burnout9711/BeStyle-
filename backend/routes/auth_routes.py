"""
Enhanced Authentication routes for social media login and comprehensive user profile management
"""
from fastapi import APIRouter, HTTPException, Header, Response, Cookie, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import asyncio

# Import models and services
from models.user import User, UserSession, AuthResponse, ProfileResponse, ProfileUpdateRequest
from services.auth_service import AuthService
from database import get_database

router = APIRouter(prefix="/api/auth", tags=["authentication"])

class AuthRequest(BaseModel):
    session_id: str

def get_request_info(request: Request) -> dict:
    """Extract request information for tracking"""
    return {
        'ip_address': request.client.host if request.client else None,
        'user_agent': request.headers.get('user-agent')
    }

@router.post("/login", response_model=AuthResponse)
async def login_with_social(
    auth_request: AuthRequest,
    request: Request,
    response: Response
):
    """
    Enhanced social media login via Emergent authentication with comprehensive profile creation
    """
    try:
        db = get_database()
        auth_service = AuthService(db)
        
        # Get request information for tracking
        request_info = get_request_info(request)
        
        # Verify session with Emergent
        emergent_data = await auth_service.verify_emergent_session(auth_request.session_id)
        
        if not emergent_data:
            raise HTTPException(status_code=401, detail="Invalid session ID")
        
        # Create or update user with enhanced profile data
        user, is_new_user = await auth_service.create_or_update_user(emergent_data, request_info)
        
        if not user:
            raise HTTPException(status_code=500, detail="Failed to create/update user profile")
        
        # Get session token from Emergent data
        session_token = emergent_data.get('session_token')
        if not session_token:
            raise HTTPException(status_code=500, detail="No session token provided")
        
        # Detect provider from emergent data
        provider = auth_service._detect_provider_from_emergent_data(emergent_data)
        
        # Create user session in our database with enhanced tracking
        user_session = await auth_service.create_user_session(user, session_token, provider, request_info)
        
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
            message="Login successful" if not is_new_user else "Welcome! Your profile has been created.",
            user=user,
            session_token=session_token,
            is_new_user=is_new_user
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
    Get comprehensive user profile with completion percentage and detailed information
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
        
        # Calculate profile completion
        completion_percentage = auth_service._calculate_profile_completion(user)
        
        return ProfileResponse(
            success=True,
            user=user,
            message="Profile retrieved successfully",
            profile_completion_percentage=completion_percentage
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

@router.put("/profile", response_model=ProfileResponse)
async def update_user_profile(
    profile_update: ProfileUpdateRequest,
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    """
    Update user profile information
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
        
        # Validate session and get current user
        current_user = await auth_service.validate_session_token(token)
        
        if not current_user:
            raise HTTPException(status_code=401, detail="Invalid or expired session token")
        
        # Prepare update data
        update_data = {}
        if profile_update.name:
            update_data['name'] = profile_update.name
        if profile_update.preferences:
            update_data['preferences'] = profile_update.preferences.dict()
        
        # Update user profile
        updated_user = await auth_service.update_user_profile(current_user.id, update_data)
        
        if not updated_user:
            raise HTTPException(status_code=500, detail="Failed to update profile")
        
        # Calculate new completion percentage
        completion_percentage = auth_service._calculate_profile_completion(updated_user)
        
        return ProfileResponse(
            success=True,
            user=updated_user,
            message="Profile updated successfully",
            profile_completion_percentage=completion_percentage
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.get("/profile/detailed")
async def get_detailed_profile(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    """
    Get detailed profile information including login history and social connections
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
        
        # Calculate profile completion
        completion_percentage = auth_service._calculate_profile_completion(user)
        
        # Return detailed profile information
        return JSONResponse(content={
            "success": True,
            "user": user.dict(),
            "profile_completion": completion_percentage,
            "login_stats": {
                "total_logins": user.login_count,
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "account_age_days": (datetime.utcnow() - user.created_at).days if user.created_at else 0,
                "primary_provider": user.primary_provider,
                "connected_providers": [profile.provider for profile in user.social_profiles]
            },
            "recent_logins": [
                {
                    "provider": login.provider,
                    "login_time": login.login_time.isoformat(),
                    "ip_address": login.ip_address
                }
                for login in user.login_history[-10:]  # Last 10 logins
            ]
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get detailed profile: {str(e)}")

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
    Verify if current session is valid with enhanced user information
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
            completion_percentage = auth_service._calculate_profile_completion(user)
            return JSONResponse(content={
                "valid": True, 
                "message": "Session is valid",
                "user": user.dict(),
                "profile_completion": completion_percentage,
                "is_new_user": user.login_count == 1
            })
        else:
            return JSONResponse(content={"valid": False, "message": "Invalid session"})
            
    except Exception as e:
        return JSONResponse(content={"valid": False, "message": f"Verification failed: {str(e)}"})