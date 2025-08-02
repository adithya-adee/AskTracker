from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr
from .db_services import User
from fastapi import HTTPException, status
import hashlib
import jsonwebtoken as jwt
from datetime import datetime, timedelta
from typing import Optional

JWT_SECRET = "glitchy_moon"  # Use environment variable in production
JWT_ALGORITHM = "HS256"


class LoginUser(BaseModel):
    email: EmailStr
    password: str


class CreateUser(BaseModel):
    name: str
    email: EmailStr
    password: str
        


class UserResponse(BaseModel):
    id: int
    name: str
    email: str


class LoginResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"


class UserService:
    def _hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode()).hexdigest()

    def _verify_password(self, hashed_password: str, password: str) -> bool:
        return hashed_password == hashlib.sha256(password.encode()).hexdigest()

    def _create_access_token(self, user_id: int, email: str) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(hours=24)
        payload = {"user_id": user_id, "email": email, "exp": expire}
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    def create_user(self, user: CreateUser, db: Session) -> UserResponse | None:
        """Create a new user"""
        if len(user.password) < 6:
            raise ValueError("Password must be at least 6 characters")

        # Check if user already exists
        existing_user = db.exec(select(User).where(User.email == user.email)).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        # Hash password and create user
        hashed_password = self._hash_password(user.password)

        db_user = User(name=user.name, email=user.email, password=hashed_password)

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        if not db_user or db_user.id is None:
            return None

        return UserResponse(id=db_user.id, name=db_user.name, email=db_user.email)

    def user_login(self, user: LoginUser, db: Session) -> LoginResponse | None:
        """Authenticate user and return token"""
        # Find user by email
        db_user : User | None = db.exec(select(User).where(User.email == user.email)).first()

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. Please sign up first.",
            )

        # Verify password
        if not self._verify_password(db_user.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
            )
        if not db_user or db_user.id is None:
            return None

        # Create access token
        access_token = self._create_access_token(db_user.id, db_user.email)
        

        return LoginResponse(
            user=UserResponse(id=db_user.id, name=db_user.name, email=db_user.email),
            access_token=access_token,
        )

    def get_user_by_id(self, user_id: int, db: Session) -> Optional[UserResponse]:
        """Get user by ID"""
        db_user = db.exec(select(User).where(User.id == user_id)).first()

        if not db_user or db_user.id is None:
            return None

        return UserResponse(id=db_user.id, name=db_user.name, email=db_user.email)


# Global service instance
user_service = UserService()
