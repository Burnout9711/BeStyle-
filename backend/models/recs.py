# models/recs.py
from __future__ import annotations
from datetime import datetime
from typing import Any, List, Optional, Literal
from pydantic import BaseModel, Field, AnyUrl, EmailStr, ConfigDict
from bson import ObjectId
from typing_extensions import Annotated
from pydantic import BeforeValidator

def _coerce_object_id(v):
    if isinstance(v, ObjectId): return v
    if v is None: return ObjectId()
    if isinstance(v, str) and ObjectId.is_valid(v): return ObjectId(v)
    raise ValueError("Invalid ObjectId")
PyObjectId = Annotated[ObjectId, BeforeValidator(_coerce_object_id)]

class SuggestionItem(BaseModel):
    label: str                                   # "White Oxford Shirt"
    category: Optional[str] = None               # "shirt"
    color: Optional[str] = None                  # "white"
    brand_pref: List[str] = []                   # ["Uniqlo","H&M"]
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    notes: Optional[str] = None                  # fits, fabrics, etc.

class ProductLink(BaseModel):
    title: str
    url: AnyUrl
    price: Optional[float] = None
    currency: Optional[str] = None
    image_url: Optional[AnyUrl] = None
    source: str                                  # "H&M", "Zara", "Google Shopping"
    in_stock: Optional[bool] = None

class ItemWithLinks(SuggestionItem):
    links: List[ProductLink] = Field(default_factory=list)

class Recommendation(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    user_id: PyObjectId
    prompt: Optional[str] = None                 # input/context the AI saw
    items: List[ItemWithLinks]                   # AI suggestions (will be filled with links)
    status: Literal["pending","complete","error"] = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    meta: dict[str, Any] = Field(default_factory=dict)

class CreateRecommendation(BaseModel):
    prompt: Optional[str] = None
    items: List[SuggestionItem]
