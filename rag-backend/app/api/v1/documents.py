from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from app.schemas.document import DocumentResponse, DocumentRenameRequest
from app.api.deps import get_current_user
from app.services.storage_service import StorageService
from app.services.pdf_service import PDFService
from app.services.vector_service import VectorService
from app.services.summary_service import SummaryService
from app.db.mongodb import db
import logging

logger = logging.getLogger("rag_app")

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # CHANGE THIS LINE to use .lower()
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        file_bytes = await file.read()
        
        # 1. Upload to Cloudinary
        file_url = await StorageService.upload_pdf(file_bytes, file.filename)

        # 2. Extract & Chunk PDF
        pdf_info = PDFService.process_and_chunk_pdf(file_bytes)

        # 3. Create document record in MongoDB
        doc_meta = {
            "user_id": str(current_user["_id"]),
            "original_name": file.filename,
            "stored_file_url": file_url,
            "upload_date": datetime.utcnow(),
            "file_size_bytes": len(file_bytes),
            "number_of_pages": pdf_info["total_pages"],
            "processing_status": "PROCESSED",
            "summary": None,
            "tags": []
        }
        inserted = await db.db.documents.insert_one(doc_meta)
        doc_id = str(inserted.inserted_id)

        # 4. Generate & Store Embeddings in Qdrant
        VectorService.store_chunks(
            user_id=str(current_user["_id"]),
            doc_id=doc_id,
            doc_name=file.filename,
            chunks=pdf_info["chunks"]
        )

        # Save chunks in MongoDB for Keyword search
        mongo_chunks = [
            {
                "user_id": str(current_user["_id"]),
                "document_id": doc_id,
                "document_name": file.filename,
                "page_number": c["page_number"],
                "chunk_index": c.get("chunk_index", 0),
                "chunk_id": c["chunk_id"],
                "text": c["text"]
            } for c in pdf_info["chunks"]
        ]
        if mongo_chunks:
            await db.db.document_chunks.insert_many(mongo_chunks)

        # 5. Summarize PDF text
        sample_text = " ".join([c["text"] for c in pdf_info["chunks"][:10]])
        try:
            summary_data = await SummaryService.generate_document_summary(sample_text)
            summary_text = summary_data.get("short_summary", "Summary generated.")
        except Exception as e:
            logger.warning(f"Summary generation failed: {e}")
            summary_text = "Summary unavailable."

        await db.db.documents.update_one(
            {"_id": inserted.inserted_id},
            {"$set": {"summary": summary_text}}
        )
        doc_meta["summary"] = summary_text

        return DocumentResponse(id=doc_id, **doc_meta)
    
    except Exception as e:
        logger.error(f"Upload pipeline failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload Error: {str(e)}")

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(current_user: dict = Depends(get_current_user)):
    cursor = db.db.documents.find({"user_id": current_user["_id"]})
    docs = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        docs.append(DocumentResponse(**doc))
    return docs

@router.delete("/{document_id}", status_code=200)
async def delete_document(document_id: str, current_user: dict = Depends(get_current_user)):
    doc = await db.db.documents.find_one({"_id": ObjectId(document_id), "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete from Qdrant
    VectorService.delete_document_vectors(current_user["_id"], document_id)

    # Delete from Mongo
    await db.db.documents.delete_one({"_id": ObjectId(document_id)})

    return {"message": "Document deleted successfully"}

@router.put("/{document_id}/rename", response_model=DocumentResponse)
async def rename_document(
    document_id: str,
    body: DocumentRenameRequest,
    current_user: dict = Depends(get_current_user)
):
    result = await db.db.documents.find_one_and_update(
        {"_id": ObjectId(document_id), "user_id": current_user["_id"]},
        {"$set": {"original_name": body.new_name}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Document not found")
    result["id"] = str(result.pop("_id"))
    return DocumentResponse(**result)