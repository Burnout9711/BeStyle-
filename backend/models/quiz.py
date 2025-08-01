from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
import uuid

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

class QuizResponses(BaseModel):
    # Basic Info
    full_name: Optional[str] = None
    gender_identity: Optional[str] = None
    date_of_birth: Optional[str] = None
    city: Optional[str] = None
    
    # Body Type & Size
    height: Optional[str] = None
    weight: Optional[str] = None
    body_type: Optional[str] = None
    clothing_size: Optional[str] = None
    fit_preferences: Optional[str] = None
    
    # Style Preferences
    current_style: Optional[List[str]] = None
    interested_styles: Optional[List[str]] = None
    favorite_colors: Optional[List[str]] = None
    avoid_colors: Optional[List[str]] = None
    
    # Lifestyle & Occasions
    occupation: Optional[str] = None
    typical_week: Optional[List[str]] = None
    help_occasions: Optional[List[str]] = None
    
    # Personality & Goals
    personality_words: Optional[str] = None
    style_inspiration: Optional[str] = None
    fashion_struggle: Optional[str] = None
    goals: Optional[List[str]] = None
    
    # Visual Aid
    photo_upload: Optional[str] = None
    ai_photo_suggestions: Optional[str] = None
    daily_suggestions: Optional[str] = None
    delivery_preference: Optional[str] = None

class QuizSession(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    responses: QuizResponses = Field(default_factory=QuizResponses)
    current_step: int = 0
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class QuizStepSubmission(BaseModel):
    session_id: str
    step_number: int
    answers: Dict[str, Any]

class QuizStartResponse(BaseModel):
    session_id: str
    current_step: int
    message: str

class QuizStepResponse(BaseModel):
    next_step: Optional[int] = None
    is_complete: bool = False
    validation_errors: Optional[Dict[str, str]] = None
    message: str

class StyleProfile(BaseModel):
    primary_style: List[str]
    body_type_advice: str
    color_palette: List[str]
    occasion_priority: List[str]
    confidence_score: int

class QuizResultsResponse(BaseModel):
    session_id: str
    quiz_answers: QuizResponses
    style_profile: StyleProfile
    recommendations: List[Dict[str, Any]]
    confidence_score: int