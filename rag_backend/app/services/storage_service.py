import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

class StorageService:
    @staticmethod
    async def upload_pdf(file_bytes: bytes, filename: str) -> str:
        response = cloudinary.uploader.upload(
            file_bytes,
            resource_type="image", # CHANGED FROM "raw"
            folder="rag_documents",
            public_id=filename
        )
        return response.get("secure_url")

    @staticmethod
    async def delete_file(public_id: str):
        try:
            cloudinary.uploader.destroy(public_id, resource_type="image") # CHANGED FROM "raw"
        except Exception as e:
            print(f"Cloudinary deletion failed: {e}")