from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
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

class OutfitItem(BaseModel):
    name: str
    brand: str
    category: Optional[str] = None
    price: Optional[float] = None
    url: Optional[str] = None

class Outfit(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    occasion: str
    description: str
    confidence: int
    color: str  # CSS gradient or color value
    items: List[OutfitItem]
    style_types: List[str] = Field(default_factory=list)
    body_types: List[str] = Field(default_factory=list)
    seasons: List[str] = Field(default_factory=list)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class OutfitRecommendation(BaseModel):
    outfit: Outfit
    match_score: float
    reasoning: str

class SaveOutfitRequest(BaseModel):
    session_id: str
    outfit_id: str

class RecommendationRequest(BaseModel):
    quiz_answers: dict

class RecommendationResponse(BaseModel):
    outfits: List[OutfitRecommendation]
    confidence_score: int
    style_profile: dict