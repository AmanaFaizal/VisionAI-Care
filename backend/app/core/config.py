import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "VisionAI-Care"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg2://visionai:visionai@localhost:5432/visionai"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    BACKEND_CORS_ORIGINS: list[str] = os.getenv(
        "BACKEND_CORS_ORIGINS", "http://localhost:3000"
    ).split(",")

    class Config:
        env_file = ".env"


settings = Settings()
