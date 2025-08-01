from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

class WaitlistEntry(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    email: EmailStr
    source: str = "landing_page"  # landing_page, quiz_complete, etc.
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class WaitlistSubscribeRequest(BaseModel):
    email: EmailStr
    source: Optional[str] = "landing_page"
    metadata: Optional[Dict[str, Any]] = None

class WaitlistResponse(BaseModel):
    success: bool
    message: str
    position: Optional[int] = None

class WaitlistStats(BaseModel):
    total_subscribers: int
    recent_signups: int  # Last 24 hours
    growth_rate: float  # Weekly growth percentage