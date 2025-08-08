"""
Enhanced Authentication service for handling Emergent OAuth integration with comprehensive profile management
"""
import aiohttp
import os
from typing import Optional, Dict
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user import User, UserSession, SocialProfile, LoginHistory

class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users_collection = db.users
        self.sessions_collection = db.user_sessions
        self.emergent_auth_url = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
    
    def _detect_provider_from_emergent_data(self, emergent_data: dict) -> str:
        """
        Detect the social media provider from Emergent data
        This is a simplified detection - in practice, Emergent might provide this directly
        """
        # Check for provider hints in the data
        email = emergent_data.get('email', '').lower()
        picture = emergent_data.get('picture', '')
        
        # Simple heuristics - in production, Emergent should provide provider info directly
        if 'googleusercontent.com' in picture:
            return 'google'
        elif 'fbcdn.net' in picture or 'facebook.com' in picture:
            return 'facebook'
        elif 'licdn.com' in picture or 'linkedin.com' in picture:
            return 'linkedin'
        else:
            return 'emergent'  # Default to emergent if can't detect
    
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
    
    def _calculate_profile_completion(self, user: User) -> int:
        """
        Calculate profile completion percentage based on available information
        """
        completion_score = 0
        total_score = 100
        
        # Basic info (40 points)
        if user.name and user.name.strip():
            completion_score += 20
        if user.email:
            completion_score += 20
        
        # Profile picture (20 points)
        if user.picture:
            completion_score += 20
        
        # Social profiles (20 points)
        if user.social_profiles:
            completion_score += 20
        
        # Preferences set (20 points)
        if user.preferences and (user.preferences.timezone or 
                               user.preferences.preferred_language != "en"):
            completion_score += 20
        
        return min(completion_score, 100)
    
    async def create_or_update_user(self, emergent_data: dict, request_info: Dict = None) -> tuple[Optional[User], bool]:
        """
        Create new user or update existing user from Emergent OAuth data
        Returns: (user, is_new_user)
        """
        try:
            email = emergent_data.get('email')
            if not email:
                return None, False
            
            # Detect the social media provider
            provider = self._detect_provider_from_emergent_data(emergent_data)
            
            # Check if user already exists
            existing_user = await self.users_collection.find_one({"email": email})
            
            if existing_user:
                # Update existing user
                user = User(**existing_user)
                
                # Update last login and login count
                user.last_login = datetime.utcnow()
                user.login_count += 1
                user.updated_at = datetime.utcnow()
                
                # Add/update social profile
                provider_profile = SocialProfile(
                    provider=provider,
                    provider_id=emergent_data.get('id', 'unknown'),
                    provider_email=email,
                    provider_name=emergent_data.get('name', ''),
                    provider_picture=emergent_data.get('picture', ''),
                    last_used=datetime.utcnow()
                )
                
                # Update or add social profile
                profile_updated = False
                for i, profile in enumerate(user.social_profiles):
                    if profile.provider == provider:
                        user.social_profiles[i] = provider_profile
                        profile_updated = True
                        break
                
                if not profile_updated:
                    user.social_profiles.append(provider_profile)
                
                # Set primary provider if not set
                if not user.primary_provider:
                    user.primary_provider = provider
                
                # Add login history entry
                login_entry = LoginHistory(
                    provider=provider,
                    provider_id=emergent_data.get('id', 'unknown'),
                    ip_address=request_info.get('ip_address') if request_info else None,
                    user_agent=request_info.get('user_agent') if request_info else None
                )
                user.login_history.append(login_entry)
                
                # Keep only last 50 login history entries
                user.login_history = user.login_history[-50:]
                
                # Update user in database
                await self.users_collection.replace_one({"email": email}, user.dict())
                return user, False
                
            else:
                # Create new user
                social_profile = SocialProfile(
                    provider=provider,
                    provider_id=emergent_data.get('id', 'unknown'),
                    provider_email=email,
                    provider_name=emergent_data.get('name', ''),
                    provider_picture=emergent_data.get('picture', '')
                )
                
                login_entry = LoginHistory(
                    provider=provider,
                    provider_id=emergent_data.get('id', 'unknown'),
                    ip_address=request_info.get('ip_address') if request_info else None,
                    user_agent=request_info.get('user_agent') if request_info else None
                )
                
                user_data = {
                    "email": email,
                    "name": emergent_data.get('name', 'Anonymous User'),
                    "picture": emergent_data.get('picture', ''),
                    "last_login": datetime.utcnow(),
                    "login_count": 1,
                    "social_profiles": [social_profile],
                    "primary_provider": provider,
                    "login_history": [login_entry],
                    "email_verified": True,  # Assume email is verified if coming from social login
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                user = User(**user_data)
                
                # Save to database
                await self.users_collection.insert_one(user.dict())
                return user, True
                
        except Exception as e:
            print(f"Error creating/updating user: {e}")
            return None, False
    
    async def create_user_session(self, user: User, session_token: str, provider: str = None, request_info: Dict = None) -> Optional[UserSession]:
        """
        Create a new user session with enhanced tracking
        """
        try:
            # Remove any existing sessions for this user
            await self.sessions_collection.delete_many({"user_id": user.id})
            
            session = UserSession(
                session_token=session_token,
                user_id=user.id,
                provider=provider,
                ip_address=request_info.get('ip_address') if request_info else None,
                user_agent=request_info.get('user_agent') if request_info else None
            )
            
            # Save session to database
            await self.sessions_collection.insert_one(session.dict())
            return session
            
        except Exception as e:
            print(f"Error creating user session: {e}")
            return None
    
    async def get_user_profile_with_completion(self, user_id: str) -> tuple[Optional[User], int]:
        """
        Get user profile with completion percentage
        """
        try:
            user_data = await self.users_collection.find_one({"id": user_id})
            if user_data:
                user = User(**user_data)
                completion = self._calculate_profile_completion(user)
                return user, completion
            return None, 0
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None, 0
    
    async def update_user_profile(self, user_id: str, update_data: dict) -> Optional[User]:
        """
        Update user profile with specified data
        """
        try:
            update_data['updated_at'] = datetime.utcnow()
            
            result = await self.users_collection.update_one(
                {"id": user_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                user_data = await self.users_collection.find_one({"id": user_id})
                if user_data:
                    return User(**user_data)
            return None
        except Exception as e:
            print(f"Error updating user profile: {e}")
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
            
            # Update last activity
            await self.sessions_collection.update_one(
                {"session_token": session_token},
                {"$set": {"last_activity": datetime.utcnow()}}
            )
            
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