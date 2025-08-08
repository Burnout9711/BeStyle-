"""
User models for authentication and profile management
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid

class User(BaseModel):
    """User model for storing user information"""
    id: str = None
    email: EmailStr
    name: str
    picture: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None
    
    def __init__(self, **data):
        if 'id' not in data or data['id'] is None:
            data['id'] = str(uuid.uuid4())
        if 'created_at' not in data:
            data['created_at'] = datetime.utcnow()
        if 'updated_at' not in data:
            data['updated_at'] = datetime.utcnow()
        super().__init__(**data)

class UserSession(BaseModel):
    """User session model for managing authentication sessions"""
    session_token: str
    user_id: str
    created_at: datetime = None
    expires_at: datetime = None
    
    def __init__(self, **data):
        if 'created_at' not in data:
            data['created_at'] = datetime.utcnow()
        if 'expires_at' not in data:
            # Session expires in 7 days
            from datetime import timedelta
            data['expires_at'] = datetime.utcnow() + timedelta(days=7)
        super().__init__(**data)

class AuthResponse(BaseModel):
    """Response model for authentication endpoints"""
    success: bool
    message: str
    user: Optional[User] = None
    session_token: Optional[str] = None

class ProfileResponse(BaseModel):
    """Response model for profile endpoints"""
    success: bool
    user: Optional[User] = None
    message: str = ""