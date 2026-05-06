"""User/auth router following the domain-modular template pattern.

Routes (aligned with template where possible):
  POST /api/v1/users/register  — Register new user
  POST /api/v1/users/login     — Email+password login
  POST /api/v1/users/refresh   — Refresh access token (regen-specific)
  GET  /api/v1/users/me        — Get current user info (regen-specific)
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.modules.users.schema import (
    AuthResponse,
    RefreshRequest,
    RefreshResponse,
    UserLogin,
    UserMeResponse,
    UserRegister,
)
from app.modules.users.service import UserService

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account with email and password.",
)
async def register(
    data: UserRegister,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """Register a new user."""
    try:
        user = await UserService.register(db, data)
    except ValueError as e:
        error_msg = str(e)
        status_code = (
            status.HTTP_409_CONFLICT
            if "already exists" in error_msg
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(
            status_code=status_code,
            detail={
                "success": False,
                "data": None,
                "message": error_msg,
                "error": "EMAIL_EXISTS" if "already exists" in error_msg else "VALIDATION_ERROR",
            },
        )

    # Generate tokens for the newly registered user
    from app.infrastructure.security import create_access_token, create_refresh_token
    from datetime import timedelta

    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data, expires_delta=timedelta(hours=2))
    refresh_token = create_refresh_token(token_data, expires_delta=timedelta(days=7))

    return AuthResponse(
        success=True,
        data={
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat(),
            },
            "tokens": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "expires_in": 7200,
            },
        },
        message="User registered successfully",
        error=None,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="User login",
    description="Authenticate user with email and password.",
)
async def login(
    data: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """Authenticate user and return tokens."""
    try:
        user, access_token, refresh_token, expires_in = await UserService.login(
            db, data.email, data.password
        )
    except ValueError as e:
        error_msg = str(e)
        if "deactivated" in error_msg:
            error_code = "ACCOUNT_INACTIVE"
            http_status = status.HTTP_403_FORBIDDEN
        else:
            error_code = "INVALID_CREDENTIALS"
            http_status = status.HTTP_401_UNAUTHORIZED
        raise HTTPException(
            status_code=http_status,
            detail={
                "success": False,
                "data": None,
                "message": error_msg,
                "error": error_code,
            },
        )

    return AuthResponse(
        success=True,
        data={
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat(),
            },
            "tokens": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "expires_in": expires_in,
            },
        },
        message="Login successful",
        error=None,
    )


@router.post(
    "/refresh",
    response_model=RefreshResponse,
    summary="Refresh access token",
    description="Get new access token using refresh token.",
)
async def refresh_token(request: RefreshRequest) -> RefreshResponse:
    """Refresh access token using refresh token."""
    try:
        new_access_token, expires_in = UserService.refresh_access_token(
            request.refresh_token
        )
    except ValueError as e:
        error_msg = str(e)
        if "refresh token" in error_msg:
            error_code = "INVALID_REFRESH_TOKEN"
        else:
            error_code = "INVALID_TOKEN_PAYLOAD"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "data": None,
                "message": error_msg,
                "error": error_code,
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    return RefreshResponse(
        success=True,
        data={
            "access_token": new_access_token,
            "expires_in": expires_in,
        },
        message="Token refreshed successfully",
        error=None,
    )


@router.get(
    "/me",
    response_model=UserMeResponse,
    summary="Get current user",
    description="Get information about the currently authenticated user.",
)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserMeResponse:
    """Get current authenticated user information."""
    try:
        user_id = UUID(current_user["id"])
        user = await UserService.get_current_user(db, user_id)
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg:
            http_status = status.HTTP_404_NOT_FOUND
            error_code = "USER_NOT_FOUND"
        else:
            http_status = status.HTTP_403_FORBIDDEN
            error_code = "ACCOUNT_INACTIVE"
        raise HTTPException(
            status_code=http_status,
            detail={
                "success": False,
                "data": None,
                "message": error_msg,
                "error": error_code,
            },
        )

    return UserMeResponse(
        success=True,
        data={
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat(),
            },
        },
        message="User retrieved successfully",
        error=None,
    )
