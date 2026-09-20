"""
Candidate upload and retrieval.

Every route here requires authentication and is scoped to the current user:
a candidate uploaded by user A is invisible to user B, and requesting it by
id returns 404 (not 403) so ids belonging to other users aren't discoverable.
"""
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.config import get_settings
from app.database import get_db
from app.models.models import ATSReport, Candidate, User
from app.nlp.ats_checker import run_ats_checks
from app.nlp.skill_extractor import (
    extract_contact_info,
    extract_education,
    extract_experience_years,
    extract_name,
    extract_skills,
)
from app.parsers.docx_parser import parse_docx
from app.parsers.pdf_parser import parse_pdf
from app.schemas.schemas import ATSReportOut, CandidateListItemOut, CandidateOut

router = APIRouter(prefix="/api", tags=["resumes"])
settings = get_settings()


def _owned_candidate(candidate_id: int, user: User, db: Session) -> Candidate:
    """
    Fetches a candidate that belongs to this user, or raises 404.
    Returning 404 rather than 403 for someone else's id prevents an attacker
    from probing which candidate ids exist across the whole system.
    """
    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id, Candidate.user_id == user.id)
        .first()
    )
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.get("/candidates", response_model=list[CandidateListItemOut])
def list_candidates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    candidates = (
        db.query(Candidate)
        .filter(Candidate.user_id == current_user.id)
        .order_by(Candidate.created_at.desc())
        .all()
    )
    results = []
    for c in candidates:
        latest = sorted(c.ats_reports, key=lambda r: r.created_at)[-1] if c.ats_reports else None
        item = CandidateListItemOut.model_validate(c)
        if latest:
            item.ats_report = ATSReportOut.model_validate(latest)
        results.append(item)
    return results


@router.post("/upload-resume", response_model=dict)
async def upload_resume(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ext = Path(file.filename).suffix.lower()
    if ext not in settings.extensions_list:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {settings.extensions_list}",
        )

    contents = await file.read()
    if len(contents) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=400, detail=f"File exceeds {settings.max_upload_size_mb}MB limit."
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        parsed = parse_pdf(tmp_path) if ext == ".pdf" else parse_docx(tmp_path)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    if not parsed.raw_text:
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted from this file. It may be a scanned image — "
                   "try uploading a text-based PDF or DOCX.",
        )

    contact = extract_contact_info(parsed.raw_text)
    skills = extract_skills(parsed.raw_text)

    candidate = Candidate(
        user_id=current_user.id,
        filename=file.filename,
        full_name=extract_name(parsed.raw_text, file.filename),
        email=contact["email"],
        phone=contact["phone"],
        raw_text=parsed.raw_text,
        extracted_skills=skills,
        education=extract_education(parsed.raw_text),
        experience_years=extract_experience_years(parsed.raw_text),
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # Extracted skills are passed into the ATS checker so it can score skill
    # coverage without needing its own database access.
    overall_score, category_scores, checks, suggestions = run_ats_checks(parsed, skills)
    ats_report = ATSReport(
        candidate_id=candidate.id,
        overall_score=overall_score,
        category_scores=category_scores,
        checks=[
            {
                "name": c.name,
                "category": c.category,
                "passed": c.passed,
                "score": c.score,
                "weight": c.weight,
                "earned_points": c.earned_points,
                "message": c.message,
            }
            for c in checks
        ],
        suggestions=suggestions,
    )
    db.add(ats_report)
    db.commit()
    db.refresh(ats_report)

    return {
        "candidate": CandidateOut.model_validate(candidate).model_dump(),
        "ats_report": ATSReportOut.model_validate(ats_report).model_dump(),
    }


@router.get("/candidates/{candidate_id}", response_model=CandidateOut)
def get_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _owned_candidate(candidate_id, current_user, db)


@router.get("/candidates/{candidate_id}/ats-report", response_model=ATSReportOut)
def get_latest_ats_report(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    candidate = _owned_candidate(candidate_id, current_user, db)
    if not candidate.ats_reports:
        raise HTTPException(status_code=404, detail="No ATS report found for this candidate")
    return sorted(candidate.ats_reports, key=lambda r: r.created_at)[-1]


@router.delete("/candidates/{candidate_id}", status_code=204)
def delete_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    candidate = _owned_candidate(candidate_id, current_user, db)
    db.delete(candidate)  # cascades to ats_reports and match_scores
    db.commit()
