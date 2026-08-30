from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import Base, engine
from app.api.routes import auth, vision_tests, consultations, users
import app.models  # noqa: F401  (ensures models are registered on Base before create_all)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(vision_tests.router)
app.include_router(consultations.router)


@app.on_event("startup")
def on_startup():
    # Dev convenience: for a first-class production setup use alembic migrations
    # (see backend/alembic). This keeps a fresh `docker compose up` working
    # out of the box even before migrations are run.
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": settings.PROJECT_NAME}
