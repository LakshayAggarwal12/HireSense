"""
Authentication routes: register, login, and current-user lookup.

Two login endpoints exist deliberately:
  - POST /api/auth/login        JSON body - what the React frontend calls
  - POST /api/auth/login/form   OAuth2 form body - what Swagger UI's
                                "Authorize" button needs to work at /docs
Both issue an identical token; the second exists purely so the interactive
docs remain usable for manual testing.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import TokenOut, UserLoginIn, UserOut, UserRegisterIn

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _issue_token(user: User) -> TokenOut:
    return TokenOut(
        access_token=create_access_token(user.id),
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterIn, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=email,
        full_name=(payload.full_name or "").strip() or None,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log the user straight in after registering - avoids an immediate
    # second round-trip to /login from the frontend.
    return _issue_token(user)


@router.post("/login", response_model=TokenOut)
def login(payload: UserLoginIn, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()

    # Deliberately identical error for "no such user" and "wrong password" -
    # distinguishing them would let an attacker enumerate registered emails.
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    return _issue_token(user)


@router.post("/login/form", response_model=TokenOut, include_in_schema=False)
def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 password-flow variant so Swagger UI's Authorize button works."""
    return login(UserLoginIn(email=form.username, password=form.password), db)


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
