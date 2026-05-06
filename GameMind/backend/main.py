"""FastAPI application entry point with security middleware and error handling."""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Load .env before any other application imports
from config import load_dotenv, get_settings

load_dotenv()

from db.database import init_db
from middleware.rate_limit import limiter

# Configure structured logging
settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("backend")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Application lifespan: startup and shutdown handlers."""
    # Startup: validate config and init database
    try:
        settings.validate()
    except ValueError as e:
        logger.error("Configuration validation failed: %s", str(e))
        sys.exit(1)

    init_db()
    logger.info("Database initialized")

    # Start scheduler with agent engine
    from services.agent.engine import AgentEngine
    from services.scheduler import init_scheduler

    agent = AgentEngine()
    scheduler = init_scheduler(agent)
    _app.state.scheduler = scheduler
    logger.info("Scheduler initialized")

    yield

    # Shutdown: stop scheduler
    if scheduler:
        scheduler.stop()
    logger.info("Application shutting down")


app = FastAPI(
    title="游戏市场分析 Agent API",
    version="0.1.0",
    lifespan=lifespan,
)

# Add rate limiter to app state
app.state.limiter = limiter

# Register rate limit exceeded handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration — restrict to allowed origins from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Import routers after app creation to avoid circular imports
from routers.reports import router as reports_router
from routers.categories import router as categories_router
from routers.dashboard import router as dashboard_router
from routers.execute import router as execute_router

app.include_router(execute_router)
app.include_router(reports_router)
app.include_router(categories_router)
app.include_router(dashboard_router)


# --- Error Handlers ---

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return sanitized validation errors without internal details."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Log internal errors but return generic messages to clients."""
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


# --- Routes ---

@app.get("/api/health")
def health_check():
    """Public health check endpoint (no auth required)."""
    return {"status": "ok"}


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Game Market Analysis Agent API v2", "version": "0.1.0"}
