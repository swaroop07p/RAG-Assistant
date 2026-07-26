from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    original_name: str
    stored_file_url: str
    upload_date: datetime
    file_size_bytes: int
    number_of_pages: int
    processing_status: str
    summary: Optional[str] = None
    tags: List[str] = []

class DocumentRenameRequest(BaseModel):
    new_name: str