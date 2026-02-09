from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import settings
import logging

logger = logging.getLogger(__name__)


class MongoDB:
    """MongoDB connection manager"""
    
    client: AsyncIOMotorClient = None
    database: AsyncIOMotorDatabase = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.mongodb_url)
            cls.database = cls.client[settings.database_name]
            
            # Test the connection
            await cls.client.admin.command('ping')
            logger.info(f"Connected to MongoDB at {settings.mongodb_url}")
            logger.info(f"Using database: {settings.database_name}")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")
    
    @classmethod
    def get_database(cls) -> AsyncIOMotorDatabase:
        """Get the database instance"""
        if cls.database is None:
            raise RuntimeError("Database not initialized. Call connect_db() first.")
        return cls.database


# Convenience function to get database
def get_db() -> AsyncIOMotorDatabase:
    return MongoDB.get_database()
