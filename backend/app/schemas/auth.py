"""Auth schemas for authentication."""

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    """Schema for user registration."""
    name: str
    email: EmailStr
    password: str
