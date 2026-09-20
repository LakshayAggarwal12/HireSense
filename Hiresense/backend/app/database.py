"""
Database engine and session management.

Supports SQLite locally and PostgreSQL/Neon in production.
"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings


settings = get_settings()

db_url = settings.normalized_database_url


# SQLite requires this argument when used with FastAPI.
if db_url.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }
else:
    # Neon/PostgreSQL already gets SSL configuration from the
    # DATABASE_URL, e.g. ?sslmode=require
    connect_args = {}


engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    pass


def upgrade_ownership_columns():
    """Add ownership columns to databases created before authentication."""
    inspector = inspect(engine)
    dialect = engine.dialect.name

    for table_name in ("candidates", "job_descriptions"):
        columns = {column["name"] for column in inspector.get_columns(table_name)}
        if "user_id" not in columns:
            foreign_key = ' REFERENCES users(id)' if dialect == "postgresql" else ""
            with engine.begin() as connection:
                connection.execute(
                    text(
                        f"ALTER TABLE {table_name} "
                        f"ADD COLUMN user_id INTEGER{foreign_key}"
                    )
                )

        indexes = {index["name"] for index in inspector.get_indexes(table_name)}
        index_name = f"ix_{table_name}_user_id"
        if index_name not in indexes:
            with engine.begin() as connection:
                connection.execute(
                    text(
                        f"CREATE INDEX {index_name} "
                        f"ON {table_name} (user_id)"
                    )
                )


def get_db():
    """
    FastAPI dependency.

    Creates a database session, yields it to the route,
    and guarantees that it is closed afterward.
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()