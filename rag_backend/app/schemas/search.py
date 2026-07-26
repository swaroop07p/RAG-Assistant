from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    document_ids: Optional[List[str]] = None
    top_k: int = 5

class SearchResultItem(BaseModel):
    document_id: str
    document_name: str
    page_number: int
    chunk_id: str
    text: str
    score: Optional[float] = None

class SearchResponse(BaseModel):
    query: str
    search_type: str
    total_results: int
    results: List[SearchResultItem]