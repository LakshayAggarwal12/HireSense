"""
Pydantic schemas — the API's public contract, kept separate from the ORM
models so internal DB structure can change without breaking clients.
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class UserRegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


class UserLoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str | None
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------------------------------------------------------------------------
# Candidates & ATS
# ---------------------------------------------------------------------------

class CandidateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    full_name: str | None
    email: str | None
    phone: str | None
    extracted_skills: list[str]
    education: list[str]
    experience_years: float | None
    created_at: datetime


class ATSCheckItem(BaseModel):
    name: str
    category: str
    passed: bool
    score: float           # 0.0-1.0 satisfaction of this check
    weight: int            # max points available
    earned_points: float   # points actually earned
    message: str


class ATSReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int
    overall_score: float
    category_scores: dict[str, float]
    checks: list[ATSCheckItem]
    suggestions: list[str]
    created_at: datetime


class CandidateListItemOut(CandidateOut):
    """CandidateOut plus the candidate's most recent ATS report, nested."""
    ats_report: ATSReportOut | None = None


# ---------------------------------------------------------------------------
# Job descriptions & ranking
# ---------------------------------------------------------------------------

class MatchScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int
    job_description_id: int
    semantic_similarity: float
    skill_overlap_pct: float
    composite_score: float
    matched_skills: list[str]
    missing_skills: list[str]
    suggestions: list[str] = []
    created_at: datetime


class JobDescriptionIn(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    raw_text: str = Field(min_length=1)


class JobDescriptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    raw_text: str
    required_skills: list[str]
    created_at: datetime


class RankingResultOut(BaseModel):
    candidate_id: int
    filename: str
    full_name: str | None
    semantic_similarity: float
    skill_overlap_pct: float
    composite_score: float
    matched_skills: list[str]
    missing_skills: list[str]
    suggestions: list[str]


class RankingResponseOut(BaseModel):
    job_description_id: int
    job_title: str
    total_candidates: int
    rankings: list[RankingResultOut]


# ---------------------------------------------------------------------------
# Skills taxonomy
# ---------------------------------------------------------------------------

class SkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    canonical_name: str
    aliases: list[str]
    category: str | None = None

    @classmethod
    def from_orm_with_category(cls, skill):
        return cls(
            id=skill.id,
            canonical_name=skill.canonical_name,
            aliases=skill.aliases or [],
            category=skill.category.name if skill.category else None,
        )


class SkillFieldWeightIn(BaseModel):
    field: str
    weight: float = 1.0


class SkillCreateIn(BaseModel):
    canonical_name: str
    category: str
    aliases: list[str] = []
    fields: list[SkillFieldWeightIn] = []


class JobFieldOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None


class FieldDetectionResultOut(BaseModel):
    field: str
    score: float
    confidence: float
    contributing_skills: list[str]
