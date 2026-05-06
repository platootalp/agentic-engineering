"""Pydantic schemas for the users module."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# --- Request schemas ---


class UserRegister(BaseModel):
    """User registration request."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password (min 8 chars)")
    first_name: Optional[str] = Field(None, description="User first name")
    last_name: Optional[str] = Field(None, description="User last name")


class UserLogin(BaseModel):
    """User login request (email-based)."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class RefreshRequest(BaseModel):
    """Token refresh request."""

    refresh_token: str = Field(..., description="Valid refresh token")


# --- Response schemas ---


class UserResponse(BaseModel):
    """User data in response."""

    id: UUID
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    full_name: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokensResponse(BaseModel):
    """Tokens data in response."""

    access_token: str
    refresh_token: str
    expires_in: int


class AuthResponse(BaseModel):
    """Structured authentication response wrapper (regen convention)."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class RefreshResponse(BaseModel):
    """Token refresh response."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class UserMeResponse(BaseModel):
    """Current user response."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None
