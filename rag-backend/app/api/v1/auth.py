from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserCreate, UserResponse, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.db.mongodb import db
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_in: UserCreate):
    existing_user = await db.db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user_doc = {
        "email": user_in.email,
        "password": hash_password(user_in.password),
        "full_name": user_in.full_name
    }
    result = await db.db.users.insert_one(user_doc)
    return UserResponse(id=str(result.inserted_id), email=user_in.email, full_name=user_in.full_name)

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(subject=str(user["_id"]))
    return TokenResponse(access_token=access_token)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(id=current_user["_id"], email=current_user["email"], full_name=current_user["full_name"])