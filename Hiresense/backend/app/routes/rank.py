"""
Job descriptions and candidate ranking - all routes authenticated and
scoped to the current user's own candidates and job descriptions.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.models import Candidate, JobDescription, MatchScore, User
from app.nlp.matcher import rank_candidates
from app.nlp.skill_extractor import extract_skills
from app.nlp.suggestions import generate_match_suggestions
from app.schemas.schemas import (
    JobDescriptionIn,
    JobDescriptionOut,
    MatchScoreOut,
    RankingResponseOut,
    RankingResultOut,
)

router = APIRouter(prefix="/api", tags=["ranking"])


def _owned_jd(jd_id: int, user: User, db: Session) -> JobDescription:
    jd = (
        db.query(JobDescription)
        .filter(JobDescription.id == jd_id, JobDescription.user_id == user.id)
        .first()
    )
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    return jd


@router.post("/job-descriptions", response_model=JobDescriptionOut)
def create_job_description(
    payload: JobDescriptionIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.raw_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")

    jd = JobDescription(
        user_id=current_user.id,
        title=payload.title,
        raw_text=payload.raw_text,
        required_skills=extract_skills(payload.raw_text),
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)
    return jd


@router.get("/job-descriptions", response_model=list[JobDescriptionOut])
def list_job_descriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(JobDescription)
        .filter(JobDescription.user_id == current_user.id)
        .order_by(JobDescription.created_at.desc())
        .all()
    )


@router.get("/job-descriptions/{jd_id}", response_model=JobDescriptionOut)
def get_job_description(
    jd_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _owned_jd(jd_id, current_user, db)


@router.delete("/job-descriptions/{jd_id}", status_code=204)
def delete_job_description(
    jd_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    jd = _owned_jd(jd_id, current_user, db)
    db.delete(jd)
    db.commit()


@router.post("/job-descriptions/{jd_id}/rank", response_model=RankingResponseOut)
def rank_all_candidates(
    jd_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ranks only THIS user's candidates against THIS user's job description."""
    jd = _owned_jd(jd_id, current_user, db)

    candidates = db.query(Candidate).filter(Candidate.user_id == current_user.id).all()
    if not candidates:
        raise HTTPException(
            status_code=400,
            detail="No candidates found. Upload at least one resume before ranking.",
        )

    ranked = rank_candidates(
        [{"candidate_id": c.id, "resume_text": c.raw_text, "skills": c.extracted_skills}
         for c in candidates],
        jd.raw_text,
    )

    by_id = {c.id: c for c in candidates}
    results: list[RankingResultOut] = []

    for entry in ranked:
        candidate = by_id[entry["candidate_id"]]
        suggestions = generate_match_suggestions(
            entry["semantic_similarity"], entry["skill_overlap_pct"], entry["missing_skills"]
        )

        existing = (
            db.query(MatchScore)
            .filter_by(candidate_id=candidate.id, job_description_id=jd.id)
            .first()
        )
        if existing:
            db.delete(existing)
            db.flush()

        db.add(MatchScore(
            candidate_id=candidate.id,
            job_description_id=jd.id,
            semantic_similarity=entry["semantic_similarity"],
            skill_overlap_pct=entry["skill_overlap_pct"],
            composite_score=entry["composite_score"],
            matched_skills=entry["matched_skills"],
            missing_skills=entry["missing_skills"],
        ))

        results.append(RankingResultOut(
            candidate_id=candidate.id,
            filename=candidate.filename,
            full_name=candidate.full_name,
            semantic_similarity=entry["semantic_similarity"],
            skill_overlap_pct=entry["skill_overlap_pct"],
            composite_score=entry["composite_score"],
            matched_skills=entry["matched_skills"],
            missing_skills=entry["missing_skills"],
            suggestions=suggestions,
        ))

    db.commit()

    return RankingResponseOut(
        job_description_id=jd.id,
        job_title=jd.title,
        total_candidates=len(results),
        rankings=results,
    )


@router.get("/candidates/{candidate_id}/match/{jd_id}", response_model=MatchScoreOut)
def get_match_score(
    candidate_id: int,
    jd_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify ownership of both sides before exposing the score.
    owns_candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id, Candidate.user_id == current_user.id)
        .first()
    )
    if not owns_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    _owned_jd(jd_id, current_user, db)

    match = (
        db.query(MatchScore)
        .filter_by(candidate_id=candidate_id, job_description_id=jd_id)
        .first()
    )
    if not match:
        raise HTTPException(
            status_code=404,
            detail="No match score found for this candidate/JD pair. Run ranking first.",
        )

    out = MatchScoreOut.model_validate(match)
    out.suggestions = generate_match_suggestions(
        match.semantic_similarity, match.skill_overlap_pct, match.missing_skills
    )
    return out
