"""User schemas for request/response validation."""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from typing import Optional
from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema."""
    name: str
    email: EmailStr
    role: UserRole = UserRole.DEVELOPER


class UserCreate(UserBase):
    """Schema for creating user."""
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user."""
    name: Optional[str] = None
    role: Optional[UserRole] = None


class UserResponse(UserBase):
    """Schema for user response."""
    id: UUID
    created_at: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True


class UserListResponse(BaseModel):
    """Schema for paginated user list response."""
    total: int
    page: int
    limit: int
    items: list[UserResponse]
