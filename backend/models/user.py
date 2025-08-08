"""
User models for authentication and profile management
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

class LoginHistory(BaseModel):
    """Model for tracking user login history"""
    provider: str  # 'google', 'facebook', 'linkedin', 'emergent'
    provider_id: Optional[str] = None  # ID from the provider
    login_time: datetime = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    def __init__(self, **data):
        if 'login_time' not in data:
            data['login_time'] = datetime.utcnow()
        super().__init__(**data)

class SocialProfile(BaseModel):
    """Model for storing social media profile information"""
    provider: str  # 'google', 'facebook', 'linkedin'
    provider_id: str
    provider_email: str
    provider_name: str
    provider_picture: Optional[str] = None
    connected_at: datetime = None
    last_used: datetime = None
    
    def __init__(self, **data):
        if 'connected_at' not in data:
            data['connected_at'] = datetime.utcnow()
        if 'last_used' not in data:
            data['last_used'] = datetime.utcnow()
        super().__init__(**data)

class UserPreferences(BaseModel):
    """Model for storing user preferences and settings"""
    notification_email: bool = True
    newsletter_subscription: bool = False
    privacy_level: str = "standard"  # 'minimal', 'standard', 'full'
    preferred_language: str = "en"
    timezone: Optional[str] = None

class User(BaseModel):
    """Enhanced User model for comprehensive profile management"""
    id: str = None
    email: EmailStr
    name: str
    picture: Optional[str] = None
    
    # Profile metadata
    created_at: datetime = None
    updated_at: datetime = None
    last_login: Optional[datetime] = None
    login_count: int = 0
    
    # Social media profiles
    social_profiles: List[SocialProfile] = []
    primary_provider: Optional[str] = None  # The main social media provider used
    
    # Login history
    login_history: List[LoginHistory] = []
    
    # User preferences
    preferences: UserPreferences = UserPreferences()
    
    # Profile status
    is_active: bool = True
    email_verified: bool = False
    profile_completed: bool = False
    
    def __init__(self, **data):
        if 'id' not in data or data['id'] is None:
            data['id'] = str(uuid.uuid4())
        if 'created_at' not in data:
            data['created_at'] = datetime.utcnow()
        if 'updated_at' not in data:
            data['updated_at'] = datetime.utcnow()
        super().__init__(**data)

class UserSession(BaseModel):
    """Enhanced User session model for managing authentication sessions"""
    session_token: str
    user_id: str
    provider: Optional[str] = None  # Track which provider was used for this session
    created_at: datetime = None
    expires_at: datetime = None
    last_activity: datetime = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    def __init__(self, **data):
        if 'created_at' not in data:
            data['created_at'] = datetime.utcnow()
        if 'last_activity' not in data:
            data['last_activity'] = datetime.utcnow()
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
    is_new_user: bool = False

class ProfileResponse(BaseModel):
    """Enhanced response model for profile endpoints"""
    success: bool
    user: Optional[User] = None
    message: str = ""
    profile_completion_percentage: int = 0

class ProfileUpdateRequest(BaseModel):
    """Model for profile update requests"""
    name: Optional[str] = None
    preferences: Optional[UserPreferences] = None