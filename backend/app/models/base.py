"""SQLAlchemy base model with shared timestamp attributes."""

from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, DateTime, String
from backend.app.core.database import Base


def generate_uuid() -> str:
    """Generates standard UUID4 string."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Returns current datetime in UTC timezone."""
    return datetime.now(timezone.utc)


class TimestampMixin:
    """Mixin for models requiring created_at and updated_at timestamps."""

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

