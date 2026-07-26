from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.chat import AskQuestionRequest, ChatAnswerResponse, ChatSessionResponse
from app.api.deps import get_current_user
from app.services.rag_service import RAGService
from app.db.mongodb import db
from datetime import datetime
from bson import ObjectId
from typing import List

router = APIRouter()

@router.post("/ask", response_model=ChatAnswerResponse)
async def ask_question(body: AskQuestionRequest, current_user: dict = Depends(get_current_user)):
    rag_res = await RAGService.generate_answer(
        user_id=current_user["_id"],
        question=body.question,
        document_ids=body.document_ids
    )

    chat_id = body.chat_id
    if not chat_id:
        chat_doc = {
            "user_id": current_user["_id"],
            "title": body.question[:35] + "...",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        res = await db.db.chats.insert_one(chat_doc)
        chat_id = str(res.inserted_id)

    message_doc = {
        "chat_id": chat_id,
        "user_id": current_user["_id"],
        "question": body.question,
        "answer": rag_res["answer"],
        "citations": rag_res["citations"],
        "timestamp": datetime.utcnow().isoformat()
    }
    await db.db.chat_messages.insert_one(message_doc)

    return ChatAnswerResponse(
        chat_id=chat_id,
        question=body.question,
        answer=rag_res["answer"],
        citations=rag_res["citations"],
        suggested_followups=rag_res["suggested_followups"]
    )

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(current_user: dict = Depends(get_current_user)):
    cursor = db.db.chats.find({"user_id": current_user["_id"]}).sort("updated_at", -1)
    sessions = []
    async for c in cursor:
        sessions.append(ChatSessionResponse(
            id=str(c["_id"]),
            title=c["title"],
            created_at=c["created_at"],
            updated_at=c["updated_at"]
        ))
    return sessions

@router.get("/sessions/{chat_id}/messages")
async def get_chat_messages(chat_id: str, current_user: dict = Depends(get_current_user)):
    cursor = db.db.chat_messages.find({"chat_id": chat_id, "user_id": current_user["_id"]}).sort("timestamp", 1)
    messages = []
    async for m in cursor:
        m["_id"] = str(m["_id"])
        messages.append(m)
    return messages

@router.delete("/sessions/{chat_id}", status_code=200)
async def delete_chat_session(chat_id: str, current_user: dict = Depends(get_current_user)):
    await db.db.chats.delete_one({"_id": ObjectId(chat_id), "user_id": current_user["_id"]})
    await db.db.chat_messages.delete_many({"chat_id": chat_id})
    return {"message": "Chat session and history deleted successfully"}

@router.put("/sessions/{chat_id}/rename")
async def rename_chat_session(chat_id: str, title: str, current_user: dict = Depends(get_current_user)):
    await db.db.chats.update_one(
        {"_id": ObjectId(chat_id), "user_id": current_user["_id"]},
        {"$set": {"title": title, "updated_at": datetime.utcnow().isoformat()}}
    )
    return {"message": "Chat renamed successfully"}