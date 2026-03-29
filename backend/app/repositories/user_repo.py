"""User repository for database operations."""

from typing import Tuple, List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.user import User


class UserRepository:
    """Repository for user database operations."""

    def __init__(self, db: Session):
        """Initialize repository with database session."""
        self.db = db

    def get_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()

    def create(self, user_data: dict) -> User:
        """Create new user."""
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def list(self, page: int = 1, limit: int = 10) -> Tuple[List[User], int]:
        """List users with pagination."""
        query = self.db.query(User)
        total = query.count()
        users = query.offset((page - 1) * limit).limit(limit).all()
        return users, total

    def update(self, user_id: UUID, update_data: dict) -> Optional[User]:
        """Update user."""
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        for key, value in update_data.items():
            if value is not None:
                setattr(user, key, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user_id: UUID) -> bool:
        """Delete user."""
        user = self.get_by_id(user_id)
        if not user:
            return False
        
        self.db.delete(user)
        self.db.commit()
        return True

    def exists(self, email: str) -> bool:
        """Check if user with email exists."""
        return self.db.query(User).filter(User.email == email).first() is not None

    def count_users(self) -> int:
        """Count the total number of users in the database."""
        return self.db.query(User).count()
