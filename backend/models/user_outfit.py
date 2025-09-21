# models/user_outfit.py
from __future__ import annotations
from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from .objectid import PyObjectId

class UserOutfit(BaseModel):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    user_id: Optional[PyObjectId] = None
    session_id: Optional[str] = None
    source: str = "generated"

    # snapshot of the generated outfit (what you show to the user)
    outfit: Dict[str, Any]

    # useful top-level fields for filtering/sorting
    occasion: Optional[str] = None
    title: Optional[str] = None
    confidence: Optional[int] = None
    color: Optional[str] = None
    favorite: bool = False

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,           # allow `_id` in/out
        arbitrary_types_allowed=True,    # allow ObjectId in runtime
        json_encoders={ObjectId: str},   # serialize ObjectId -> str in responses
    )
