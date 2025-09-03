from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from dependencies.session_dep import get_or_create_session
from models.session import SessionDoc
from models.quiz import QuizStepSubmission, QuizStartResponse, QuizStepResponse, QuizResultsResponse, QuizStepSubmissionIn
from services.quiz_service import QuizService
from database import get_database
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

def get_quiz_service(db: AsyncIOMotorDatabase = Depends(get_database)):
    return QuizService(db)

@router.post("/start", response_model=QuizStartResponse)
async def start_quiz(
    request: Request,
    quiz_service: QuizService = Depends(get_quiz_service),
    session: SessionDoc = Depends(get_or_create_session),
):
    """Start (or resume) a quiz session bound to the anonymous sid cookie."""
    try:
        result = await quiz_service.start_quiz_session(session.session_id)
        return QuizStartResponse(**result)
    except Exception as e:
        logger.error(f"Error starting quiz: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start quiz session")

@router.post("/submit-step", response_model=QuizStepResponse)
async def submit_quiz_step(
    body: QuizStepSubmissionIn,
    quiz_service: QuizService = Depends(get_quiz_service),
    session: SessionDoc = Depends(get_or_create_session),
):
    """Submit a step; bind to cookie session no matter what client sends."""
    
    try:
        # force the cookie session_id
        # submission.session_id = session.session_id
        submission = QuizStepSubmission(
            session_id=session.session_id,
            step_number=body.step_number,
            answers=body.answers,
        )
        result = await quiz_service.submit_quiz_step(submission)
        return QuizStepResponse(**result)
    except Exception as e:
        logger.error(f"Error submitting quiz step: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit quiz step")

@router.post("/complete")
async def complete_quiz(
    payload: Optional[dict] = None,   # backward compat; not required
    quiz_service: QuizService = Depends(get_quiz_service),
    session: SessionDoc = Depends(get_or_create_session),

):
    logger.info("Completing quiz for session")
    """Complete quiz and generate recommendations"""
    try:
        if not session.session_id:
            raise HTTPException(status_code=400, detail="Session ID is required")
        logger.info(f"Completing quiz for session ID: {session.session_id}")
        result = await quiz_service.complete_quiz(session.session_id)
        return result
    except Exception as e:
        logger.error(f"Error completing quiz: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to complete quiz")

@router.get("/results")
async def get_quiz_results(
    quiz_service: QuizService = Depends(get_quiz_service),
    session: SessionDoc = Depends(get_or_create_session),
):
    """Get results for the current cookie session (no session_id in URL)."""
    try:
        result = await quiz_service.get_quiz_results(session.session_id)
        return result
    except Exception as e:
        logger.error(f"Error getting quiz results: {str(e)}")
        raise HTTPException(status_code=404, detail="Quiz results not found")

