"""Task endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskListResponse,
    TaskUpdate,
    TaskAssignRequest,
    TaskStatusRequest,
)
from app.models.user import User, UserRole
from app.models.task import TaskStatus
from app.services.project_service import ProjectService
from app.services.task_service import TaskService
from app.core.dependencies import get_current_user, get_current_admin

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create new task (admin only)."""
    project_service = ProjectService(db)
    project = project_service.get_project(task_data.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if (
        task_data.assigned_to
        and not project_service.user_has_access(task_data.project_id, task_data.assigned_to)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assigned user must be a project member",
        )

    task_service = TaskService(db)
    task = task_service.create_task(
        title=task_data.title,
        description=task_data.description,
        project_id=task_data.project_id,
        assigned_to=task_data.assigned_to,
        status=task_data.status,
        due_date=task_data.due_date,
    )
    return task


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    project_id: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    assigned_to: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List tasks with filters and pagination."""
    # Parse UUID filters
    project_id_uuid = None
    assigned_to_uuid = None
    task_status = None
    
    if project_id:
        try:
            project_id_uuid = UUID(project_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid project_id format",
            )
    
    if assigned_to:
        try:
            assigned_to_uuid = UUID(assigned_to)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid assigned_to format",
            )
    
    if status_filter:
        try:
            task_status = TaskStatus(status_filter)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join([s.value for s in TaskStatus])}",
            )
            
    project_service = ProjectService(db)
    if current_user.role != UserRole.ADMIN:
        accessible_project_ids = project_service.get_accessible_project_ids(current_user.id)
        if project_id_uuid and project_id_uuid not in accessible_project_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view tasks for this project",
            )
        if not accessible_project_ids and not project_id_uuid:
            return {
                "total": 0,
                "page": page,
                "limit": limit,
                "items": [],
            }
    else:
        accessible_project_ids = None
    
    task_service = TaskService(db)
    result = task_service.get_all_tasks(
        page=page,
        limit=limit,
        project_id=project_id_uuid,
        project_ids=accessible_project_ids if current_user.role != UserRole.ADMIN else None,
        status=task_status,
        assigned_to=assigned_to_uuid,
    )
    return result


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get task by ID."""
    try:
        task_id_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format",
        )
    
    task_service = TaskService(db)
    task = task_service.get_task(task_id_uuid)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
        
    project_service = ProjectService(db)
    if (
        current_user.role != UserRole.ADMIN
        and not project_service.user_has_access(task.project_id, current_user.id)
        and task.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this task",
        )
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    update_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update task details."""
    try:
        task_id_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format",
        )
    
    task_service = TaskService(db)
    task = task_service.get_task(task_id_uuid)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    
    updated_task = task_service.update_task(
        task_id_uuid,
        update_data.model_dump(exclude_unset=True),
    )
    
    return updated_task


@router.put("/{task_id}/assign", response_model=TaskResponse)
async def assign_task(
    task_id: str,
    assign_data: TaskAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Assign task to user."""
    try:
        task_id_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format",
        )
    
    task_service = TaskService(db)
    task = task_service.get_task(task_id_uuid)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    project_service = ProjectService(db)
    if (
        assign_data.assigned_to
        and not project_service.user_has_access(task.project_id, assign_data.assigned_to)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assigned user must be a project member",
        )
    
    updated_task = task_service.assign_task(task_id_uuid, assign_data.assigned_to)
    
    return updated_task


@router.put("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: str,
    status_data: TaskStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update task status."""
    try:
        task_id_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format",
        )
    
    task_service = TaskService(db)
    task = task_service.get_task(task_id_uuid)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
        
    project_service = ProjectService(db)
    if (
        current_user.role != UserRole.ADMIN
        and not project_service.user_has_access(task.project_id, current_user.id)
        and task.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update status for this task",
        )
    
    updated_task = task_service.update_task_status(task_id_uuid, status_data.status)
    
    return updated_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete task."""
    try:
        task_id_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format",
        )
    
    task_service = TaskService(db)
    deleted = task_service.delete_task(task_id_uuid)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
