from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.waitlist import WaitlistEntry, WaitlistSubscribeRequest
import logging

logger = logging.getLogger(__name__)

class WaitlistService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    async def subscribe_to_waitlist(
        self, 
        request: WaitlistSubscribeRequest,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """Subscribe email to waitlist"""
        try:
            # Check if email already exists
            existing_entry = await self.db.waitlist.find_one(
                {"email": request.email}
            )
            
            if existing_entry:
                # Get current position
                position = await self._get_waitlist_position(request.email)
                return {
                    "success": True,
                    "message": "You're already on our waitlist!",
                    "position": position
                }
            
            # Create new waitlist entry
            waitlist_entry = WaitlistEntry(
                email=request.email,
                source=request.source,
                user_agent=user_agent,
                ip_address=ip_address,
                metadata=request.metadata
            )
            
            # Insert into database
            await self.db.waitlist.insert_one(waitlist_entry.dict(by_alias=True))
            
            # Get position in waitlist
            position = await self._get_waitlist_position(request.email)
            
            logger.info(f"New waitlist subscription: {request.email} from {request.source}")
            
            return {
                "success": True,
                "message": "Successfully joined the waitlist!",
                "position": position
            }
            
        except Exception as e:
            logger.error(f"Error subscribing to waitlist: {str(e)}")
            return {
                "success": False,
                "message": "Failed to join waitlist. Please try again.",
                "position": None
            }
    
    async def get_waitlist_stats(self) -> Dict[str, Any]:
        """Get waitlist statistics"""
        try:
            # Total subscribers
            total_subscribers = await self.db.waitlist.count_documents({})
            
            # Recent signups (last 24 hours)
            cutoff_date = datetime.utcnow() - timedelta(hours=24)
            recent_signups = await self.db.waitlist.count_documents(
                {"created_at": {"$gte": cutoff_date}}
            )
            
            # Weekly growth rate
            week_cutoff = datetime.utcnow() - timedelta(days=7)
            previous_week_cutoff = datetime.utcnow() - timedelta(days=14)
            
            current_week_count = await self.db.waitlist.count_documents(
                {"created_at": {"$gte": week_cutoff}}
            )
            
            previous_week_count = await self.db.waitlist.count_documents(
                {
                    "created_at": {
                        "$gte": previous_week_cutoff,
                        "$lt": week_cutoff
                    }
                }
            )
            
            growth_rate = 0
            if previous_week_count > 0:
                growth_rate = ((current_week_count - previous_week_count) / previous_week_count) * 100
            
            return {
                "total_subscribers": total_subscribers,
                "recent_signups": recent_signups,
                "growth_rate": round(growth_rate, 2)
            }
            
        except Exception as e:
            logger.error(f"Error getting waitlist stats: {str(e)}")
            return {
                "total_subscribers": 0,
                "recent_signups": 0,
                "growth_rate": 0
            }
    
    async def _get_waitlist_position(self, email: str) -> int:
        """Get position of email in waitlist (1-indexed)"""
        try:
            # Count entries created before this email
            entry = await self.db.waitlist.find_one({"email": email})
            if not entry:
                return 0
            
            earlier_count = await self.db.waitlist.count_documents(
                {"created_at": {"$lt": entry["created_at"]}}
            )
            
            return earlier_count + 1
            
        except Exception as e:
            logger.error(f"Error calculating waitlist position: {str(e)}")
            return 0