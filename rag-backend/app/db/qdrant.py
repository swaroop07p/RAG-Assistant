from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PayloadSchemaType
from app.core.config import settings
from app.core.logging import logger

qdrant_client: QdrantClient = None

def init_qdrant():
    global qdrant_client
    logger.info("Connecting to Qdrant Cloud...")
    qdrant_client = QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY
    )
    
    # Initialize collection if not existing
    collections = qdrant_client.get_collections().collections
    exists = any(c.name == settings.QDRANT_COLLECTION_NAME for c in collections)
    
    if not exists:
        logger.info(f"Creating Qdrant collection: {settings.QDRANT_COLLECTION_NAME}")
        qdrant_client.create_collection(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE) # <--- Changed size to 768
        )

    # Create payload indexes required by Qdrant Cloud for filtered search
    logger.info("Creating payload indexes for user_id and document_id...")
    try:
        qdrant_client.create_payload_index(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            field_name="user_id",
            field_schema=PayloadSchemaType.KEYWORD
        )
        qdrant_client.create_payload_index(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            field_name="document_id",
            field_schema=PayloadSchemaType.KEYWORD
        )
    except Exception as e:
        logger.info(f"Payload indexes already exist or created: {e}")

    logger.info("Qdrant initialized successfully.")

def get_qdrant_client() -> QdrantClient:
    return qdrant_client