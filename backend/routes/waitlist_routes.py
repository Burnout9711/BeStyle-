from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.waitlist import WaitlistSubscribeRequest, WaitlistResponse, WaitlistStats
from services.waitlist_service import WaitlistService
from database import get_database
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/waitlist", tags=["waitlist"])

def get_waitlist_service(db: AsyncIOMotorDatabase = Depends(get_database)):
    return WaitlistService(db)

@router.post("/subscribe", response_model=WaitlistResponse)
async def subscribe_to_waitlist(
    request_data: WaitlistSubscribeRequest,
    request: Request,
    waitlist_service: WaitlistService = Depends(get_waitlist_service)
):
    """Subscribe email to waitlist"""
    try:
        # Extract request metadata
        user_agent = request.headers.get("user-agent")
        
        # Get client IP (considering potential proxies)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()
        else:
            ip_address = request.client.host if request.client else None
        
        result = await waitlist_service.subscribe_to_waitlist(
            request_data, 
            user_agent=user_agent, 
            ip_address=ip_address
        )
        
        return WaitlistResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in waitlist subscription endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process waitlist subscription")

@router.get("/stats", response_model=WaitlistStats)
async def get_waitlist_stats(
    waitlist_service: WaitlistService = Depends(get_waitlist_service)
):
    """Get waitlist statistics"""
    try:
        result = await waitlist_service.get_waitlist_stats()
        return WaitlistStats(**result)
        
    except Exception as e:
        logger.error(f"Error getting waitlist stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get waitlist statistics")

@router.get("/health")
async def waitlist_health_check():
    """Health check endpoint for waitlist service"""
    return {"status": "healthy", "service": "waitlist"}