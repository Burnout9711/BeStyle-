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
        
    async def start_quiz_session(self, cookie_session_id: str) -> Dict[str, Any]:
        """
        Ensure a quiz_session doc exists for the given cookie session_id.
        If one exists and not completed, resume it; otherwise create a new doc keyed by session_id.
        """
        try:
            existing = await self.db.quiz_sessions.find_one({"session_id": cookie_session_id})
            if existing:
                logger.info(f"Resuming quiz session: {cookie_session_id}")
                return {
                    "session_id": cookie_session_id,
                    "current_step": existing.get("current_step", 0),
                    "message": "Quiz session resumed"
                }
            logger.warning(f"Starting new quiz session: {cookie_session_id}")
            # Create a new quiz session bound to the cookie sid
            now = datetime.utcnow()
            quiz_session = QuizSession(session_id=cookie_session_id)  # <-- use provided id
            doc = quiz_session.dict(by_alias=True)
            # ensure timestamps even if model already has them
            doc.setdefault("created_at", now)
            doc.setdefault("updated_at", now)

            await self.db.quiz_sessions.insert_one(doc)
            logger.info(f"Started new quiz session: {cookie_session_id}")

            return {
                "session_id": cookie_session_id,
                "current_step": 0,
                "message": "Quiz session started successfully"
            }
        except Exception as e:
            logger.error(f"Error starting quiz session: {str(e)}")
            raise Exception("Failed to start quiz session")
    
    async def submit_quiz_step(self, submission: QuizStepSubmission) -> Dict[str, Any]:
        """
        Save step answers for the bound cookie session.
        """
        try:
            # session lookup
            session = await self.db.quiz_sessions.find_one({"session_id": submission.session_id})
            if not session:
                raise Exception("Quiz session not found")

            if submission.step_number < 0 or submission.step_number > 5:
                raise Exception("Invalid step number")
            
            # build $set update
            update_data = {f"responses.{k}": v for k, v in submission.answers.items()}
            update_data["current_step"] = submission.step_number + 1
            update_data["updated_at"] = datetime.utcnow()

            await self.db.quiz_sessions.update_one(
                {"session_id": submission.session_id},
                {"$set": update_data}
            )

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
        """
        Mark as completed and generate recommendations for this cookie session_id.
        """
        try:
            session = await self.db.quiz_sessions.find_one({"session_id": session_id})
            if not session:
                raise Exception("Quiz session not found")

            await self.db.quiz_sessions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "is_completed": True,
                    "completed_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }}
            )

            quiz_responses = QuizResponses(**session.get("responses", {}))
            logger.debug(f"Quiz responses for session {session_id}: {quiz_responses.dict()}")
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
    
    # async def get_quiz_results(self, session_id: str) -> Dict[str, Any]:
    #     """
    #     Fetch results (re-generate on the fly here) for the cookie session_id.
    #     """
    #     try:
    #         session = await self.db.quiz_sessions.find_one({"session_id": session_id})
    #         if not session:
    #             raise Exception("Quiz session not found")

    #         if not session.get("is_completed", False):
    #             raise Exception("Quiz not completed yet")

    #         quiz_responses = QuizResponses(**session.get("responses", {}))
    #         recommendations = await self.recommendation_engine.generate_recommendations(quiz_responses)
    #         style_profile = await self.recommendation_engine.analyze_style_profile(quiz_responses)
    #         confidence_score = await self.recommendation_engine.calculate_confidence_score(quiz_responses)

    #         return {
    #             "session_id": session_id,
    #             "quiz_answers": quiz_responses.dict(),
    #             "style_profile": style_profile,
    #             "recommendations": recommendations,
    #             "confidence_score": confidence_score
    #         }
    #     except Exception as e:
    #         logger.error(f"Error getting quiz results: {str(e)}")
    #         raise Exception("Failed to get quiz results")
    async def get_quiz_results(self, session_id: str):
        try:
            session = await self.db.quiz_sessions.find_one({"session_id": session_id})
            if not session:
                raise Exception("Quiz session not found")

            if not session.get("is_completed", False):
                raise Exception("Quiz not completed yet")

            quiz_responses = QuizResponses(**session.get("responses", {}))

            # 1. Analyze user responses to create a structured profile
            style_profile = await self.recommendation_engine.analyze_style_profile(quiz_responses)

            # 2. Use the profile to get recommendations from Gemini
            recommendations = await self.recommendation_engine.get_gemini_recommendations(style_profile)
            
            # 3. Return the Gemini response
            return recommendations
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