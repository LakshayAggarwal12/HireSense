"""
Centralized application configuration.

Everything environment-specific (DB url, CORS origins, upload limits, JWT
secret) lives here and nowhere else.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    allowed_origins: str
    max_upload_size_mb: int
    allowed_extensions: str
    app_env: str

    # ---- Auth settings ----
    jwt_secret_key: str
    jwt_algorithm: str
    access_token_expire_minutes: int

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def extensions_list(self) -> list[str]:
        return [e.strip().lower() for e in self.allowed_extensions.split(",") if e.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def normalized_database_url(self) -> str:
        """
        Managed Postgres providers (Render, Neon, Heroku, Supabase) commonly
        hand out connection strings starting with 'postgres://', but
        SQLAlchemy 1.4+/2.x requires 'postgresql://'. Normalize here so a
        provider's connection string can be pasted straight into .env.
        """
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
