"""User endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_current_admin
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserListResponse, UserUpdate, UserCreate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Admin creates a new user."""
    user_service = UserService(db)
    
    try:
        user = user_service.register_user(
            email=user_data.email,
            password=user_data.password,
            name=user_data.name,
            role=user_data.role,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    return user

@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """List all users with pagination (Admin only)."""
    user_service = UserService(db)
    result = user_service.get_all_users(page=page, limit=limit)
    return result


@router.get("/me", response_model=UserResponse)
async def get_user_me(current_user: User = Depends(get_current_user)):
    """Get current logged in user directly from token."""
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user by ID."""
    try:
        user_id = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )

    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user",
        )
    
    user_service = UserService(db)
    user = user_service.get_user(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user (admin only or self)."""
    try:
        user_id_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )
    
    # Check if user is updating themselves or is admin
    if current_user.id != user_id_uuid and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user",
        )
    
    user_service = UserService(db)
    updated_user = user_service.update_user(
        user_id_uuid,
        update_data.model_dump(exclude_unset=True),
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return updated_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete user (admin only)."""
    try:
        user_id_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )
    
    user_service = UserService(db)
    deleted = user_service.delete_user(user_id_uuid)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
