"""Task model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class TaskStatus(str, enum.Enum):
    """Task status enumeration."""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class Task(Base):
    """Task model."""

    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.TODO)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_to])

    def __repr__(self):
        return f"<Task {self.title}>"
