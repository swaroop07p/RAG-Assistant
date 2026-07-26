from pydantic import BaseModel
from typing import List, Optional

class CitationSchema(BaseModel):
    document_id: str
    document_name: str
    page_number: int
    chunk_id: str
    score: float

class AskQuestionRequest(BaseModel):
    chat_id: Optional[str] = None
    question: str
    document_ids: Optional[List[str]] = None  # None = search across all docs

class ChatAnswerResponse(BaseModel):
    chat_id: str
    question: str
    answer: str
    citations: List[CitationSchema]
    suggested_followups: List[str]

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str