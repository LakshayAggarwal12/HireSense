"""
ORM models.

Ownership model: Candidate and JobDescription each carry a user_id, so every
query can be scoped to the authenticated user. Downstream rows (ATSReport,
MatchScore) inherit ownership through their parent — they are never queried
without going through a candidate/JD the user already owns, so they don't
need their own user_id column.
"""
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # bcrypt hash — the plaintext password is never stored or logged anywhere.
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    candidates: Mapped[list["Candidate"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    job_descriptions: Mapped[list["JobDescription"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    # Nullable so rows created before auth existed aren't orphaned by the
    # schema change; new rows always get an owner (enforced in the routes).
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    extracted_skills: Mapped[list] = mapped_column(JSON, default=list)
    education: Mapped[list] = mapped_column(JSON, default=list)
    experience_years: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    owner: Mapped["User | None"] = relationship(back_populates="candidates")
    match_scores: Mapped[list["MatchScore"]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan"
    )
    ats_reports: Mapped[list["ATSReport"]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan"
    )


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    required_skills: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    owner: Mapped["User | None"] = relationship(back_populates="job_descriptions")
    match_scores: Mapped[list["MatchScore"]] = relationship(
        back_populates="job_description", cascade="all, delete-orphan"
    )


class MatchScore(Base):
    __tablename__ = "match_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"))
    job_description_id: Mapped[int] = mapped_column(ForeignKey("job_descriptions.id"))

    semantic_similarity: Mapped[float] = mapped_column(Float)  # 0-100
    skill_overlap_pct: Mapped[float] = mapped_column(Float)  # 0-100
    composite_score: Mapped[float] = mapped_column(Float)  # weighted final, 0-100

    matched_skills: Mapped[list] = mapped_column(JSON, default=list)
    missing_skills: Mapped[list] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    candidate: Mapped["Candidate"] = relationship(back_populates="match_scores")
    job_description: Mapped["JobDescription"] = relationship(back_populates="match_scores")


class ATSReport(Base):
    __tablename__ = "ats_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"))

    overall_score: Mapped[float] = mapped_column(Float)  # 0-100
    # Per-category subscores, e.g. {"Parseability": 92.1, "Content Quality": 61.0}
    category_scores: Mapped[dict] = mapped_column(JSON, default=dict)
    checks: Mapped[list] = mapped_column(JSON, default=list)
    suggestions: Mapped[list] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    candidate: Mapped["Candidate"] = relationship(back_populates="ats_reports")


# ---------------------------------------------------------------------------
# Skills taxonomy dataset (shared across all users — reference data, not
# user-owned content, so these tables intentionally have no user_id).
# ---------------------------------------------------------------------------

class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    skills: Mapped[list["Skill"]] = relationship(back_populates="category")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    canonical_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    aliases: Mapped[list] = mapped_column(JSON, default=list)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("skill_categories.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    category: Mapped["SkillCategory | None"] = relationship(back_populates="skills")
    field_relevance: Mapped[list["SkillFieldRelevance"]] = relationship(
        back_populates="skill", cascade="all, delete-orphan"
    )


class JobField(Base):
    __tablename__ = "job_fields"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    skill_relevance: Mapped[list["SkillFieldRelevance"]] = relationship(
        back_populates="field", cascade="all, delete-orphan"
    )


class SkillFieldRelevance(Base):
    __tablename__ = "skill_field_relevance"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"))
    field_id: Mapped[int] = mapped_column(ForeignKey("job_fields.id"))
    weight: Mapped[float] = mapped_column(Float, default=1.0)

    skill: Mapped["Skill"] = relationship(back_populates="field_relevance")
    field: Mapped["JobField"] = relationship(back_populates="skill_relevance")
