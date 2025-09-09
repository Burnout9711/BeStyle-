from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Import routes
from routes.quiz_routes import router as quiz_router
from routes.waitlist_routes import router as waitlist_router
from routes.auth_routes import router as auth_router
from routes.outfit_routes import router as outfit_router
from database import connect_to_mongo, close_mongo_connection

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting BeStyle.AI Backend...")
    await connect_to_mongo()
    logger.info("Backend startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down BeStyle.AI Backend...")
    await close_mongo_connection()
    logger.info("Backend shutdown complete")

# Create the main app with lifespan
app = FastAPI(
    title="BeStyle.AI API",
    description="AI-powered fashion recommendation platform",
    version="1.0.0",
    lifespan=lifespan
)

# Create a router with the /api prefix  
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {
        "message": "BeStyle.AI Backend API",
        "version": "1.0.0",
        "status": "healthy"
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "bestyle-ai-backend",
        "version": "1.0.0"
    }

# Include routers
app.include_router(quiz_router)
app.include_router(waitlist_router)
app.include_router(auth_router)
app.include_router(outfit_router)
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://aee48b5e-99d1-410a-847d-57b3c8a1b8c9.preview.emergentagent.com"  # Production frontend
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app", 
        host="0.0.0.0", 
        port=8001, 
        reload=True,
        log_level="info"
    )