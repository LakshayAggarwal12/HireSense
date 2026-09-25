"""
FastAPI dependencies for authentication.

`get_current_user` is the single gate every protected route goes through.
Routes declare it once as a parameter and receive a guaranteed-valid User,
so no route ever has to parse a token or check activity status itself.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.security import decode_access_token
from app.database import get_db
from app.models.models import User

# tokenUrl points at the form-accepting login variant, because Swagger UI's
# "Authorize" button posts OAuth2 form data - not JSON. The JSON endpoint at
# /api/auth/login is what the React frontend uses.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login/form")

CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    user_id = decode_access_token(token)
    if user_id is None:
        raise CREDENTIALS_ERROR

    user = db.get(User, user_id)
    if user is None:
        # Token was validly signed but the user has since been deleted.
        raise CREDENTIALS_ERROR
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    return user
