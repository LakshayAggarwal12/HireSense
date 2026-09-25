"""
ATS Parseability & Content Quality Checker (v2).

WHAT CHANGED FROM v1
--------------------
v1 had 7 binary pass/fail checks in one flat list, all about machine
readability. v2 keeps that philosophy (rule-based and fully explainable, not
a black-box model) but improves it in three concrete ways:

1. TWO CATEGORIES. "Parseability" (can an ATS read this file at all - 60
   points) is now separated from "Content Quality" (is the writing actually
   strong - 40 points). These are genuinely different problems: a perfectly
   machine-readable resume can still be weakly written, and previously a
   single number hid that distinction.

2. GRADED SCORING. Checks now return a 0.0-1.0 score instead of pass/fail,
   so "3 of 5 sections present" earns partial credit rather than zero. Each
   check still exposes `passed` (score >= its threshold) for UI badges.

3. SIX NEW CONTENT CHECKS: quantified achievements, action verbs,
   professional links, skill coverage, bullet usage, and date consistency.

Everything stays rule-based - every point lost still traces to a named check
with an explicit weight and a human-readable fix.
"""
import re
from dataclasses import dataclass, field

from app.parsers.pdf_parser import ParsedDocument

CATEGORY_PARSEABILITY = "Parseability"
CATEGORY_CONTENT = "Content Quality"

SECTION_HEADERS = [
    "experience", "work experience", "employment", "education", "skills",
    "projects", "summary", "objective", "certifications", "achievements",
    "publications", "awards",
]

# Common strong resume action verbs. Not exhaustive by design - this measures
# whether bullets *tend* to open with an accomplishment verb, not whether
# every single one appears in a dictionary.
ACTION_VERBS = {
    "achieved", "administered", "analyzed", "architected", "automated", "built",
    "collaborated", "conducted", "configured", "created", "decreased", "delivered",
    "deployed", "designed", "developed", "directed", "drove", "engineered",
    "enhanced", "established", "executed", "expanded", "generated", "implemented",
    "improved", "increased", "initiated", "integrated", "introduced", "launched",
    "led", "maintained", "managed", "migrated", "optimized", "orchestrated",
    "overhauled", "pioneered", "planned", "produced", "programmed", "reduced",
    "refactored", "resolved", "restructured", "scaled", "shipped", "simplified",
    "spearheaded", "streamlined", "supervised", "supported", "tested", "trained",
    "transformed", "upgraded", "wrote",
}

BULLET_CHARS = ("-", "\u2022", "*", "\u25aa", "\u25cf", "\u2023", "\u00b7", "\u2043")

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RE = re.compile(r"(\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}")
LINKEDIN_RE = re.compile(r"linkedin\.com/in/[\w-]+", re.IGNORECASE)
GITHUB_RE = re.compile(r"github\.com/[\w-]+", re.IGNORECASE)
PORTFOLIO_RE = re.compile(r"https?://(?!.*(?:linkedin|github)\.com)[\w.-]+\.[a-z]{2,}", re.IGNORECASE)

# Quantified achievement signals: percentages, multipliers, plus-counts,
# currency, and large plain numbers ("handled 50,000 requests").
QUANTIFIER_RE = re.compile(
    r"(\d+(?:\.\d+)?\s*%"          # 40%, 12.5%
    r"|\d+(?:\.\d+)?\s*[xX]\b"      # 3x
    r"|\d+\s*\+"                    # 500+
    r"|[$\u20ac\u00a3\u20b9]\s*\d+" # $500, ₹1000
    r"|\b\d{2,}(?:,\d{3})*\b)"      # 50,000 / 250
)

# Date range patterns commonly used in resumes.
DATE_PATTERNS = {
    "month_year": re.compile(
        r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\b",
        re.IGNORECASE),
    "numeric_slash": re.compile(r"\b\d{1,2}/\d{4}\b"),
    "year_only": re.compile(r"\b(?:19|20)\d{2}\s*[-\u2013\u2014]\s*(?:(?:19|20)\d{2}|present|current)\b",
                              re.IGNORECASE),
}


@dataclass
class ATSCheckResult:
    name: str
    category: str
    score: float           # 0.0 - 1.0, how fully this check was satisfied
    weight: int            # max points this check can contribute
    message: str
    passed: bool = field(init=False)
    earned_points: float = field(init=False)

    # A check counts as "passed" at 80% satisfaction. Graded checks can
    # therefore earn most of their points while still flagging a suggestion.
    PASS_THRESHOLD = 0.8

    def __post_init__(self):
        self.score = max(0.0, min(1.0, self.score))
        self.passed = self.score >= self.PASS_THRESHOLD
        self.earned_points = round(self.weight * self.score, 2)


