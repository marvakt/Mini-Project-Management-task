"""Project schemas for request/response validation."""

from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class ProjectBase(BaseModel):
    """Base project schema."""
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Schema for creating project."""
    member_ids: list[UUID] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    """Schema for updating project."""
    name: Optional[str] = None
    description: Optional[str] = None
    member_ids: Optional[list[UUID]] = None


class ProjectResponse(ProjectBase):
    """Schema for project response."""
    id: UUID
    created_by: UUID
    member_ids: list[UUID] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Schema for paginated project list response."""
    total: int
    page: int
    limit: int
    items: list[ProjectResponse]
