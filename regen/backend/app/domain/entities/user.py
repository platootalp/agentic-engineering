"""User domain entity."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4


@dataclass
class User:
    """User domain entity representing a registered user."""

    id: UUID = field(default_factory=uuid4)
    email: str = ""
    hashed_password: str = ""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    @property
    def full_name(self) -> str:
        """Get user's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.last_name or ""

    @classmethod
    def create(
        cls,
        email: str,
        hashed_password: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
    ) -> "User":
        """Create a new user entity.

        Args:
            email: User's email address.
            hashed_password: Pre-hashed password.
            first_name: Optional first name.
            last_name: Optional last name.

        Returns:
            New User instance.
        """
        now = datetime.utcnow()
        return cls(
            id=uuid4(),
            email=email.lower().strip(),
            hashed_password=hashed_password,
            first_name=first_name,
            last_name=last_name,
            is_active=True,
            is_verified=False,
            created_at=now,
            updated_at=now,
        )

    def update(self, **kwargs) -> None:
        """Update user fields."""
        for key, value in kwargs.items():
            if hasattr(self, key) and value is not None:
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()

    def deactivate(self) -> None:
        """Deactivate the user account."""
        self.is_active = False
        self.updated_at = datetime.utcnow()

    def verify(self) -> None:
        """Mark user as verified."""
        self.is_verified = True
        self.updated_at = datetime.utcnow()