# ---------------------------------------------------------------------------
# Parseability checks (60 points total)
# ---------------------------------------------------------------------------

def _check_extractable_text(doc: ParsedDocument) -> ATSCheckResult:
    ok = doc.has_extractable_text
    return ATSCheckResult(
        name="Text Extractability",
        category=CATEGORY_PARSEABILITY,
        score=1.0 if ok else 0.0,
        weight=18,
        message=(
            "Resume text extracts cleanly."
            if ok else
            "Little to no text could be extracted - this resume may be a scanned image "
            "rather than real text. Most ATS will read this as blank. Export as a "
            "text-based PDF from your word processor instead of scanning or screenshotting."
        ),
    )


def _check_section_headers(text: str) -> ATSCheckResult:
    lower = text.lower()
    found = [h for h in SECTION_HEADERS if h in lower]
    # 4+ distinct standard headers earns full credit; graded below that.
    score = min(1.0, len(found) / 4)
    return ATSCheckResult(
        name="Standard Section Headers",
        category=CATEGORY_PARSEABILITY,
        score=score,
        weight=14,
        message=(
            f"Found {len(found)} standard section header(s): {', '.join(found[:5])}."
            if score >= 1.0 else
            f"Only {len(found)} standard section header(s) detected. ATS uses headers like "
            "Experience, Education, Skills, and Projects to bucket your content correctly - "
            "use these conventional names rather than creative alternatives."
        ),
    )


def _check_layout(doc: ParsedDocument) -> ATSCheckResult:
    ok = not doc.is_multi_column
    return ATSCheckResult(
        name="Single-Column Layout",
        category=CATEGORY_PARSEABILITY,
        score=1.0 if ok else 0.0,
        weight=14,
        message=(
            "No multi-column layout detected."
            if ok else
            "Multi-column or table-based layout detected. Many ATS parsers read "
            "left-to-right across the full page width, which can scramble multi-column "
            "content into the wrong order or skip it entirely. Use a single-column layout."
        ),
    )


def _check_contact_info(text: str) -> ATSCheckResult:
    has_email = bool(EMAIL_RE.search(text))
    has_phone = bool(PHONE_RE.search(text))
    score = (0.6 if has_email else 0.0) + (0.4 if has_phone else 0.0)

    missing = []
    if not has_email:
        missing.append("email address")
    if not has_phone:
        missing.append("phone number")

    return ATSCheckResult(
        name="Extractable Contact Info",
        category=CATEGORY_PARSEABILITY,
        score=score,
        weight=8,
        message=(
            "Email and phone number both extracted successfully."
            if score >= 1.0 else
            f"Could not reliably extract: {', '.join(missing)}. Put this as plain text near "
            "the top of the document - not inside an image, header/footer, or table."
        ),
    )


def _check_images(doc: ParsedDocument) -> ATSCheckResult:
    ok = not doc.has_embedded_images
    return ATSCheckResult(
        name="No Icon/Image-Based Info",
        category=CATEGORY_PARSEABILITY,
        score=1.0 if ok else 0.0,
        weight=3,
        message=(
            "No embedded images detected."
            if ok else
            "Embedded images/icons detected. If contact details or section labels are shown "
            "as icons rather than words, ATS cannot read them - use plain text labels."
        ),
    )


def _check_special_characters(doc: ParsedDocument) -> ATSCheckResult:
    ratio = doc.non_ascii_ratio
    # Under 2% is clean; grade down linearly to 0 at 6%.
    if ratio < 0.02:
        score = 1.0
    elif ratio >= 0.06:
        score = 0.0
    else:
        score = 1.0 - ((ratio - 0.02) / 0.04)

    return ATSCheckResult(
        name="Minimal Special Characters",
        category=CATEGORY_PARSEABILITY,
        score=score,
        weight=3,
        message=(
            "Low use of unusual symbols/unicode characters."
            if score >= 1.0 else
            f"High proportion of non-standard characters ({ratio:.1%}). Decorative bullets, "
            "symbols, and icon fonts can render as garbled text in ATS systems - stick to "
            "standard bullets and plain punctuation."
        ),
    )


# ---------------------------------------------------------------------------
# Content quality checks (40 points total)
# ---------------------------------------------------------------------------

def _get_bullet_lines(text: str) -> list[str]:
    lines = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if line.startswith(BULLET_CHARS):
            # Strip the bullet character and any following whitespace
            lines.append(line.lstrip("".join(BULLET_CHARS)).strip())
    return lines


