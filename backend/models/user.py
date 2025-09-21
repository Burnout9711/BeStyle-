# models/user.py
from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId
from pydantic import BaseModel, Field, EmailStr, ConfigDict, BeforeValidator, field_serializer
from typing_extensions import Annotated

# --- ObjectId support for Pydantic v2 ---
def _coerce_object_id(v):
    if isinstance(v, ObjectId):
        return v
    if v is None:
        return ObjectId()
    if isinstance(v, str) and ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError("Invalid ObjectId")

PyObjectId = Annotated[ObjectId, BeforeValidator(_coerce_object_id)]
# ----------------------------------------

# 🔑 Authentication info (can extend for OAuth, etc.)
class AuthInfo(BaseModel):
    provider: str = "password"        # e.g., "password", "google", "apple"
    password_hash: Optional[str] = None
    oauth_id: Optional[str] = None

class Measurements(BaseModel):
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hip_cm: Optional[float] = None
    shoulder_cm: Optional[float] = None
    inseam_cm: Optional[float] = None

class Sizes(BaseModel):
    top: Optional[str] = None
    bottom: Optional[str] = None
    shoe: Optional[str] = None

class Profile(BaseModel):
    location: Optional[str] = None
    timezone: Optional[str] = None
    units: Dict[str, str] = Field(default_factory=lambda: {"length": "cm", "weight": "kg"})
    measurements: Measurements = Field(default_factory=Measurements)
    sizes: Sizes = Field(default_factory=Sizes)
    fit_preferences: List[str] = Field(default_factory=list)

class Style(BaseModel):
    current: List[str] = Field(default_factory=list)
    interested: List[str] = Field(default_factory=list)
    favorite_colors: List[str] = Field(default_factory=list)
    avoid_colors: List[str] = Field(default_factory=list)
    inspiration: Optional[str] = None
    goals: List[str] = Field(default_factory=list)

class Lifestyle(BaseModel):
    occupation: Optional[str] = None
    typical_week: List[str] = Field(default_factory=list)
    priority_occasions: List[str] = Field(default_factory=list)

class Notifications(BaseModel):
    channels: List[str] = Field(default_factory=lambda: ["in_app"])
    frequency: str = "weekly"         # daily | weekly | special
    product_alerts: bool = True

class User(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,        # lets you pass/emit `_id`
        arbitrary_types_allowed=True, # ObjectId allowed internally
        json_encoders={ObjectId: str},   # serialize ObjectId -> str in responses
    )

    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    email: EmailStr
    email_verified: bool = False
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    auth: AuthInfo = Field(default_factory=AuthInfo)
    profile: Profile = Field(default_factory=Profile)
    style: Style = Field(default_factory=Style)
    lifestyle: Lifestyle = Field(default_factory=Lifestyle)
    notifications: Notifications = Field(default_factory=Notifications)

    # --- Serialization: turn ObjectId into str ---
    @field_serializer("id", when_used="json")
    def serialize_id(self, v: ObjectId):
        return str(v)

class AuthResponse(BaseModel):
    """Response model for authentication endpoints"""
    success: bool
    message: str
    user: Optional[User] = None
    session_token: Optional[str] = None
    is_new_user: bool = False