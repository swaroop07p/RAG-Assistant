from fastapi import APIRouter, Depends
from app.schemas.search import SearchRequest, SearchResponse, SearchResultItem
from app.api.deps import get_current_user
from app.services.vector_service import VectorService
from app.db.mongodb import db

router = APIRouter()

@router.post("/semantic", response_model=SearchResponse)
async def semantic_search(body: SearchRequest, current_user: dict = Depends(get_current_user)):
    results = VectorService.search_similar(
        user_id=current_user["_id"],
        query=body.query,
        document_ids=body.document_ids,
        top_k=body.top_k
    )
    items = [SearchResultItem(**r) for r in results]
    return SearchResponse(query=body.query, search_type="semantic", total_results=len(items), results=items)


@router.post("/keyword", response_model=SearchResponse)
async def keyword_search(body: SearchRequest, current_user: dict = Depends(get_current_user)):
    # MongoDB regex text search over stored document chunks metadata
    query_filter = {
        "user_id": current_user["_id"],
        "text": {"$regex": body.query, "$options": "i"}
    }
    if body.document_ids:
        query_filter["document_id"] = {"$in": body.document_ids}

    cursor = db.db.document_chunks.find(query_filter).limit(body.top_k)
    items = []
    async for doc in cursor:
        items.append(SearchResultItem(
            document_id=doc["document_id"],
            document_name=doc.get("document_name", "Unknown"),
            page_number=doc["page_number"],
            chunk_id=doc["chunk_id"],
            text=doc["text"],
            score=1.0
        ))
    return SearchResponse(query=body.query, search_type="keyword", total_results=len(items), results=items)


@router.post("/hybrid", response_model=SearchResponse)
async def hybrid_search(body: SearchRequest, current_user: dict = Depends(get_current_user)):
    # Combine Semantic & Keyword search results with deduplication
    semantic_res = VectorService.search_similar(current_user["_id"], body.query, body.document_ids, top_k=body.top_k)
    
    seen_chunks = {r["chunk_id"] for r in semantic_res}
    combined = list(semantic_res)

    # Fetch additional keyword hits if top_k is not reached
    cursor = db.db.document_chunks.find({
        "user_id": current_user["_id"],
        "text": {"$regex": body.query, "$options": "i"}
    }).limit(body.top_k)

    async for doc in cursor:
        if doc["chunk_id"] not in seen_chunks:
            combined.append({
                "document_id": doc["document_id"],
                "document_name": doc.get("document_name", "Unknown"),
                "page_number": doc["page_number"],
                "chunk_id": doc["chunk_id"],
                "text": doc["text"],
                "score": 0.5
            })

    items = [SearchResultItem(**r) for r in combined[:body.top_k]]
    return SearchResponse(query=body.query, search_type="hybrid", total_results=len(items), results=items)