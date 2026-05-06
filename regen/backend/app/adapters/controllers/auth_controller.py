"""Authentication controller with auth endpoints."""

from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.domain.repositories.user_repository import UserRepository
from app.adapters.repositories.postgres_user_repository import PostgresUserRepository
from app.infrastructure.deps import get_current_active_user
from app.infrastructure.security import verify_token, create_access_token
from app.use_cases.user.register_user import (
    RegisterUserUseCase,
    RegisterUserInput,
    RegisterUserOutput,
)
from app.use_cases.user.login_user import (
    LoginUserUseCase,
    LoginUserInput,
    LoginUserOutput,
)
from app.use_cases.user.get_current_user import GetCurrentUserOutput

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


# Request/Response Schemas
class RegisterRequest(BaseModel):
    """User registration request."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password (min 8 chars)")
    first_name: Optional[str] = Field(None, description="User first name")
    last_name: Optional[str] = Field(None, description="User last name")


class LoginRequest(BaseModel):
    """User login request."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class RefreshRequest(BaseModel):
    """Token refresh request."""

    refresh_token: str = Field(..., description="Valid refresh token")


class UserResponse(BaseModel):
    """User data in response."""

    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    full_name: str
    is_active: bool
    is_verified: bool
    created_at: str


class TokensResponse(BaseModel):
    """Tokens data in response."""

    access_token: str
    refresh_token: str
    expires_in: int


class AuthResponse(BaseModel):
    """Authentication response wrapper."""

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


def get_user_repository(db: AsyncSession = Depends(get_db)) -> UserRepository:
    """Get user repository instance."""
    return PostgresUserRepository(db)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account with email and password.",
)
async def register(
    request: RegisterRequest,
    user_repository: UserRepository = Depends(get_user_repository),
) -> AuthResponse:
    """Register a new user.

    Args:
        request: Registration request data.
        user_repository: User repository for database operations.

    Returns:
        Authentication response with user and tokens.
    """
    use_case = RegisterUserUseCase(user_repository)
    input_data = RegisterUserInput(
        email=request.email,
        password=request.password,
        first_name=request.first_name,
        last_name=request.last_name,
    )

    result: RegisterUserOutput = await use_case.execute(input_data)

    if not result.success:
        status_code = (
            status.HTTP_409_CONFLICT
            if result.error == "EMAIL_EXISTS"
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(
            status_code=status_code,
            detail={
                "success": False,
                "data": None,
                "message": result.message,
                "error": result.error,
            },
        )

    return AuthResponse(
        success=True,
        data={
            "user": {
                "id": result.user.id,
                "email": result.user.email,
                "first_name": result.user.first_name,
                "last_name": result.user.last_name,
                "full_name": result.user.full_name,
                "is_active": result.user.is_active,
                "is_verified": result.user.is_verified,
                "created_at": result.user.created_at.isoformat(),
            },
            "tokens": {
                "access_token": result.tokens.access_token,
                "refresh_token": result.tokens.refresh_token,
                "expires_in": result.tokens.expires_in,
            },
        },
        message=result.message,
        error=None,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="User login",
    description="Authenticate user with email and password.",
)
async def login(
    request: LoginRequest,
    user_repository: UserRepository = Depends(get_user_repository),
) -> AuthResponse:
    """Authenticate user and return tokens.

    Args:
        request: Login request data.
        user_repository: User repository for database operations.

    Returns:
        Authentication response with user and tokens.
    """
    use_case = LoginUserUseCase(user_repository)
    input_data = LoginUserInput(
        email=request.email,
        password=request.password,
    )

    result: LoginUserOutput = await use_case.execute(input_data)

    if not result.success:
        status_code = (
            status.HTTP_403_FORBIDDEN
            if result.error == "ACCOUNT_INACTIVE"
            else status.HTTP_401_UNAUTHORIZED
        )
        raise HTTPException(
            status_code=status_code,
            detail={
                "success": False,
                "data": None,
                "message": result.message,
                "error": result.error,
            },
        )

    return AuthResponse(
        success=True,
        data={
            "user": {
                "id": result.user.id,
                "email": result.user.email,
                "first_name": result.user.first_name,
                "last_name": result.user.last_name,
                "full_name": result.user.full_name,
                "is_active": result.user.is_active,
                "is_verified": result.user.is_verified,
                "created_at": result.user.created_at.isoformat(),
            },
            "tokens": {
                "access_token": result.tokens.access_token,
                "refresh_token": result.tokens.refresh_token,
                "expires_in": result.tokens.expires_in,
            },
        },
        message=result.message,
        error=None,
    )


@router.post(
    "/refresh",
    response_model=RefreshResponse,
    summary="Refresh access token",
    description="Get new access token using refresh token.",
)
async def refresh_token(request: RefreshRequest) -> RefreshResponse:
    """Refresh access token using refresh token.

    Args:
        request: Refresh token request.

    Returns:
        New access token with expiration.
    """
    # Verify refresh token
    payload = verify_token(request.refresh_token, token_type="refresh")

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "data": None,
                "message": "Invalid or expired refresh token",
                "error": "INVALID_REFRESH_TOKEN",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user info from token
    user_id = payload.get("sub")
    email = payload.get("email")

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "data": None,
                "message": "Invalid token payload",
                "error": "INVALID_TOKEN_PAYLOAD",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create new access token
    token_data = {"sub": user_id, "email": email}
    new_access_token = create_access_token(token_data, expires_delta=timedelta(hours=2))

    return RefreshResponse(
        success=True,
        data={
            "access_token": new_access_token,
            "expires_in": 7200,  # 2 hours in seconds
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
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> UserMeResponse:
    """Get current authenticated user information.

    Args:
        current_user: Current user from dependency.

    Returns:
        Current user information.
    """
    return UserMeResponse(
        success=True,
        data={
            "user": {
                "id": current_user.user.id,
                "email": current_user.user.email,
                "first_name": current_user.user.first_name,
                "last_name": current_user.user.last_name,
                "full_name": current_user.user.full_name,
                "is_active": current_user.user.is_active,
                "is_verified": current_user.user.is_verified,
                "created_at": current_user.user.created_at.isoformat(),
            },
        },
        message="User retrieved successfully",
        error=None,
    )
