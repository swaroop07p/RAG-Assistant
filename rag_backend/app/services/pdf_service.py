import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
from typing import List, Dict, Any
from app.core.config import settings
from app.core.logging import logger

if settings.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

class PDFService:
    @staticmethod
    def process_and_chunk_pdf(pdf_bytes: bytes, chunk_size: int = 500, overlap: int = 50) -> Dict[str, Any]:
        """
        Extracts text (with OCR fallback for scanned pages) and splits into overlapping chunks.
        """
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages_text = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text").strip()

            # Scanned document detection: if extracted text length is negligible, trigger OCR
            if len(text) < 30:
                logger.info(f"Page {page_num + 1} appears scanned. Executing OCR...")
                pix = page.get_pixmap()
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                text = pytesseract.image_to_string(img).strip()

            pages_text.append({"page_number": page_num + 1, "text": text})

        # Text Chunking Logic
        chunks = []
        chunk_counter = 0

        for page_data in pages_text:
            p_num = page_data["page_number"]
            p_text = page_data["text"]

            if not p_text:
                continue

            start = 0
            text_len = len(p_text)

            while start < text_len:
                end = min(start + chunk_size, text_len)
                chunk_str = p_text[start:end]
                
                chunk_counter += 1
                chunks.append({
                    "chunk_id": f"chunk_{p_num}_{chunk_counter}",
                    "page_number": p_num,
                    "text": chunk_str
                })
                
                start += (chunk_size - overlap)

        return {
            "total_pages": len(doc),
            "chunks": chunks
        }