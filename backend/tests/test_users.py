"""Tests for users endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import get_db
from app.db.base import Base
from app.core.security import hash_password
from app.models.user import User, UserRole

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


def get_token():
    """Helper to get auth token."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "name": "Test User",
        },
    )
    return response.json()["access_token"]


def get_admin_token():
    """Helper to get admin auth token."""
    db = TestingSessionLocal()
    admin = User(
        email="admin@example.com",
        name="Admin User",
        hashed_password=hash_password("adminpass"),
        role=UserRole.ADMIN,
    )
    db.add(admin)
    db.commit()
    db.close()

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin@example.com",
            "password": "adminpass",
        },
    )
    return response.json()["access_token"]


def register_user(email, password, name):
    """Register a user and return its auth token."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "name": name,
        },
    )
    return response.json()["access_token"]


def test_list_users():
    """Test listing users."""
    token = get_admin_token()
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert len(data["items"]) == 1


def test_admin_can_create_user_with_role():
    """Admin can create a user and persist the requested role."""
    token = get_admin_token()

    response = client.post(
        "/api/v1/users",
        json={
            "email": "developer@example.com",
            "password": "testpass123",
            "name": "Developer User",
            "role": "admin",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "developer@example.com"
    assert data["role"] == "admin"


def test_user_can_get_own_profile():
    """Authenticated users can fetch their own profile."""
    token = register_user("self@example.com", "testpass123", "Self User")

    db = TestingSessionLocal()
    try:
        user = db.query(User).filter(User.email == "self@example.com").first()
    finally:
        db.close()

    response = client.get(
        f"/api/v1/users/{user.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "self@example.com"
    assert data["name"] == "Self User"


def test_user_cannot_get_another_profile():
    """Non-admin users cannot fetch another user's profile."""
    first_token = register_user("first@example.com", "testpass123", "First User")
    register_user("second@example.com", "testpass123", "Second User")

    db = TestingSessionLocal()
    try:
        second_user = db.query(User).filter(User.email == "second@example.com").first()
    finally:
        db.close()

    response = client.get(
        f"/api/v1/users/{second_user.id}",
        headers={"Authorization": f"Bearer {first_token}"},
    )

    assert response.status_code == 403
