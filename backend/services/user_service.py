from typing import Optional, List

from models.user import User  # Assuming you have a User model defined
from database import db_session  # Assuming you have a db_session for database operations

class UserService:
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        return db_session.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_all_users() -> List[User]:
        return db_session.query(User).all()

    @staticmethod
    def create_user(username: str, email: str, password: str) -> User:
        user = User(username=username, email=email)
        user.set_password(password)  # Assuming User model has set_password method
        db_session.add(user)
        db_session.commit()
        return user

    @staticmethod
    def update_user(user_id: int, **kwargs) -> Optional[User]:
        user = db_session.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        for key, value in kwargs.items():
            setattr(user, key, value)
        db_session.commit()
        return user

    @staticmethod
    def delete_user(user_id: int) -> bool:
        user = db_session.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        db_session.delete(user)
        db_session.commit()
        return True
    
    async def update_user_quiz(user_id: str, quiz_data: dict):
        user_coll = await get_collection("users")
        await user_coll.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"quiz_data": quiz_data}}
        )

        
    async def add_outfit_to_user(user_id: str, outfit_id: str):
        user_coll = await get_collection("users")
        await user_coll.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"outfits_list": outfit_id}}
        )