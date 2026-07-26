from google import genai
from google.genai import types
from app.core.config import settings
from app.services.vector_service import VectorService
from typing import List, Dict, Any
import json

client = genai.Client(api_key=settings.GEMINI_API_KEY)

class RAGService:
    @staticmethod
    async def generate_answer(user_id: str, question: str, document_ids: List[str] = None) -> Dict[str, Any]:
        # 1. Retrieve top-k chunks
        context_chunks = VectorService.search_similar(user_id, question, document_ids, top_k=5)

        # 2. Build Context Prompt
        context_str = "\n\n".join([
            f"[Source: {c['document_name']}, Page: {c['page_number']}, ChunkID: {c['chunk_id']}]\n{c['text']}"
            for c in context_chunks
        ])

        system_instruction = """
        You are an Enterprise RAG Assistant. Your goal is to answer questions strictly based on the provided context chunks.
        If the context does not contain enough information, state that clearly.
        Output your response as JSON in the following format:
        {
          "answer": "Your detailed context-aware response here...",
          "followup_questions": [
            "Followup question 1?",
            "Followup question 2?",
            "Followup question 3?"
          ]
        }
        """

        user_prompt = f"Context:\n{context_str}\n\nQuestion: {question}"

        # 3. Query Gemini 2.5 Flash
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.2
            )
        )

        try:
            parsed_res = json.loads(response.text)
        except Exception:
            parsed_res = {
                "answer": response.text,
                "followup_questions": []
            }

        return {
            "answer": parsed_res.get("answer", ""),
            "suggested_followups": parsed_res.get("followup_questions", []),
            "citations": context_chunks
        }