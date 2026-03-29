"""User model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class UserRole(str, enum.Enum):
    """User role enumeration."""
    ADMIN = "admin"
    DEVELOPER = "developer"


class User(Base):
    """User model."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.DEVELOPER)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    projects = relationship("Project", back_populates="created_by_user", foreign_keys="Project.created_by")
    member_projects = relationship(
        "Project",
        secondary="project_members",
        back_populates="members",
    )
    assigned_tasks = relationship("Task", back_populates="assigned_user", foreign_keys="Task.assigned_to")

    def __repr__(self):
        return f"<User {self.email}>"
