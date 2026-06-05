import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID

class UUIDMixin:
    """Mixin that adds a UUID primary key to a model."""
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

class TimestampMixin:
    """Mixin that adds timezone-aware created_at and updated_at timestamps to a model."""
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
