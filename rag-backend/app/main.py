from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.db.qdrant import init_qdrant
from app.api.v1 import auth, documents, chat, search, summary
from app.core.exceptions import RAGBaseException, rag_exception_handler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    await connect_to_mongo()
    init_qdrant()
    yield
    # Shutdown tasks
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",       # Local Vite frontend
#         "https://your-frontend.vercel.app" # Production Vercel frontend
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Or replace "*" with "https://your-frontend.vercel.app" later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat RAG"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])
app.include_router(summary.router, prefix="/api/v1/summary", tags=["Summary"])  # Registered summary router

app.add_exception_handler(RAGBaseException, rag_exception_handler)

@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}

@app.get("/")
def root():
    return {
        "message": "RAG Study Buddy API is running",
        "docs": "/docs",
        "health": "/health"
    }