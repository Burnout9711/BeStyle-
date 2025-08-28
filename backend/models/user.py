from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    email: EmailStr
    password_hash: str
    outfits_list: List[str] = []
    quiz_data: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class UserMeta:
    collection = "users"
    indexes = [
        {"keys": [("email", 1)], "unique": True},
        {"keys": [("created_at", 1)]},
        {"keys": [("name", 1)]},
        {"keys": [("updated_at", 1)]},
        {"keys": [("outfits_list", 1)]},
        {"keys": [("quiz_data", 1)]},
        {"keys": [("outfits_list", 1)]},  # Added index for outfits_list and name
    ]