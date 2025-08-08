"""
Authentication service for handling Emergent OAuth integration
"""
import aiohttp
import os
from typing import Optional
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user import User, UserSession

class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users_collection = db.users
        self.sessions_collection = db.user_sessions
        self.emergent_auth_url = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
    
    async def verify_emergent_session(self, session_id: str) -> Optional[dict]:
        """
        Verify session with Emergent auth API and get user data
        """
        try:
            headers = {
                "X-Session-ID": session_id,
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.emergent_auth_url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    else:
                        print(f"Emergent auth API error: {response.status}")
                        return None
                        
        except Exception as e:
            print(f"Error verifying Emergent session: {e}")
            return None
    
    async def create_or_get_user(self, emergent_data: dict) -> Optional[User]:
        """
        Create new user or get existing user from Emergent OAuth data
        """
        try:
            email = emergent_data.get('email')
            if not email:
                return None
            
            # Check if user already exists
            existing_user = await self.users_collection.find_one({"email": email})
            
            if existing_user:
                # Return existing user without updating data (as per playbook)
                return User(**existing_user)
            else:
                # Create new user
                user_data = {
                    "email": email,
                    "name": emergent_data.get('name', 'Anonymous User'),
                    "picture": emergent_data.get('picture', ''),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                user = User(**user_data)
                
                # Save to database
                await self.users_collection.insert_one(user.dict())
                return user
                
        except Exception as e:
            print(f"Error creating/getting user: {e}")
            return None
    
    async def create_user_session(self, user: User, session_token: str) -> Optional[UserSession]:
        """
        Create a new user session with 7-day expiry
        """
        try:
            # Remove any existing sessions for this user
            await self.sessions_collection.delete_many({"user_id": user.id})
            
            session = UserSession(
                session_token=session_token,
                user_id=user.id
            )
            
            # Save session to database
            await self.sessions_collection.insert_one(session.dict())
            return session
            
        except Exception as e:
            print(f"Error creating user session: {e}")
            return None
    
    async def validate_session_token(self, session_token: str) -> Optional[User]:
        """
        Validate session token and return user if valid
        """
        try:
            # Find session in database
            session_data = await self.sessions_collection.find_one({"session_token": session_token})
            
            if not session_data:
                return None
            
            session = UserSession(**session_data)
            
            # Check if session is expired
            if datetime.utcnow() > session.expires_at:
                # Remove expired session
                await self.sessions_collection.delete_one({"session_token": session_token})
                return None
            
            # Get user data
            user_data = await self.users_collection.find_one({"id": session.user_id})
            
            if user_data:
                return User(**user_data)
            else:
                return None
                
        except Exception as e:
            print(f"Error validating session token: {e}")
            return None
    
    async def logout_user(self, session_token: str) -> bool:
        """
        Logout user by removing session token
        """
        try:
            result = await self.sessions_collection.delete_one({"session_token": session_token})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error logging out user: {e}")
            return False