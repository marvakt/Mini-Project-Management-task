"""Application configuration settings."""

from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "TechBrain Project Management"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://techbrain:techbrain@localhost:5432/techbrain_db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_flag(cls, value):
        """Allow common environment-style debug values."""
        if isinstance(value, bool):
            return value

        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug", "development"}:
                return True
            if normalized in {"0", "false", "no", "off", "release", "production"}:
                return False

        return value

    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = True


settings = Settings()
