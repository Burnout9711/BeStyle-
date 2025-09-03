# models/session.py
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId

from pydantic import BaseModel, Field, BeforeValidator, field_serializer, ConfigDict
from typing_extensions import Annotated

# ---- Pydantic v2 helpers for ObjectId ----
def _coerce_object_id(v):
    if isinstance(v, ObjectId):
        return v
    if v is None:
        return ObjectId()
    if isinstance(v, str) and ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError("Invalid ObjectId")

PyObjectId = Annotated[ObjectId, BeforeValidator(_coerce_object_id)]
# ------------------------------------------

DEFAULT_TTL_DAYS = 14

class SessionDoc(BaseModel):
    # v2 config: allow arbitrary types (like bson.ObjectId)
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    session_id: str
    user_id: Optional[PyObjectId] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=DEFAULT_TTL_DAYS))

    # Optional diagnostics
    ua: Optional[str] = None
    ip: Optional[str] = None

    # serialize _id and user_id as strings in JSON
    @field_serializer("id", when_used="json")
    def _ser_id(self, v: ObjectId):
        return str(v)

    @field_serializer("user_id", when_used="json")
    def _ser_user_id(self, v: Optional[ObjectId]):
        return str(v) if v else None


# Optional: meta used by your auto-index routine
class SessionMeta:
    collection = "sessions"
    indexes = [
        {"keys": [("session_id", 1)], "unique": True},
        {"keys": [("user_id", 1)]},
        {"keys": [("last_seen_at", -1)]},
        {"keys": [("expires_at", 1)], "expireAfterSeconds": 0},  # TTL
    ]
