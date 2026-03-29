"""Task service for business logic."""

from sqlalchemy.orm import Session
from uuid import UUID
from app.repositories.task_repo import TaskRepository
from app.models.task import Task, TaskStatus


class TaskService:
    """Service for task operations."""

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db
        self.repo = TaskRepository(db)

    def create_task(
        self,
        title: str,
        description: str | None,
        project_id: UUID,
        assigned_to: UUID | None = None,
        status: TaskStatus = TaskStatus.TODO,
        due_date=None,
    ) -> Task:
        """Create new task."""
        task_data = {
            "title": title,
            "description": description,
            "project_id": project_id,
            "assigned_to": assigned_to,
            "status": status,
            "due_date": due_date,
        }
        return self.repo.create(task_data)

    def get_task(self, task_id: UUID) -> Task | None:
        """Get task by ID."""
        return self.repo.get_by_id(task_id)

    def get_all_tasks(
        self,
        page: int = 1,
        limit: int = 10,
        project_id: UUID | None = None,
        project_ids: list[UUID] | None = None,
        status: TaskStatus | None = None,
        assigned_to: UUID | None = None,
    ) -> dict:
        """Get all tasks with filters and pagination."""
        tasks, total = self.repo.list(
            page=page,
            limit=limit,
            project_id=project_id,
            project_ids=project_ids,
            status=status,
            assigned_to=assigned_to,
        )
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": tasks,
        }

    def update_task(self, task_id: UUID, update_data: dict) -> Task | None:
        """Update task."""
        # Remove read-only fields
        update_data.pop("project_id", None)
        update_data.pop("created_at", None)
        
        return self.repo.update(task_id, update_data)

    def assign_task(self, task_id: UUID, user_id: UUID | None) -> Task | None:
        """Assign task to user."""
        return self.repo.assign(task_id, user_id)

    def update_task_status(self, task_id: UUID, status: TaskStatus) -> Task | None:
        """Update task status."""
        return self.repo.update_status(task_id, status)

    def delete_task(self, task_id: UUID) -> bool:
        """Delete task."""
        return self.repo.delete(task_id)

    def get_project_tasks(
        self,
        project_id: UUID,
        page: int = 1,
        limit: int = 10,
        status: TaskStatus | None = None,
    ) -> dict:
        """Get tasks for a project."""
        tasks, total = self.repo.list(
            page=page,
            limit=limit,
            project_id=project_id,
            status=status,
        )
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": tasks,
        }

    def get_user_tasks(
        self,
        user_id: UUID,
        page: int = 1,
        limit: int = 10,
        status: TaskStatus | None = None,
    ) -> dict:
        """Get tasks assigned to a user."""
        tasks, total = self.repo.list(
            page=page,
            limit=limit,
            assigned_to=user_id,
            status=status,
        )
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": tasks,
        }
