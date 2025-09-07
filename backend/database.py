from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

# Global database instance
db_instance = Database()

async def connect_to_mongo():
    """Create database connection"""
    try:
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'bestyle_ai')
        
        logger.info(f"Connecting to MongoDB at {mongo_url}")
        
        db_instance.client = AsyncIOMotorClient(mongo_url)
        db_instance.database = db_instance.client[db_name]
        
        # Test the connection
        await db_instance.client.admin.command('ismaster')
        logger.info("Successfully connected to MongoDB")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    try:
        if db_instance.client:
            db_instance.client.close()
            logger.info("MongoDB connection closed")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {str(e)}")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        if db_instance.database is None:
            return
            
        db = db_instance.database
        
        # Quiz sessions indexes
        await db.quiz_sessions.create_index("session_id", unique=True)
        await db.quiz_sessions.create_index("created_at")
        await db.quiz_sessions.create_index("is_completed")
        
        # Waitlist indexes
        await db.waitlist.create_index("email", unique=True)
        await db.waitlist.create_index("created_at")
        await db.waitlist.create_index("source")
        
        # Outfits indexes (for future use)
        await db.outfits.create_index("occasion")
        await db.outfits.create_index("style_types")
        await db.outfits.create_index("is_active")
        await db.outfits.create_index("created_at")

        # add:
        await db.sessions.create_index("session_id", unique=True)
        await db.sessions.create_index("user_id")
        await db.sessions.create_index("last_seen_at", -1)
        # TTL: expire by 'expires_at'
        await db.sessions.create_index("expires_at", expireAfterSeconds=0)

        # Users indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("created_at")
        await db.users.create_index("style.current")
        await db.users.create_index("lifestyle.priority_occasions")

        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating database indexes: {str(e)}")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    if db_instance.database is None:
        raise Exception("Database not initialized")
    return db_instance.database

def get_collection(collection_name: str):
    """Get a specific collection"""
    db = get_database()
    return db[collection_name]