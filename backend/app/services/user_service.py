"""User service for business logic."""

from sqlalchemy.orm import Session
from uuid import UUID
from app.repositories.user_repo import UserRepository
from app.core.security import hash_password, verify_password
from app.models.user import User, UserRole


class UserService:
    """Service for user operations."""

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db
        self.repo = UserRepository(db)

    def register_user(
        self,
        email: str,
        password: str,
        name: str,
        role: UserRole = None,
    ) -> User:
        """Register a new user."""
        if self.repo.exists(email):
            raise ValueError(f"User with email {email} already exists")

        # Automatically make the first user an Admin!
        if role is None:
            total_users = self.repo.count_users()
            role = UserRole.ADMIN if total_users == 0 else UserRole.DEVELOPER

        hashed_password = hash_password(password)
        user_data = {
            "email": email,
            "hashed_password": hashed_password,
            "name": name,
            "role": role,
        }
        return self.repo.create(user_data)

    def authenticate_user(self, email: str, password: str) -> User | None:
        """Authenticate user with email and password."""
        user = self.repo.get_by_email(email)
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        return user

    def get_user(self, user_id: UUID) -> User | None:
        """Get user by ID."""
        return self.repo.get_by_id(user_id)

    def get_all_users(self, page: int = 1, limit: int = 10) -> dict:
        """Get all users with pagination."""
        users, total = self.repo.list(page=page, limit=limit)
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": users,
        }

    def update_user(self, user_id: UUID, update_data: dict) -> User | None:
        """Update user information."""
        # Remove sensitive fields
        update_data.pop("password", None)
        update_data.pop("hashed_password", None)
        
        return self.repo.update(user_id, update_data)

    def delete_user(self, user_id: UUID) -> bool:
        """Delete user."""
        return self.repo.delete(user_id)
