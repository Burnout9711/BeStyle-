from __future__ import annotations
from typing import Optional, List, Dict, Any, Literal
from uuid import uuid4
from pydantic import BaseModel, Field

class GenerationAnswers(BaseModel):
    """Shape coming from OutfitSuggestionsPage answers"""
    occasion: Optional[str] = None               # 'work' | 'date' | ...
    mood: Optional[str] = None                   # 'confident' | ...
    colors: Optional[List[str]] = None           # ['black','navy',...]
    style_preference: Optional[List[str]] = None # ['structured','flowy',...]
    budget: Optional[str] = None                 # 'budget'|'moderate'|'premium'|'no_limit'

class GenerateOutfitsRequest(BaseModel):
    answers: GenerationAnswers
    count: int = Field(default=3, ge=1, le=6)
    save: bool = True     # save snapshots to history by default

class OutfitItem(BaseModel):
    name: str
    brand: Optional[str] = None
    price: Optional[float] = None

class OutfitCard(BaseModel):
    id: str = Field(default_factory=lambda: uuid4().hex) 
    title: str
    occasion: Optional[str] = None
    description: str
    confidence: int
    color: str
    items: List[OutfitItem]
    match_score: int

class GenerateOutfitsResponse(BaseModel):
    items: List[OutfitCard]
    saved: bool
