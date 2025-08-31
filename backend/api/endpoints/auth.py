"""
Authentication endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from typing import Optional
import jwt

from models.database import get_db
from models.schemas import UserCreate, UserResponse, Token
from core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Mock user data for demo purposes
MOCK_USERS = {
    "admin@retail.com": {
        "id": "1",
        "email": "admin@retail.com",
        "username": "admin",
        "full_name": "Admin User",
        "role": "admin",
        "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G"  # password123
    }
}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """User login endpoint."""
    # For demo purposes, accept any email with password "password123"
    if form_data.password == "password123":
        user_data = MOCK_USERS.get(form_data.username, {
            "id": "1",
            "email": form_data.username,
            "username": form_data.username.split("@")[0],
            "full_name": "Demo User",
            "role": "buyer"
        })
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data["email"]}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_data
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """User registration endpoint."""
    # This would create a new user in production
    # For demo purposes, just return the user data
    return UserResponse(
        id="new_user_id",
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

@router.get("/me", response_model=UserResponse)
async def read_users_me(token: str = Depends(oauth2_scheme)):
    """Get current user information."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_data = MOCK_USERS.get(email, {
        "id": "1",
        "email": email,
        "username": email.split("@")[0],
        "full_name": "Demo User",
        "role": "buyer"
    })
    
    return UserResponse(
        id=user_data["id"],
        email=user_data["email"],
        username=user_data["username"],
        full_name=user_data["full_name"],
        role=user_data["role"],
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
