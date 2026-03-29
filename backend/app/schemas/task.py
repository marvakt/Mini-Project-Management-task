"""Task schemas for request/response validation."""

from pydantic import BaseModel
from datetime import datetime, date
from uuid import UUID
from typing import Optional
from app.models.task import TaskStatus


class TaskBase(BaseModel):
    """Base task schema."""
    title: str
    description: Optional[str] = None


class TaskCreate(TaskBase):
    """Schema for creating task."""
    project_id: UUID
    assigned_to: Optional[UUID] = None
    status: TaskStatus = TaskStatus.TODO
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    """Schema for updating task."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[date] = None


class TaskAssignRequest(BaseModel):
    """Schema for assigning task."""
    assigned_to: Optional[UUID] = None


class TaskStatusRequest(BaseModel):
    """Schema for updating task status."""
    status: TaskStatus


class TaskResponse(TaskBase):
    """Schema for task response."""
    id: UUID
    status: TaskStatus
    project_id: UUID
    assigned_to: Optional[UUID]
    due_date: Optional[date]
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True


class TaskListResponse(BaseModel):
    """Schema for paginated task list response."""
    total: int
    page: int
    limit: int
    items: list[TaskResponse]
