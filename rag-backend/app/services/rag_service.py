from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from app.core.config import settings
from app.services.vector_service import VectorService
from app.db.mongodb import db
from typing import List, Dict, Any
import json
import logging

logger = logging.getLogger("rag_app")
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Force Gemini to ALWAYS return this exact structure
class GeminiRAGResponse(BaseModel):
    answer: str = Field(description="The detailed answer to the user's question.")
    insufficient_flag: bool = Field(description="Set to true ONLY if context lacks details.")
    followup_questions: list[str] = Field(description="Exactly 3 suggested follow-up questions related to the topic.")

class RAGService:
    @staticmethod
    async def fetch_neighbor_chunks(user_id: str, retrieved_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        expanded_chunk_map = {}
        for chunk in retrieved_chunks:
            doc_id = chunk["document_id"]
            idx = chunk["chunk_index"]
            neighbor_indexes = [max(1, idx - 1), idx, idx + 1]
            
            cursor = db.db.document_chunks.find({
                "user_id": user_id,
                "document_id": doc_id,
                "chunk_index": {"$in": neighbor_indexes}
            })

            async for mongo_chunk in cursor:
                c_id = mongo_chunk["chunk_id"]
                if c_id not in expanded_chunk_map:
                    expanded_chunk_map[c_id] = {
                        "document_id": mongo_chunk["document_id"],
                        "document_name": mongo_chunk.get("document_name", "Document"),
                        "page_number": mongo_chunk["page_number"],
                        "chunk_index": mongo_chunk.get("chunk_index", 0),
                        "chunk_id": mongo_chunk["chunk_id"],
                        "text": mongo_chunk["text"],
                        "score": chunk.get("score", 0.8)
                    }

        sorted_chunks = sorted(
            expanded_chunk_map.values(), 
            key=lambda x: (x["document_id"], x["chunk_index"])
        )
        return sorted_chunks

    @staticmethod
    async def query_gemini(context_chunks: List[Dict[str, Any]], question: str) -> Dict[str, Any]:
        if not context_chunks:
            return {
                "answer": "I couldn't find any relevant information in your selected documents to answer this question.",
                "insufficient_flag": True,
                "followup_questions": ["What documents are currently uploaded?", "Can you rephrase the question?"]
            }

        context_str = "\n\n".join([
            f"[Source: {c['document_name']}, Page: {c['page_number']}, ChunkID: {c['chunk_id']}]\n{c['text']}"
            for c in context_chunks
        ])

        system_instruction = "You are an Enterprise RAG Assistant. Synthesize the context to give a complete answer. Do not say information is cut off if the context provides enough detail."
        user_prompt = f"Context:\n{context_str}\n\nQuestion: {question}"

        try:
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=GeminiRAGResponse, # Enforces strict JSON output
                    temperature=0.2
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini API Error: {str(e)}")
            return {
                "answer": "I am currently experiencing an issue connecting to the AI model. Please try again in a moment.",
                "insufficient_flag": False,
                "followup_questions": ["Can you try asking again?"]
            }

    @staticmethod
    async def generate_answer(user_id: str, question: str, document_ids: List[str] = None) -> Dict[str, Any]:
        initial_chunks = VectorService.search_similar(user_id, question, document_ids, top_k=10)
        
        expanded_chunks = await RAGService.fetch_neighbor_chunks(user_id, initial_chunks)
        if not expanded_chunks:
            expanded_chunks = initial_chunks

        result = await RAGService.query_gemini(expanded_chunks, question)

        if result.get("insufficient_flag") and len(initial_chunks) > 0:
            retry_chunks = VectorService.search_similar(user_id, question, document_ids, top_k=20)
            expanded_retry_chunks = await RAGService.fetch_neighbor_chunks(user_id, retry_chunks)
            
            if not expanded_retry_chunks:
                expanded_retry_chunks = retry_chunks

            if len(expanded_retry_chunks) > len(expanded_chunks):
                result = await RAGService.query_gemini(expanded_retry_chunks, question)
                expanded_chunks = expanded_retry_chunks

        unique_citations = []
        seen = set()
        for c in expanded_chunks:
            key = f"{c['document_id']}_{c['page_number']}"
            if key not in seen:
                seen.add(key)
                unique_citations.append(c)

        return {
            "answer": result.get("answer", "No answer could be generated."),
            "suggested_followups": result.get("followup_questions", []),
            "citations": unique_citations
        }