@router.get("/questions")
async def get_quiz_questions():
    """Get quiz questions structure"""
    try:
        # Return the quiz structure that matches the frontend mockQuizData
        quiz_structure = {
            "steps": [
                {
                    "id": "basic_info",
                    "title": "Basic Info",
                    "description": "These help build a user identity.",
                    "questions": [
                        {
                            "id": "full_name",
                            "question": "What is your full name or nickname you'd like us to use?",
                            "type": "text",
                            "placeholder": "Enter your name",
                            "required": True
                        },
                        {
                            "id": "gender_identity", 
                            "question": "What's your gender identity?",
                            "type": "multiple-choice",
                            "options": ["Male", "Female", "Non-binary", "Prefer not to say", "Other"],
                            "required": True
                        },
                        {
                            "id": "date_of_birth",
                            "question": "What's your date of birth?",
                            "type": "text",
                            "placeholder": "MM/DD/YYYY"
                        },
                        {
                            "id": "city",
                            "question": "Which city are you currently based in?",
                            "type": "text", 
                            "placeholder": "Enter your city"
                        }
                    ]
                },
                {
                    "id": "body_type",
                    "title": "Body Type & Size",
                    "description": "Helps in sizing and fit-based recommendations.",
                    "questions": [
                        {
                            "id": "height",
                            "question": "What is your height?",
                            "type": "text",
                            "placeholder": "e.g., 6'1\" or 185 cm"
                        },
                        {
                            "id": "weight",
                            "question": "What is your weight?",
                            "type": "text", 
                            "placeholder": "e.g., 83 kg or 180 lbs"
                        },
                        {
                            "id": "body_type",
                            "question": "What's your body type?",
                            "type": "multiple-choice",
                            "options": ["Slim", "Athletic", "Average", "Curvy", "Plus-size", "Other"],
                            "required": True
                        },
                        {
                            "id": "clothing_size",
                            "question": "What's your usual clothing size?",
                            "type": "multiple-choice",
                            "options": ["XS", "S", "M", "L", "XL", "XXL"],
                            "required": True
                        },
                        {
                            "id": "fit_preferences",
                            "question": "Any fit preferences?",
                            "type": "multiple-choice",
                            "options": ["Slim fit", "Regular fit", "Loose fit", "Depends on occasion"]
                        }
                    ]
                },
                {
                    "id": "style_preferences",
                    "title": "Style Preferences", 
                    "description": "These shape their personal style profile.",
                    "questions": [
                        {
                            "id": "current_style",
                            "question": "How would you describe your current style? (Choose all that apply)",
                            "type": "multi-select",
                            "options": ["Minimalist", "Casual", "Smart Casual", "Formal", "Streetwear", "Sporty", "Bohemian", "Trendy", "Don't know yet"],
                            "required": True
                        },
                        {
                            "id": "interested_styles",
                            "question": "What styles are you interested in exploring?",
                            "type": "multi-select",
                            "options": ["Minimalist", "Casual", "Smart Casual", "Formal", "Streetwear", "Sporty", "Bohemian", "Trendy", "Vintage", "Preppy"]
                        },
                        {
                            "id": "favorite_colors",
                            "question": "Which colors do you love wearing?",
                            "type": "multi-select",
                            "options": ["Black", "White", "Gray", "Navy", "Beige", "Brown", "Red", "Blue", "Green", "Pink", "Yellow", "Purple"]
                        },
                        {
                            "id": "avoid_colors",
                            "question": "Which colors do you avoid?",
                            "type": "multi-select", 
                            "options": ["Black", "White", "Gray", "Navy", "Beige", "Brown", "Red", "Blue", "Green", "Pink", "Yellow", "Purple", "None"]
                        }
                    ]
                },
                {
                    "id": "lifestyle",
                    "title": "Lifestyle & Occasions",
                    "description": "To tailor outfits based on daily needs.",
                    "questions": [
                        {
                            "id": "occupation",
                            "question": "What do you do for a living?",
                            "type": "text",
                            "placeholder": "Job title or student, etc."
                        },
                        {
                            "id": "typical_week",
                            "question": "What does your typical week look like?",
                            "type": "multi-select",
                            "options": ["Mostly work", "Gym & sports", "Social outings", "Travel", "Home-based"]
                        },
                        {
                            "id": "help_occasions",
                            "question": "Where do you need help dressing better? (Pick 2–3)",
                            "type": "multi-select",
                            "options": ["Work/office", "Casual daily wear", "Dates", "Gym", "Events/parties", "Travel looks", "Social media outfits"],
                            "maxSelections": 3
                        }
                    ]
                },
                {
                    "id": "personality",
                    "title": "Personality & Goals",
                    "description": "To connect with their deeper identity.",
                    "questions": [
                        {
                            "id": "personality_words",
                            "question": "What three words best describe your personality?",
                            "type": "textarea",
                            "placeholder": "e.g., Creative, confident, adventurous"
                        },
                        {
                            "id": "style_inspiration",
                            "question": "Who's your style inspiration?",
                            "type": "text",
                            "placeholder": "Celebrity, influencer, or even a friend"
                        },
                        {
                            "id": "fashion_struggle",
                            "question": "What's your biggest fashion struggle?",
                            "type": "textarea",
                            "placeholder": "Share your biggest challenge with styling"
                        },
                        {
                            "id": "goals",
                            "question": "What is your goal with BeStyle.ai?",
                            "type": "multi-select",
                            "options": ["Look more confident", "Discover my style", "Save time", "Impress someone 😉", "Upgrade my wardrobe"],
                            "required": True
                        }
                    ]
                },
                {
                    "id": "visual_aid",
                    "title": "Visual Aid (Optional)",
                    "description": "To train the AI visually.",
                    "questions": [
                        {
                            "id": "photo_upload",
                            "question": "Upload a photo of yourself (Optional)",
                            "type": "file",
                            "placeholder": "Choose file"
                        },
                        {
                            "id": "ai_photo_suggestions",
                            "question": "Would you like to get AI-generated outfit suggestions on your own photo?",
                            "type": "multiple-choice",
                            "options": ["Yes", "No", "Maybe later"]
                        },
                        {
                            "id": "daily_suggestions",
                            "question": "Would you like daily outfit suggestions?",
                            "type": "multiple-choice", 
                            "options": ["Yes", "No", "Only on special occasions"]
                        },
                        {
                            "id": "delivery_preference",
                            "question": "How would you like to receive your looks?",
                            "type": "multiple-choice",
                            "options": ["In-app", "Email", "WhatsApp"]
                        }
                    ]
                }
            ]
        }
        
        return quiz_structure
    except Exception as e:
        logger.error(f"Error getting quiz questions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get quiz questions")