import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl


class Settings(BaseSettings):
    PROJECT_NAME: str = "VisionAI-Care"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg2://postgres:RaahilHayan@db:5432/visionai"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    BACKEND_CORS_ORIGINS: str = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3001")

    @property
    def cors_origins(self) -> list[str]:
        return [i.strip() for i in self.BACKEND_CORS_ORIGINS.split(",")]

    GEMINI_API_KEY: str | None = None
    STRIPE_SECRET_KEY: str | None = None
    STRIPE_PUBLISHABLE_KEY: str | None = None

    class Config:
        env_file = ".env"


settings = Settings()
