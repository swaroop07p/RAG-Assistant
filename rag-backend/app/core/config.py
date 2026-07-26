from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Enterprise Document Intelligence Engine"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 Days

    MONGODB_URL: str
    DATABASE_NAME: str

    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    QDRANT_URL: str
    QDRANT_API_KEY: str
    QDRANT_COLLECTION_NAME: str = "document_chunks"

    GEMINI_API_KEY: str
    TESSERACT_CMD: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()