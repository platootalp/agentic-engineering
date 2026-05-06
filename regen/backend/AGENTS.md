# BACKEND - FastAPI Clean Architecture

**Stack:** Python 3.11+, FastAPI, SQLAlchemy 2.0 (async), PostgreSQL

---

## STRUCTURE

```
backend/
├── app/
│   ├── domain/              # Entities, Repository interfaces
│   │   ├── entities/        # Dataclass domain models
│   │   └── repositories/    # Abstract repository interfaces
│   ├── use_cases/           # Business logic
│   │   ├── user/            # User-related use cases
│   │   ├── jd/              # Job description use cases
│   │   ├── experience/      # Experience management
│   │   └── resume/          # Resume generation
│   ├── adapters/            # Interface adapters
│   │   ├── controllers/     # FastAPI routers
│   │   └── repositories/    # PostgreSQL implementations
│   └── infrastructure/      # External concerns
│       ├── ai/              # AI service adapters (Kimi, DeepSeek)
│       ├── pdf/             # PDF export service
│       ├── security.py      # JWT, password hashing
│       └── logging.py       # Structured logging
├── tests/                   # Test suite mirrors app structure
└── alembic/                 # Database migrations
```

---

## WHERE TO LOOK

| Task | Location | Pattern |
|------|----------|---------|
| Add entity | `domain/entities/` | Dataclass with `create()`, `update()` methods |
| Add use case | `use_cases/{domain}/` | Input/Output dataclasses + `execute()` |
| Add endpoint | `adapters/controllers/` | FastAPI router, prefix `/api/v1/` |
| Add repository | `adapters/repositories/` | Implement domain interface |
| Add AI adapter | `infrastructure/ai/` | Inherit from base adapter |
| Database migration | `alembic/versions/` | `uv run alembic revision --autogenerate` |

---

## CONVENTIONS

### Entity Pattern
```python
@dataclass
class Entity:
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)

    @classmethod
    def create(cls, ...) -> "Entity": ...

    def update(self, **kwargs) -> None: ...
```

### Use Case Pattern
```python
@dataclass
class Input: ...

@dataclass
class Output:
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None

class UseCase:
    async def execute(self, input: Input) -> Output: ...
```

### Repository Pattern
```python
# Domain interface
class Repository(ABC):
    @abstractmethod
    async def get_by_id(self, id: UUID) -> Optional[Entity]: ...

# Adapter implementation
class PostgresRepository:
    def __init__(self, db: AsyncSession): ...
```

---

## TESTING

```bash
# Run all tests
uv run pytest tests/ -v

# Run specific layer
uv run pytest tests/domain/ -v
uv run pytest tests/use_cases/ -v

# With coverage
uv run pytest tests/ --cov=app --cov-report=html
```

**Test Structure:**
- `conftest.py` - Shared fixtures (db_session, client, authenticated_client)
- Mirror app structure: `tests/{domain,use_cases,controllers,repositories,infrastructure}/`
- Use markers: `@pytest.mark.unit`, `@pytest.mark.integration`

---

## ANTI-PATTERNS

⚠️ **Singleton AI Router** - `infrastructure/ai/__init__.py` uses global state. Prefer dependency injection.

⚠️ **Placeholder AI** - Multiple TODOs for unimplemented AI features in controllers.

⚠️ **Hardcoded Values** - Template IDs and mock data scattered in controllers.