def _check_length(doc: ParsedDocument) -> ATSCheckResult:
    word_count = len(doc.raw_text.split())
    # Healthy range for an early-career resume: roughly 250-900 words.
    if 250 <= word_count <= 900:
        score = 1.0
        msg = f"Resume length is {word_count} words - within the recommended range."
    elif word_count < 250:
        score = max(0.0, word_count / 250)
        msg = (f"Resume is short ({word_count} words). Thin resumes give both ATS keyword "
               "matching and human reviewers little to work with - expand your project and "
               "experience descriptions.")
    else:
        score = max(0.0, 1.0 - ((word_count - 900) / 900))
        msg = (f"Resume is long ({word_count} words). Many reviewers and some ATS truncate "
               "beyond 1-2 pages for early-career roles - tighten to the most relevant content.")

    return ATSCheckResult(
        name="Reasonable Length", category=CATEGORY_CONTENT, score=score, weight=5, message=msg,
    )


def _check_quantified_achievements(text: str) -> ATSCheckResult:
    matches = QUANTIFIER_RE.findall(text)
    count = len(matches)
    # 5+ quantified data points earns full credit.
    score = min(1.0, count / 5)
    return ATSCheckResult(
        name="Quantified Achievements",
        category=CATEGORY_CONTENT,
        score=score,
        weight=8,
        message=(
            f"Found {count} quantified data point(s) - measurable impact is clearly stated."
            if score >= 1.0 else
            f"Only {count} quantified data point(s) found. Numbers make achievements concrete "
            "and credible - prefer \u201creduced load time by 40%\u201d or \u201cserved 50,000 "
            "daily requests\u201d over \u201cimproved performance\u201d."
        ),
    )


def _check_action_verbs(text: str) -> ATSCheckResult:
    bullets = _get_bullet_lines(text)
    if not bullets:
        return ATSCheckResult(
            name="Strong Action Verbs",
            category=CATEGORY_CONTENT,
            score=0.0,
            weight=7,
            message=(
                "No bullet points detected, so bullet openings could not be assessed. Use "
                "bullet points starting with action verbs (Built, Led, Optimized) to describe "
                "your experience."
            ),
        )

    strong = 0
    for bullet in bullets:
        first_word = bullet.split()[0].lower().strip(".,:;") if bullet.split() else ""
        if first_word in ACTION_VERBS:
            strong += 1

    ratio = strong / len(bullets)
    # 60% of bullets opening with an action verb earns full credit - demanding
    # 100% would penalize legitimately varied phrasing.
    score = min(1.0, ratio / 0.6)

    return ATSCheckResult(
        name="Strong Action Verbs",
        category=CATEGORY_CONTENT,
        score=score,
        weight=7,
        message=(
            f"{strong} of {len(bullets)} bullet points start with a strong action verb."
            if score >= 1.0 else
            f"Only {strong} of {len(bullets)} bullet points start with a strong action verb. "
            "Opening with verbs like Built, Led, Designed, or Reduced reads as more active and "
            "achievement-focused than \u201cResponsible for\u201d or \u201cWorked on\u201d."
        ),
    )


def _check_professional_links(text: str) -> ATSCheckResult:
    has_linkedin = bool(LINKEDIN_RE.search(text))
    has_github = bool(GITHUB_RE.search(text))
    has_portfolio = bool(PORTFOLIO_RE.search(text))

    score = 0.0
    if has_linkedin:
        score += 0.5
    if has_github:
        score += 0.4
    if has_portfolio:
        score += 0.1
    score = min(1.0, score)

    missing = []
    if not has_linkedin:
        missing.append("LinkedIn")
    if not has_github:
        missing.append("GitHub")

    return ATSCheckResult(
        name="Professional Links",
        category=CATEGORY_CONTENT,
        score=score,
        weight=5,
        message=(
            "Professional profile links are present and extractable."
            if score >= 1.0 else
            f"Missing or unreadable: {', '.join(missing) if missing else 'portfolio link'}. "
            "Include full URLs as plain text (e.g. linkedin.com/in/yourname) - recruiters "
            "routinely check these, and hyperlinked-but-invisible text doesn't extract."
        ),
    )


def _check_skill_coverage(extracted_skills: list[str]) -> ATSCheckResult:
    count = len(extracted_skills)
    # 10+ recognized skills earns full credit.
    score = min(1.0, count / 10)
    return ATSCheckResult(
        name="Skill Coverage",
        category=CATEGORY_CONTENT,
        score=score,
        weight=6,
        message=(
            f"{count} recognized skills detected - good keyword coverage for ATS matching."
            if score >= 1.0 else
            f"Only {count} recognized skill(s) detected. ATS keyword matching depends on "
            "explicitly naming your tools and technologies - list them plainly in a Skills "
            "section rather than leaving them implied in prose."
        ),
    )


