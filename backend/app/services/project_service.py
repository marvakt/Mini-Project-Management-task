"""Project service for business logic."""

from sqlalchemy.orm import Session
from uuid import UUID
from app.repositories.project_repo import ProjectRepository
from app.models.project import Project


class ProjectService:
    """Service for project operations."""

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db
        self.repo = ProjectRepository(db)

    def create_project(
        self,
        name: str,
        description: str | None,
        created_by: UUID,
        member_ids: list[UUID] | None = None,
    ) -> Project:
        """Create new project."""
        project_data = {
            "name": name,
            "description": description,
            "created_by": created_by,
        }
        return self.repo.create(project_data, member_ids=member_ids)

    def get_project(self, project_id: UUID) -> Project | None:
        """Get project by ID."""
        return self.repo.get_by_id(project_id)

    def get_all_projects(self, page: int = 1, limit: int = 10) -> dict:
        """Get all projects with pagination."""
        projects, total = self.repo.list(page=page, limit=limit)
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": projects,
        }

    def update_project(self, project_id: UUID, update_data: dict) -> Project | None:
        """Update project."""
        # Remove read-only fields
        update_data.pop("created_by", None)
        update_data.pop("created_at", None)
        
        return self.repo.update(project_id, update_data)

    def delete_project(self, project_id: UUID) -> bool:
        """Delete project."""
        return self.repo.delete(project_id)

    def get_user_projects(self, user_id: UUID, page: int = 1, limit: int = 10) -> dict:
        """Get projects visible to a user."""
        projects, total = self.repo.list_for_user(user_id, page=page, limit=limit)
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": projects,
        }

    def get_accessible_project_ids(self, user_id: UUID) -> list[UUID]:
        """Get IDs for projects visible to a user."""
        return self.repo.get_accessible_project_ids(user_id)

    def user_has_access(self, project_id: UUID, user_id: UUID) -> bool:
        """Check whether a user can access a project."""
        return self.repo.user_has_access(project_id, user_id)
