"""Tests for projects endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import UserRole

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


def get_admin_token():
    """Helper to get admin auth token."""
    create_user("admin@example.com", "adminpass", "Admin User", UserRole.ADMIN)
    return get_token_for_user("admin@example.com", "adminpass")


def test_create_project():
    """Test creating a project."""
    token = get_admin_token()
    
    response = client.post(
        "/api/v1/projects",
        json={
            "name": "Test Project",
            "description": "A test project",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert "id" in data


def test_list_projects():
    """Test listing projects."""
    token = get_admin_token()
    
    # Create a project
    client.post(
        "/api/v1/projects",
        json={
            "name": "Test Project",
            "description": "A test project",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    
    # List projects
    response = client.get(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


def test_create_project_with_members():
    """Admin can create a project and add members."""
    token = get_admin_token()
    member = create_user("member@example.com", "memberpass", "Member User")

    response = client.post(
        "/api/v1/projects",
        json={
            "name": "Shared Project",
            "description": "Visible to selected members",
            "member_ids": [str(member.id)],
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Shared Project"
    assert data["member_ids"] == [str(member.id)]


def test_member_only_sees_assigned_projects():
    """Developers only see projects where they are members."""
    admin_token = get_admin_token()
    member = create_user("member@example.com", "memberpass", "Member User")
    outsider = create_user("outsider@example.com", "outsiderpass", "Outsider User")

    create_response = client.post(
        "/api/v1/projects",
        json={
            "name": "Member Project",
            "description": "Only selected members should see this",
            "member_ids": [str(member.id)],
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert create_response.status_code == 201
    project_id = create_response.json()["id"]

    member_token = get_token_for_user("member@example.com", "memberpass")
    member_response = client.get(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert member_response.status_code == 200
    member_data = member_response.json()
    assert member_data["total"] == 1
    assert member_data["items"][0]["id"] == project_id

    outsider_token = get_token_for_user("outsider@example.com", "outsiderpass")
    outsider_response = client.get(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {outsider_token}"},
    )
    assert outsider_response.status_code == 200
    outsider_data = outsider_response.json()
    assert outsider_data["total"] == 0
