from datetime import datetime
from typing import Annotated, Optional, Dict, Any
from pydantic import BaseModel, BeforeValidator, Field, EmailStr
from bson import ObjectId

# class PyObjectId(ObjectId):
#     @classmethod
#     def __get_validators__(cls):
#         yield cls.validate

#     @classmethod
#     def validate(cls, v):
#         if not ObjectId.is_valid(v):
#             raise ValueError("Invalid objectid")
#         return ObjectId(v)

#     @classmethod
#     def __get_pydantic_json_schema__(cls, field_schema):
#         field_schema.update(type="string")
#         return field_schema
def _coerce_object_id(v):
    if isinstance(v, ObjectId):
        return v
    if isinstance(v, str) and ObjectId.is_valid(v):
        return ObjectId(v)
    if v is None:
        return ObjectId()
    raise ValueError("Invalid ObjectId")

PyObjectId = Annotated[ObjectId, BeforeValidator(_coerce_object_id)]

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

class WaitlistMeta:
    collection = "waitlist"
    indexes = [
        {"keys": [("email", 1)], "unique": True},
        {"keys": [("created_at", 1)]},
        {"keys": [("source", 1)]},
    ]