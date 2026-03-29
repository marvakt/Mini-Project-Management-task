"""Tests for tasks endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import UserRole
from app.models.task import TaskStatus

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup():
    """Setup and cleanup for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def create_user(email, password, name, role=UserRole.DEVELOPER):
    """Create a user directly in the test database."""
    from app.core.security import hash_password
    from app.models.user import User

    db = TestingSessionLocal()
    user = User(
        email=email,
        name=name,
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.expunge(user)
    db.close()
    return user


def get_token_for_user(email, password):
    """Login a user and return an auth token."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )
    return response.json()["access_token"]


def setup_project_and_token():
    """Helper to create a project and get admin token."""
    from sqlalchemy.orm import Session
    from app.models.user import User
    from app.core.security import hash_password
    from app.models.project import Project
    
    db = TestingSessionLocal()
    
    # Create admin user
    admin = User(
        email="admin@example.com",
        name="Admin User",
        hashed_password=hash_password("adminpass"),
        role=UserRole.ADMIN,
    )
    db.add(admin)
    db.commit()
    
    # Create project
    project = Project(
        name="Test Project",
        description="Test project",
        created_by=admin.id,
    )
    db.add(project)
    db.commit()
    admin_id = str(admin.id)
    project_id = str(project.id)
    
    db.close()
    
    # Get token
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin@example.com",
            "password": "adminpass",
        },
    )
    token = response.json()["access_token"]
    
    return token, admin_id, project_id


def test_create_task():
    """Test creating a task."""
    token, admin_id, project_id = setup_project_and_token()
    
    response = client.post(
        "/api/v1/tasks",
        json={
            "title": "Test Task",
            "description": "A test task",
            "project_id": project_id,
            "status": "todo",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"


def test_list_tasks():
    """Test listing tasks."""
    token, admin_id, project_id = setup_project_and_token()
    
    # Create a task
    client.post(
        "/api/v1/tasks",
        json={
            "title": "Test Task",
            "description": "A test task",
            "project_id": project_id,
            "status": "todo",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    
    # List tasks
    response = client.get(
        "/api/v1/tasks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1


def test_filter_tasks_by_status():
    """Test filtering tasks by status."""
    token, admin_id, project_id = setup_project_and_token()
    
    # Create multiple tasks with different statuses
    client.post(
        "/api/v1/tasks",
        json={
            "title": "Task 1",
            "project_id": project_id,
            "status": "todo",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    
    client.post(
        "/api/v1/tasks",
        json={
            "title": "Task 2",
            "project_id": project_id,
            "status": "in_progress",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    
    # Filter by status
    response = client.get(
        "/api/v1/tasks?status=todo",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["status"] == "todo"


def setup_member_project_task():
    """Create a project, member access, and a task for permission tests."""
    from app.models.project import Project
    from app.models.task import Task

    admin = create_user("admin@example.com", "adminpass", "Admin User", UserRole.ADMIN)
    member = create_user("member@example.com", "memberpass", "Member User")
    outsider = create_user("outsider@example.com", "outsiderpass", "Outsider User")

    db = TestingSessionLocal()
    project = Project(
        name="Shared Project",
        description="Visible to members",
        created_by=admin.id,
    )
    project.members.append(db.get(type(member), member.id))
    db.add(project)
    db.commit()
    db.refresh(project)

    task = Task(
        title="Member Task",
        description="Visible to project members",
        project_id=project.id,
        status=TaskStatus.TODO,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    project_id = str(project.id)
    task_id = str(task.id)
    db.close()

    return {
        "admin_token": get_token_for_user("admin@example.com", "adminpass"),
        "member_token": get_token_for_user("member@example.com", "memberpass"),
        "outsider_token": get_token_for_user("outsider@example.com", "outsiderpass"),
        "project_id": project_id,
        "task_id": task_id,
    }


def test_project_member_can_list_project_tasks():
    """Project members can see tasks for their project."""
    setup_data = setup_member_project_task()

    response = client.get(
        f"/api/v1/tasks?project_id={setup_data['project_id']}",
        headers={"Authorization": f"Bearer {setup_data['member_token']}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Member Task"


def test_non_member_cannot_list_project_tasks():
    """Non-members cannot view another project's tasks."""
    setup_data = setup_member_project_task()

    response = client.get(
        f"/api/v1/tasks?project_id={setup_data['project_id']}",
        headers={"Authorization": f"Bearer {setup_data['outsider_token']}"},
    )

    assert response.status_code == 403


def test_project_member_can_update_task_status():
    """Project members can update task status."""
    setup_data = setup_member_project_task()

    response = client.put(
        f"/api/v1/tasks/{setup_data['task_id']}/status",
        json={"status": "done"},
        headers={"Authorization": f"Bearer {setup_data['member_token']}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "done"
