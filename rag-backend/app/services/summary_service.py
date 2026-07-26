from google import genai
from google.genai import types
from app.core.config import settings
import json

client = genai.Client(api_key=settings.GEMINI_API_KEY)

class SummaryService:
    @staticmethod
    async def generate_document_summary(full_text_sample: str) -> dict:
        prompt = f"""
        Analyze the following text sample extracted from a document and generate a structured JSON summary:
        Text:
        {full_text_sample[:10000]}  # Truncated to avoid unnecessary token usage

        JSON Structure:
        {{
            "short_summary": "1-2 sentence high-level overview",
            "detailed_summary": "Paragraph summarization",
            "key_topics": ["topic1", "topic2"],
            "keywords": ["kw1", "kw2"],
            "concepts": ["concept1", "concept2"]
        }}
        """

        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3
            )
        )
        return json.loads(response.text)