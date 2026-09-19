"""
Skills taxonomy routes.

Reads are public (the taxonomy is shared reference data, not user content),
but writes require authentication so a random caller can't pollute the
dataset that every user's extraction depends on.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.models import (
    Candidate, JobDescription, JobField, Skill, SkillCategory, SkillFieldRelevance, User,
)
from app.nlp.field_detector import detect_fields
from app.nlp.skill_extractor import refresh_taxonomy_cache
from app.schemas.schemas import (
    FieldDetectionResultOut, JobFieldOut, SkillCreateIn, SkillOut,
)

router = APIRouter(prefix="/api", tags=["skills"])


@router.get("/skills", response_model=list[SkillOut])
def list_skills(
    category: str | None = Query(None),
    field: str | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Skill)
    if category:
        q = q.join(SkillCategory).filter(SkillCategory.name == category)
    if field:
        q = q.join(SkillFieldRelevance).join(JobField).filter(JobField.name == field)
    return [SkillOut.from_orm_with_category(s) for s in q.order_by(Skill.canonical_name).all()]


@router.post("/skills", response_model=SkillOut, status_code=201)
def create_skill(
    payload: SkillCreateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if db.query(Skill).filter_by(canonical_name=payload.canonical_name).first():
        raise HTTPException(status_code=409, detail=f"Skill '{payload.canonical_name}' already exists.")

    category = db.query(SkillCategory).filter_by(name=payload.category).first()
    if not category:
        category = SkillCategory(name=payload.category)
        db.add(category)
        db.flush()

    skill = Skill(canonical_name=payload.canonical_name, aliases=payload.aliases,
                  category_id=category.id)
    db.add(skill)
    db.flush()

    for fw in payload.fields:
        jf = db.query(JobField).filter_by(name=fw.field).first()
        if not jf:
            raise HTTPException(status_code=400, detail=f"Unknown field '{fw.field}'.")
        db.add(SkillFieldRelevance(skill_id=skill.id, field_id=jf.id, weight=fw.weight))

    db.commit()
    db.refresh(skill)
    refresh_taxonomy_cache()
    return SkillOut.from_orm_with_category(skill)


@router.post("/skills/refresh")
def refresh_skills_cache(current_user: User = Depends(get_current_user)):
    refresh_taxonomy_cache()
    return {"status": "refreshed"}


@router.get("/fields", response_model=list[JobFieldOut])
def list_fields(db: Session = Depends(get_db)):
    return db.query(JobField).order_by(JobField.name).all()


@router.get("/fields/{field_id}/skills", response_model=list[SkillOut])
def get_field_skills(field_id: int, db: Session = Depends(get_db)):
    if not db.get(JobField, field_id):
        raise HTTPException(status_code=404, detail="Field not found")
    skills = (db.query(Skill).join(SkillFieldRelevance)
              .filter(SkillFieldRelevance.field_id == field_id)
              .order_by(SkillFieldRelevance.weight.desc()).all())
    return [SkillOut.from_orm_with_category(s) for s in skills]


@router.get("/candidates/{candidate_id}/detected-field",
            response_model=list[FieldDetectionResultOut])
def detect_candidate_field(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    candidate = (db.query(Candidate)
                 .filter(Candidate.id == candidate_id, Candidate.user_id == current_user.id)
                 .first())
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return detect_fields(candidate.extracted_skills)


@router.get("/job-descriptions/{jd_id}/detected-field",
            response_model=list[FieldDetectionResultOut])
def detect_jd_field(
    jd_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    jd = (db.query(JobDescription)
          .filter(JobDescription.id == jd_id, JobDescription.user_id == current_user.id)
          .first())
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    return detect_fields(jd.required_skills)
