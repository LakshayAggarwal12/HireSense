"""
FastAPI application entrypoint.

Run locally with:  uvicorn app.main:app --reload
Swagger docs at:    http://localhost:8000/docs
"""
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, SessionLocal, engine, upgrade_ownership_columns
from app.models.models import Skill
from app.routes import auth, rank, skills, upload

settings = get_settings()

# Fail fast rather than deploying with the insecure development JWT secret.
# A predictable signing key means anyone can forge a valid token for any
# user, so this is a hard startup error in production, not a warning.
if settings.is_production and settings.jwt_secret_key == "dev-only-insecure-change-me":
    raise RuntimeError(
        "JWT_SECRET_KEY is still set to the insecure development default. "
        "Set a strong random value (e.g. `python -c \"import secrets; "
        "print(secrets.token_urlsafe(48))\"`) before running in production."
    )

Base.metadata.create_all(bind=engine)
upgrade_ownership_columns()


def _auto_seed_skills_if_empty():
    """
    Seeds the skills taxonomy automatically if the table is empty, because
    free hosting tiers often have no Shell access to run the seed script
    manually. Cheap (one COUNT query) and self-healing on every deploy.
    """
    db = SessionLocal()
    try:
        if db.query(Skill).count() > 0:
            return
        print("Skills table is empty — auto-seeding taxonomy dataset...", file=sys.stderr)
        from scripts.seed_skills import seed
        seed()
    except Exception as exc:
        # Never let a seeding failure crash-loop the whole app.
        print(f"WARNING: auto-seed failed: {exc}", file=sys.stderr)
    finally:
        db.close()


_auto_seed_skills_if_empty()

app = FastAPI(
    title="HireSense — Resume Screening & Candidate Ranking API",
    description="Parses resumes, scores ATS parseability and content quality, "
                "and ranks candidates against job descriptions.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(rank.router)
app.include_router(skills.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "env": settings.app_env}
