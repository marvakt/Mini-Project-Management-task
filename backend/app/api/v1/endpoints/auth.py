"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenResponse, RegisterRequest
from app.services.user_service import UserService
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Refactored helper to safely set strict HttpOnly Cookies for Auth tokens."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
    )


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    """Register a new user."""
    user_service = UserService(db)

    try:
        user = user_service.register_user(
            email=request.email,
            password=request.password,
            name=request.name,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    _set_auth_cookies(response, access_token, refresh_token)

    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Login user, secure cookies, and return JWT token."""
    user_service = UserService(db)

    user = user_service.authenticate_user(
        email=request.email,
        password=request.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    _set_auth_cookies(response, access_token, refresh_token)

    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, response: Response):
    """Use an existing Refresh token from cookies to grab a new Access Token."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    payload = decode_token(refresh_token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    user_id = payload.get("sub")
    
    # Generate new tokens
    access_token = create_access_token(data={"sub": user_id})
    new_refresh_token = create_refresh_token(data={"sub": user_id})
    
    _set_auth_cookies(response, access_token, new_refresh_token)
    
    return TokenResponse(access_token=access_token)


@router.post("/logout")
async def logout(response: Response):
    """Clear cookies completely to purge out user."""
    response.delete_cookie(key="access_token", samesite="lax")
    response.delete_cookie(key="refresh_token", samesite="lax")
    return {"message": "Successfully logged out securely"}
