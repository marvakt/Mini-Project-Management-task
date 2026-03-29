"""Project model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

project_members = Table(
    "project_members",
    Base.metadata,
    Column("project_id", UUID(as_uuid=True), ForeignKey("projects.id"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
)


class Project(Base):
    """Project model."""

    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    created_by_user = relationship("User", back_populates="projects", foreign_keys=[created_by])
    members = relationship(
        "User",
        secondary=project_members,
        back_populates="member_projects",
    )
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

    @property
    def member_ids(self):
        """Return member IDs for API serialization."""
        return [member.id for member in self.members]

    def __repr__(self):
        return f"<Project {self.name}>"
