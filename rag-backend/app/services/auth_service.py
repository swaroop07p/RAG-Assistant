from app.db.mongodb import db
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import RAGBaseException
from fastapi import status
from bson import ObjectId

class AuthService:
    @staticmethod
    async def register_user(user_in: UserCreate) -> dict:
        existing_user = await db.db.users.find_one({"email": user_in.email})
        if existing_user:
            raise RAGBaseException("User with this email already exists", status_code=status.HTTP_400_BAD_REQUEST)

        user_doc = {
            "email": user_in.email,
            "password": hash_password(user_in.password),
            "full_name": user_in.full_name
        }
        result = await db.db.users.insert_one(user_doc)
        user_doc["_id"] = str(result.inserted_id)
        return user_doc

    @staticmethod
    async def authenticate_user(email: str, password: str) -> str:
        user = await db.db.users.find_one({"email": email})
        if not user or not verify_password(password, user["password"]):
            raise RAGBaseException("Invalid email or password", status_code=status.HTTP_401_UNAUTHORIZED)

        # Generate 7-day access token
        access_token = create_access_token(subject=str(user["_id"]))
        return access_token

    @staticmethod
    async def get_user_by_id(user_id: str) -> dict:
        user = await db.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise RAGBaseException("User not found", status_code=status.HTTP_404_NOT_FOUND)
        user["_id"] = str(user["_id"])
        return user