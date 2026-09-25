"""
Password hashing and JWT token handling.

Uses the `bcrypt` library directly rather than passlib. passlib 1.7.4 is
incompatible with bcrypt >= 4.1 (it crashes on a version-detection call),
and passlib is effectively unmaintained - calling bcrypt directly is both
fewer moving parts and one less thing that can break on a dependency bump.
"""
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.config import get_settings

settings = get_settings()

# bcrypt refuses passwords longer than 72 bytes outright (it does not
# silently truncate), so we truncate explicitly and consistently in both
# hashing and verification - otherwise a >72-byte password would hash fine
# but raise on every subsequent login attempt.
_BCRYPT_MAX_BYTES = 72


def _prepare(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_prepare(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_prepare(plain_password), hashed_password.encode("utf-8"))
    except (ValueError, TypeError):
        # Malformed/legacy hash in the database - treat as a failed login
        # rather than surfacing a 500 to the client.
        return False


def create_access_token(subject: str | int, expires_minutes: int | None = None) -> str:
    """
    `subject` is the user's id, stored in the standard JWT `sub` claim.
    Encoded as a string because the JWT spec requires `sub` to be a string.
    """
    expire_minutes = expires_minutes or settings.access_token_expire_minutes
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    payload = {"sub": str(subject), "exp": expire, "iat": datetime.now(timezone.utc)}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int | None:
    """
    Returns the user id from a valid token, or None if the token is invalid,
    expired, or malformed. Never raises - callers treat None as "unauthenticated".
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        subject = payload.get("sub")
        if subject is None:
            return None
        return int(subject)
    except (JWTError, ValueError, TypeError):
        return None
