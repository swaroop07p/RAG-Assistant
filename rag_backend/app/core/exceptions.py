from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("rag_app")

# Custom Base Exception
class RAGBaseException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code

class DocumentProcessingError(RAGBaseException):
    def __init__(self, message: str = "Failed to process PDF or execute OCR"):
        super().__init__(message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

class VectorDBError(RAGBaseException):
    def __init__(self, message: str = "Error communicating with Qdrant Vector Database"):
        super().__init__(message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LLMGenerationError(RAGBaseException):
    def __init__(self, message: str = "Error receiving response from Gemini API"):
        super().__init__(message, status_code=status.HTTP_502_BAD_GATEWAY)

class StorageUploadError(RAGBaseException):
    def __init__(self, message: str = "Failed to upload file to Cloudinary"):
        super().__init__(message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Global Exception Handlers
async def rag_exception_handler(request: Request, exc: RAGBaseException):
    logger.error(f"RAG Exception on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.__class__.__name__, "detail": exc.message}
    )

async def global_exception_handler(request: Request, exc: Exception):
    logger.critical(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "InternalServerError", "detail": "An unexpected error occurred."}
    )