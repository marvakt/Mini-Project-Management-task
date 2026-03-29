"""Task repository for database operations."""

from typing import Tuple, List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.task import Task, TaskStatus


class TaskRepository:
    """Repository for task database operations."""

    def __init__(self, db: Session):
        """Initialize repository with database session."""
        self.db = db

    def get_by_id(self, task_id: UUID) -> Optional[Task]:
        """Get task by ID."""
        return self.db.query(Task).filter(Task.id == task_id).first()

    def create(self, task_data: dict) -> Task:
        """Create new task."""
        task = Task(**task_data)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def list(
        self,
        page: int = 1,
        limit: int = 10,
        project_id: Optional[UUID] = None,
        project_ids: Optional[list[UUID]] = None,
        status: Optional[TaskStatus] = None,
        assigned_to: Optional[UUID] = None,
    ) -> Tuple[List[Task], int]:
        """List tasks with filters and pagination."""
        query = self.db.query(Task)
        
        if project_ids is not None:
            query = query.filter(Task.project_id.in_(project_ids))
        if project_id:
            query = query.filter(Task.project_id == project_id)
        if status:
            query = query.filter(Task.status == status)
        if assigned_to:
            query = query.filter(Task.assigned_to == assigned_to)
        
        total = query.count()
        tasks = query.offset((page - 1) * limit).limit(limit).all()
        return tasks, total

    def update(self, task_id: UUID, update_data: dict) -> Optional[Task]:
        """Update task."""
        task = self.get_by_id(task_id)
        if not task:
            return None
        
        for key, value in update_data.items():
            if value is not None:
                setattr(task, key, value)
        
        self.db.commit()
        self.db.refresh(task)
        return task

    def assign(self, task_id: UUID, user_id: Optional[UUID]) -> Optional[Task]:
        """Assign task to user."""
        task = self.get_by_id(task_id)
        if not task:
            return None
        
        task.assigned_to = user_id
        self.db.commit()
        self.db.refresh(task)
        return task

    def update_status(self, task_id: UUID, status: TaskStatus) -> Optional[Task]:
        """Update task status."""
        task = self.get_by_id(task_id)
        if not task:
            return None
        
        task.status = status
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task_id: UUID) -> bool:
        """Delete task."""
        task = self.get_by_id(task_id)
        if not task:
            return False
        
        self.db.delete(task)
        self.db.commit()
        return True
