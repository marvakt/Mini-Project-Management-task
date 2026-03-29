"""Project endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectListResponse, ProjectUpdate
from app.models.user import User, UserRole
from app.services.project_service import ProjectService
from app.core.dependencies import get_current_user, get_current_admin

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create new project (admin only)."""
    project_service = ProjectService(db)
    try:
        project = project_service.create_project(
            name=project_data.name,
            description=project_data.description,
            created_by=current_user.id,
            member_ids=project_data.member_ids,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    return project


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all projects with pagination."""
    project_service = ProjectService(db)
    if current_user.role == UserRole.ADMIN:
        result = project_service.get_all_projects(page=page, limit=limit)
    else:
        result = project_service.get_user_projects(
            current_user.id,
            page=page,
            limit=limit,
        )
    return result


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get project by ID."""
    try:
        project_id_uuid = UUID(project_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project ID format",
        )
    
    project_service = ProjectService(db)
    project = project_service.get_project(project_id_uuid)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if (
        current_user.role != UserRole.ADMIN
        and not project_service.user_has_access(project_id_uuid, current_user.id)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this project",
        )
    
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    update_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update project (admin only)."""
    try:
        project_id_uuid = UUID(project_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project ID format",
        )
    
    project_service = ProjectService(db)
    project = project_service.get_project(project_id_uuid)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    try:
        updated_project = project_service.update_project(
            project_id_uuid,
            update_data.model_dump(exclude_unset=True),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    
    return updated_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete project (admin only)."""
    try:
        project_id_uuid = UUID(project_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project ID format",
        )
    
    project_service = ProjectService(db)
    deleted = project_service.delete_project(project_id_uuid)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
