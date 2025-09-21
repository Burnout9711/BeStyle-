# services/user_outfit_service.py
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user_outfit import UserOutfit
from models.objectid import PyObjectId
from database import get_database
import logging

logger = logging.getLogger(__name__)
COLL = "user_outfits"

class UserOutfitService:
    def __init__(self, db: Optional[AsyncIOMotorDatabase] = None):
        self.db = db if db is not None else get_database()

    async def save_generated_outfits(
        self,
        *,
        outfits: List[Dict[str, Any]],
        user_id: Optional[str],
        session_id: Optional[str],
        source: str = "generated"
    ) -> List[UserOutfit]:
        """Save a batch of generated outfits as snapshots for history."""
        if not outfits:
            return []

        now = datetime.utcnow()
        docs = []

        for o in outfits:
            # Build a model first so it validates coercions (e.g., str -> ObjectId)
            model = UserOutfit(
                user_id=user_id,             # may be None or str; model coerces to ObjectId
                session_id=session_id,
                source=source,
                outfit=o,
                occasion=o.get("occasion"),
                title=o.get("title"),
                confidence=o.get("confidence"),
                color=o.get("color"),
                created_at=now,
                updated_at=now,
            )
            # Dump with aliases so `_id` is present and ObjectId stays as ObjectId
            docs.append(model.model_dump(by_alias=True))

        result = await self.db[COLL].insert_many(docs)

        # Fetch inserted docs and validate back into models
        cursor = self.db[COLL].find({"_id": {"$in": result.inserted_ids}})
        inserted_docs = await cursor.to_list(length=len(result.inserted_ids))

        # v2: model_validate handles both str/ObjectId for id fields thanks to PyObjectId
        return [UserOutfit.model_validate(d) for d in inserted_docs]

    async def list_outfits(
        self,
        *,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        favorite: Optional[bool] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[UserOutfit]:
        q: Dict[str, Any] = {}
        if user_id:
            q["user_id"] = user_id
        elif session_id:
            q["session_id"] = session_id
        else:
            return []

        if favorite is not None:
            q["favorite"] = bool(favorite)

        cursor = (
            self.db[COLL]
            .find(q)
            .sort("created_at", -1)
            .skip(max(0, skip))
            .limit(min(200, max(1, limit)))
        )
        data = await cursor.to_list(length=None)
        logger.info(f"list_outfits query: {q}, found {len(data)} items")
        logger.debug(f"list_outfits data: {data}")
        return [UserOutfit.model_validate(d) for d in data]

    async def set_favorite(self, *, user_id: str, outfit_id: str, favorite: bool) -> bool:
        res = await self.db[COLL].update_one(
            {"_id": ObjectId(outfit_id), "user_id": ObjectId(user_id)},
            {"$set": {"favorite": bool(favorite), "updated_at": datetime.utcnow()}}
        )
        return res.modified_count == 1

    async def delete_outfit(self, *, user_id: str, outfit_id: str) -> bool:
        res = await self.db[COLL].delete_one(
            {"_id": ObjectId(outfit_id), "user_id": ObjectId(user_id)}
        )
        return res.deleted_count == 1

    async def migrate_session_to_user(self, *, session_id: str, user_id: str) -> int:
        res = await self.db[COLL].update_many(
            {"session_id": session_id, "user_id": None},
            {"$set": {"user_id": ObjectId(user_id), "updated_at": datetime.utcnow()}}
        )
        logger.info(
            f"Migrated {res.modified_count} outfits from session {session_id} to user {user_id}"
        )
        return res.modified_count
