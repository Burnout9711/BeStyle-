from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import uuid
from ..models.outfit import OutfitRecommendation
from ..models.user import User
from ..services.recommendation_engine import RecommendationEngine

router = APIRouter()

class OutfitPreferences(BaseModel):
    occasion: Optional[str] = None
    mood: Optional[str] = None
    colors: Optional[List[str]] = []
    style_preference: Optional[List[str]] = []
    budget: Optional[str] = None
    user_id: Optional[str] = None

class SaveOutfitRequest(BaseModel):
    outfit_id: str
    session_id: Optional[str] = None

@router.post("/api/recommendations/generate")
async def generate_recommendations(preferences: OutfitPreferences):
    """Generate outfit recommendations based on user preferences"""
    try:
        # Use the recommendation engine to generate outfits
        engine = RecommendationEngine()
        
        # Convert preferences to the format expected by the engine
        user_preferences = {
            "occasion": preferences.occasion or "casual",
            "mood": preferences.mood or "comfortable",
            "colors": preferences.colors or ["black", "white"],
            "style_preference": preferences.style_preference or ["classic"],
            "budget": preferences.budget or "moderate"
        }
        
        recommendations = await engine.get_personalized_recommendations(
            user_preferences, count=3
        )
        
        return {
            "success": True,
            "data": {
                "recommendations": recommendations,
                "preferences": user_preferences,
                "generated_at": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@router.get("/api/recommendations/user-outfits")
async def get_user_outfits(user_id: Optional[str] = None):
    """Get saved outfit recommendations for a user"""
    try:
        # Mock data for now - replace with actual database query
        mock_outfits = [
            {
                "id": str(uuid.uuid4()),
                "title": "Professional Power",
                "occasion": "work",
                "description": "Command attention in the boardroom with this polished ensemble.",
                "confidence": 95,
                "color": "linear-gradient(135deg, #4F7FFF 0%, rgba(79, 127, 255, 0.8) 100%)",
                "items": [
                    {"name": "Tailored blazer", "brand": "Theory", "price": 295},
                    {"name": "Silk blouse", "brand": "Equipment", "price": 158},
                    {"name": "Straight trousers", "brand": "J.Crew", "price": 128},
                    {"name": "Leather pumps", "brand": "Cole Haan", "price": 180}
                ],
                "match_score": 94,
                "created_at": datetime.utcnow().isoformat(),
                "is_favorite": True
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Weekend Explorer",
                "occasion": "casual",
                "description": "Effortlessly stylish for weekend adventures and casual hangouts.",
                "confidence": 88,
                "color": "linear-gradient(135deg, #F2546D 0%, rgba(242, 84, 109, 0.8) 100%)",
                "items": [
                    {"name": "Cashmere sweater", "brand": "Everlane", "price": 118},
                    {"name": "High-rise jeans", "brand": "Levi's", "price": 89},
                    {"name": "White sneakers", "brand": "Veja", "price": 120},
                    {"name": "Crossbody bag", "brand": "Polene", "price": 290}
                ],
                "match_score": 89,
                "created_at": datetime.utcnow().isoformat(),
                "is_favorite": False
            }
        ]
        
        return {
            "success": True,
            "data": {
                "outfits": mock_outfits,
                "total": len(mock_outfits)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user outfits: {str(e)}")

@router.post("/api/recommendations/save-outfit")
async def save_outfit(request: SaveOutfitRequest):
    """Save an outfit as favorite for a user"""
    try:
        # Mock implementation - replace with actual database operation
        return {
            "success": True,
            "data": {
                "outfit_id": request.outfit_id,
                "saved_at": datetime.utcnow().isoformat(),
                "message": "Outfit saved to favorites"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save outfit: {str(e)}")

@router.delete("/api/recommendations/remove-outfit/{outfit_id}")
async def remove_outfit(outfit_id: str):
    """Remove an outfit from favorites"""
    try:
        # Mock implementation - replace with actual database operation
        return {
            "success": True,
            "data": {
                "outfit_id": outfit_id,
                "removed_at": datetime.utcnow().isoformat(),
                "message": "Outfit removed from favorites"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove outfit: {str(e)}")

@router.get("/api/recommendations/popular")
async def get_popular_outfits():
    """Get popular outfit recommendations"""
    try:
        # Mock popular outfits
        popular_outfits = [
            {
                "id": str(uuid.uuid4()),
                "title": "Date Night Elegance",
                "occasion": "date",
                "description": "Make a lasting impression with this sophisticated yet approachable look.",
                "confidence": 92,
                "color": "linear-gradient(135deg, #1A1A1A 0%, rgba(26, 26, 26, 0.9) 100%)",
                "items": [
                    {"name": "Silk midi dress", "brand": "Reformation", "price": 218},
                    {"name": "Delicate jewelry set", "brand": "Mejuri", "price": 125},
                    {"name": "Block heel sandals", "brand": "Sam Edelman", "price": 130},
                    {"name": "Clutch purse", "brand": "Mansur Gavriel", "price": 195}
                ],
                "match_score": 94,
                "created_at": datetime.utcnow().isoformat(),
                "popularity_score": 98
            }
        ]
        
        return {
            "success": True,
            "data": {
                "outfits": popular_outfits,
                "total": len(popular_outfits)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get popular outfits: {str(e)}")