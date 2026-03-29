"""Project repository for database operations."""

from typing import Tuple, List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.project import Project
from app.models.user import User


class ProjectRepository:
    """Repository for project database operations."""

    def __init__(self, db: Session):
        """Initialize repository with database session."""
        self.db = db

    def get_by_id(self, project_id: UUID) -> Optional[Project]:
        """Get project by ID."""
        return self.db.query(Project).filter(Project.id == project_id).first()

    def _get_members(self, member_ids: list[UUID]) -> list[User]:
        """Resolve and validate project members."""
        normalized_member_ids = list(dict.fromkeys(member_ids))
        if not normalized_member_ids:
            return []

        members = (
            self.db.query(User)
            .filter(User.id.in_(normalized_member_ids))
            .all()
        )
        if len(members) != len(normalized_member_ids):
            raise ValueError("One or more selected members do not exist")
        return members

    def create(self, project_data: dict, member_ids: Optional[list[UUID]] = None) -> Project:
        """Create new project."""
        project = Project(**project_data)
        project.members = self._get_members(member_ids or [])
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def list(self, page: int = 1, limit: int = 10) -> Tuple[List[Project], int]:
        """List projects with pagination."""
        query = self.db.query(Project)
        total = query.count()
        projects = query.offset((page - 1) * limit).limit(limit).all()
        return projects, total

    def list_for_user(
        self,
        user_id: UUID,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[Project], int]:
        """List projects visible to a specific user."""
        query = self.db.query(Project).filter(
            or_(
                Project.created_by == user_id,
                Project.members.any(User.id == user_id),
            )
        )
        total = query.count()
        projects = query.offset((page - 1) * limit).limit(limit).all()
        return projects, total

    def get_accessible_project_ids(self, user_id: UUID) -> List[UUID]:
        """Return project IDs visible to a user."""
        return [
            project_id
            for (project_id,) in self.db.query(Project.id)
            .filter(
                or_(
                    Project.created_by == user_id,
                    Project.members.any(User.id == user_id),
                )
            )
            .all()
        ]

    def user_has_access(self, project_id: UUID, user_id: UUID) -> bool:
        """Check whether a user can access a project."""
        return (
            self.db.query(Project)
            .filter(
                Project.id == project_id,
                or_(
                    Project.created_by == user_id,
                    Project.members.any(User.id == user_id),
                ),
            )
            .first()
            is not None
        )

    def update(self, project_id: UUID, update_data: dict) -> Optional[Project]:
        """Update project."""
        project = self.get_by_id(project_id)
        if not project:
            return None

        member_ids = update_data.pop("member_ids", None)
        if member_ids is not None:
            project.members = self._get_members(member_ids)
        
        for key, value in update_data.items():
            if value is not None:
                setattr(project, key, value)
        
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project_id: UUID) -> bool:
        """Delete project."""
        project = self.get_by_id(project_id)
        if not project:
            return False
        
        self.db.delete(project)
        self.db.commit()
        return True

    def list_by_creator(self, creator_id: UUID, page: int = 1, limit: int = 10) -> Tuple[List[Project], int]:
        """List projects created by a specific user."""
        query = self.db.query(Project).filter(Project.created_by == creator_id)
        total = query.count()
        projects = query.offset((page - 1) * limit).limit(limit).all()
        return projects, total
