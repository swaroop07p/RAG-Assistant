from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.services.summary_service import SummaryService
from app.db.mongodb import db
from bson import ObjectId

router = APIRouter()

@router.get("/{document_id}")
async def get_summary(document_id: str, current_user: dict = Depends(get_current_user)):
    doc = await db.db.documents.find_one({"_id": ObjectId(document_id), "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    summary = await db.db.summaries.find_one({"document_id": document_id})
    return summary or {"short_summary": doc.get("summary", "Summary not generated yet.")}

@router.post("/generate/{document_id}")
async def generate_summary(document_id: str, current_user: dict = Depends(get_current_user)):
    doc = await db.db.documents.find_one({"_id": ObjectId(document_id), "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Aggregate first 15 chunks of document
    cursor = db.db.document_chunks.find({"document_id": document_id}).limit(15)
    text_sample = ""
    async for chunk in cursor:
        text_sample += chunk["text"] + " "

    if not text_sample:
        raise HTTPException(status_code=400, detail="Document contains no readable text to summarize")

    summary_data = await SummaryService.generate_document_summary(text_sample)
    summary_data["document_id"] = document_id
    summary_data["user_id"] = current_user["_id"]

    await db.db.summaries.update_one(
        {"document_id": document_id},
        {"$set": summary_data},
        upsert=True
    )
    return summary_data