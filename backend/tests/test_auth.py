"""Tests for authentication."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.db.session import get_db

# Use in-memory SQLite for testing
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


def test_register():
    """Test user registration."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "name": "Test User",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email():
    """Test registration with duplicate email."""
    # Register first user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "name": "Test User",
        },
    )
    
    # Try to register with same email
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass456",
            "name": "Another User",
        },
    )
    assert response.status_code == 400


def test_login():
    """Test user login."""
    # Register user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "name": "Test User",
        },
    )
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_login_invalid_password():
    """Test login with invalid password."""
    # Register user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "name": "Test User",
        },
    )
    
    # Try to login with wrong password
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpass",
        },
    )
    assert response.status_code == 401


def test_login_nonexistent_user():
    """Test login for non-existent user."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "testpass123",
        },
    )
    assert response.status_code == 401
