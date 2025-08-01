from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.quiz import QuizSession, QuizStepSubmission, QuizResponses, StyleProfile
from services.recommendation_engine import RecommendationEngine
import logging

logger = logging.getLogger(__name__)

class QuizService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.recommendation_engine = RecommendationEngine()
        
    async def start_quiz_session(self) -> Dict[str, Any]:
        """Create a new quiz session"""
        try:
            quiz_session = QuizSession()
            
            # Insert into database
            result = await self.db.quiz_sessions.insert_one(quiz_session.dict(by_alias=True))
            
            logger.info(f"Started new quiz session: {quiz_session.session_id}")
            
            return {
                "session_id": quiz_session.session_id,
                "current_step": 0,
                "message": "Quiz session started successfully"
            }
            
        except Exception as e:
            logger.error(f"Error starting quiz session: {str(e)}")
            raise Exception("Failed to start quiz session")
    
    async def submit_quiz_step(self, submission: QuizStepSubmission) -> Dict[str, Any]:
        """Submit answers for a quiz step"""
        try:
            # Find the quiz session
            session = await self.db.quiz_sessions.find_one(
                {"session_id": submission.session_id}
            )
            
            if not session:
                raise Exception("Quiz session not found")
            
            # Validate step number
            if submission.step_number < 0 or submission.step_number > 5:
                raise Exception("Invalid step number")
            
            # Update responses
            update_data = {}
            for key, value in submission.answers.items():
                update_data[f"responses.{key}"] = value
            
            update_data["current_step"] = submission.step_number + 1
            update_data["updated_at"] = datetime.utcnow()
            
            # Update the session
            await self.db.quiz_sessions.update_one(
                {"session_id": submission.session_id},
                {"$set": update_data}
            )
            
            # Check if quiz is complete (step 5 is the last step, 0-indexed)
            is_complete = submission.step_number >= 5
            next_step = None if is_complete else submission.step_number + 1
            
            logger.info(f"Quiz step {submission.step_number} submitted for session {submission.session_id}")
            
            return {
                "next_step": next_step,
                "is_complete": is_complete,
                "validation_errors": None,
                "message": "Step submitted successfully"
            }
            
        except Exception as e:
            logger.error(f"Error submitting quiz step: {str(e)}")
            return {
                "next_step": None,
                "is_complete": False,
                "validation_errors": {"general": str(e)},
                "message": "Failed to submit step"
            }
    
    async def complete_quiz(self, session_id: str) -> Dict[str, Any]:
        """Complete quiz and generate recommendations"""
        try:
            # Find and mark session as completed
            session = await self.db.quiz_sessions.find_one(
                {"session_id": session_id}
            )
            
            if not session:
                raise Exception("Quiz session not found")
            
            # Mark as completed
            await self.db.quiz_sessions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "is_completed": True,
                        "completed_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            # Generate recommendations
            quiz_responses = QuizResponses(**session.get("responses", {}))
            recommendations = await self.recommendation_engine.generate_recommendations(quiz_responses)
            style_profile = await self.recommendation_engine.analyze_style_profile(quiz_responses)
            confidence_score = await self.recommendation_engine.calculate_confidence_score(quiz_responses)
            
            logger.info(f"Quiz completed for session {session_id}")
            
            return {
                "recommendations": recommendations,
                "confidence_score": confidence_score,
                "style_profile": style_profile
            }
            
        except Exception as e:
            logger.error(f"Error completing quiz: {str(e)}")
            raise Exception("Failed to complete quiz")
    
    async def get_quiz_results(self, session_id: str) -> Dict[str, Any]:
        """Get quiz results for a session"""
        try:
            session = await self.db.quiz_sessions.find_one(
                {"session_id": session_id}
            )
            
            if not session:
                raise Exception("Quiz session not found")
            
            if not session.get("is_completed", False):
                raise Exception("Quiz not completed yet")
            
            # Get quiz responses
            quiz_responses = QuizResponses(**session.get("responses", {}))
            
            # Generate fresh recommendations (or cache them)
            recommendations = await self.recommendation_engine.generate_recommendations(quiz_responses)
            style_profile = await self.recommendation_engine.analyze_style_profile(quiz_responses)
            confidence_score = await self.recommendation_engine.calculate_confidence_score(quiz_responses)
            
            return {
                "session_id": session_id,
                "quiz_answers": quiz_responses.dict(),
                "style_profile": style_profile,
                "recommendations": recommendations,
                "confidence_score": confidence_score
            }
            
        except Exception as e:
            logger.error(f"Error getting quiz results: {str(e)}")
            raise Exception("Failed to get quiz results")
    
    async def cleanup_old_sessions(self):
        """Clean up quiz sessions older than 24 hours"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(hours=24)
            result = await self.db.quiz_sessions.delete_many(
                {"created_at": {"$lt": cutoff_date}, "is_completed": False}
            )
            
            logger.info(f"Cleaned up {result.deleted_count} old quiz sessions")
            
        except Exception as e:
            logger.error(f"Error cleaning up old sessions: {str(e)}")