def _check_bullet_usage(text: str) -> ATSCheckResult:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    if not lines:
        return ATSCheckResult(
            name="Bullet Point Usage", category=CATEGORY_CONTENT, score=0.0, weight=5,
            message="No content lines found to assess formatting.",
        )

    bullet_count = len(_get_bullet_lines(text))
    # Long unbroken paragraphs are the failure mode we're detecting.
    long_lines = [ln for ln in lines if len(ln.split()) > 45]

    if bullet_count >= 5 and not long_lines:
        score = 1.0
    elif bullet_count >= 5:
        score = 0.7
    else:
        score = min(0.6, bullet_count / 5 * 0.6)

    return ATSCheckResult(
        name="Bullet Point Usage",
        category=CATEGORY_CONTENT,
        score=score,
        weight=5,
        message=(
            f"Content is well structured with {bullet_count} bullet points."
            if score >= 1.0 else
            f"Found {bullet_count} bullet point(s)"
            + (f" and {len(long_lines)} very long paragraph(s)." if long_lines else ".")
            + " Bullet points are easier for both ATS and human reviewers to parse than "
              "dense paragraphs - break experience descriptions into short bullets."
        ),
    )


def _check_date_consistency(text: str) -> ATSCheckResult:
    style_counts = {name: len(pattern.findall(text)) for name, pattern in DATE_PATTERNS.items()}
    styles_used = [name for name, count in style_counts.items() if count > 0]
    total_dates = sum(style_counts.values())

    if total_dates == 0:
        score = 0.0
        msg = ("No recognizable date ranges found. ATS builds your work timeline from dates - "
               "include them in a consistent format such as \u201cJan 2024 - Present\u201d.")
    elif len(styles_used) == 1:
        score = 1.0
        msg = f"Dates use a consistent format ({total_dates} date(s) found)."
    else:
        score = 0.5
        msg = (f"Mixed date formats detected ({', '.join(styles_used)}). Inconsistent date "
               "styles can break ATS timeline parsing - pick one format and use it throughout.")

    return ATSCheckResult(
        name="Consistent Date Formatting",
        category=CATEGORY_CONTENT, score=score, weight=4, message=msg,
    )


# ---------------------------------------------------------------------------
# Aggregation
# ---------------------------------------------------------------------------

def run_ats_checks(
    doc: ParsedDocument,
    extracted_skills: list[str] | None = None,
) -> tuple[float, dict, list[ATSCheckResult], list[str]]:
    """
    Runs all 13 checks and returns:
        (overall_score, category_scores, checks, suggestions)

    `extracted_skills` comes from the skill extractor and is passed in rather
    than looked up here - this keeps ats_checker free of any database
    dependency, so it stays a pure function of the parsed document.

    `suggestions` lists the messages of every non-passing check, ordered by
    how many points that check is currently costing - so the first suggestion
    is always the highest-impact fix available.
    """
    skills = extracted_skills or []
    text = doc.raw_text

    checks = [
        # Parseability (60)
        _check_extractable_text(doc),
        _check_section_headers(text),
        _check_layout(doc),
        _check_contact_info(text),
        _check_images(doc),
        _check_special_characters(doc),
        # Content quality (40)
        _check_length(doc),
        _check_quantified_achievements(text),
        _check_action_verbs(text),
        _check_professional_links(text),
        _check_skill_coverage(skills),
        _check_bullet_usage(text),
        _check_date_consistency(text),
    ]

    total_weight = sum(c.weight for c in checks)
    earned = sum(c.earned_points for c in checks)
    overall_score = round((earned / total_weight) * 100, 1) if total_weight else 0.0

    category_scores: dict[str, float] = {}
    for category in (CATEGORY_PARSEABILITY, CATEGORY_CONTENT):
        cat_checks = [c for c in checks if c.category == category]
        cat_weight = sum(c.weight for c in cat_checks)
        cat_earned = sum(c.earned_points for c in cat_checks)
        category_scores[category] = round((cat_earned / cat_weight) * 100, 1) if cat_weight else 0.0

    # Sort by points *lost*, so the biggest win is always suggestion #1.
    failing = [c for c in checks if not c.passed]
    failing.sort(key=lambda c: -(c.weight - c.earned_points))
    suggestions = [c.message for c in failing]

    return overall_score, category_scores, checks, suggestions
