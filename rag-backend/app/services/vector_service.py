from sentence_transformers import SentenceTransformer
from qdrant_client.http.models import PointStruct, Filter, FieldCondition, MatchValue, MatchAny, FilterSelector
from app.db.qdrant import get_qdrant_client
from app.core.config import settings
from typing import List, Dict, Any
import uuid

model = SentenceTransformer('BAAI/bge-small-en-v1.5')

class VectorService:
    @staticmethod
    def generate_embeddings(texts: List[str]) -> List[List[float]]:
        return model.encode(texts, convert_to_numpy=True).tolist()

    @staticmethod
    def store_chunks(user_id: str, doc_id: str, doc_name: str, chunks: List[Dict[str, Any]]):
        qdrant = get_qdrant_client()
        texts = [c["text"] for c in chunks]
        embeddings = VectorService.generate_embeddings(texts)

        points = []
        for i, chunk in enumerate(chunks):
            point_id = str(uuid.uuid4())
            points.append(PointStruct(
                id=point_id,
                vector=embeddings[i],
                payload={
                    "user_id": str(user_id),
                    "document_id": str(doc_id),
                    "document_name": str(doc_name),
                    "page_number": int(chunk["page_number"]),
                    "chunk_index": int(chunk["chunk_index"]),
                    "chunk_id": str(chunk["chunk_id"]),
                    "text": str(chunk["text"])
                }
            ))

        qdrant.upsert(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            points=points
        )

    @staticmethod
    def search_similar(user_id: str, query: str, document_ids: List[str] = None, top_k: int = 10) -> List[Dict[str, Any]]:
        qdrant = get_qdrant_client()
        query_vector = VectorService.generate_embeddings([query])[0]

        must_conditions = [
            FieldCondition(key="user_id", match=MatchValue(value=str(user_id)))
        ]

        if document_ids and len(document_ids) > 0:
            must_conditions.append(
                FieldCondition(key="document_id", match=MatchAny(any=[str(d) for d in document_ids]))
            )

        search_result = qdrant.search(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            query_vector=query_vector,
            query_filter=Filter(must=must_conditions),
            limit=top_k
        )

        results = []
        for res in search_result:
            payload = res.payload or {}
            results.append({
                "score": float(res.score) if hasattr(res, 'score') else 0.0,
                "document_id": payload.get("document_id", ""),
                "document_name": payload.get("document_name", "Unknown Document"),
                "page_number": payload.get("page_number", 1),
                "chunk_index": payload.get("chunk_index", 0),
                "chunk_id": payload.get("chunk_id", ""),
                "text": payload.get("text", "")
            })
        return results

    @staticmethod
    def delete_document_vectors(user_id: str, doc_id: str):
        qdrant = get_qdrant_client()
        qdrant.delete(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            points_selector=FilterSelector(
                filter=Filter(must=[
                    FieldCondition(key="user_id", match=MatchValue(value=str(user_id))),
                    FieldCondition(key="document_id", match=MatchValue(value=str(doc_id)))
                ])
            )
        )