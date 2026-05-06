# Backend Test Suite

Comprehensive unit and integration tests for the FastAPI backend.

## Test Statistics

| Category | Files | Lines | Coverage |
|----------|-------|-------|----------|
| Domain Entities | 4 | ~2,300 | User, JD, Experience, Resume |
| Use Cases | 3 | ~2,200 | User, JD, Resume operations |
| Repositories | 4 | ~1,900 | PostgreSQL implementations |
| Controllers | 4 | ~1,700 | API endpoints |
| Infrastructure | 5 | ~1,900 | AI, PDF, Security |
| **Total** | **20** | **~9,300** | **Full coverage** |

## Test Structure

```
tests/
├── conftest.py                    # 295 lines - Fixtures and configuration
├── pytest.ini                     # Test configuration
├── domain/                        # Domain entity tests
│   ├── test_user_entity.py       # 264 lines
│   ├── test_jd_entity.py         # 414 lines
│   ├── test_experience_entity.py # 424 lines
│   └── test_resume_entity.py     # 305 lines
├── use_cases/                     # Business logic tests
│   ├── test_user_use_cases.py    # 539 lines
│   ├── test_jd_use_cases.py      # 664 lines
│   └── test_resume_use_cases.py  # 959 lines
├── repositories/                  # Database layer tests
│   ├── test_user_repository.py   # 340 lines
│   ├── test_jd_repository.py     # 451 lines
│   ├── test_experience_repository.py # 410 lines
│   └── test_resume_repository.py # 402 lines
├── controllers/                   # API endpoint tests
│   ├── test_auth_controller.py   # 335 lines
│   ├── test_jd_controller.py     # 323 lines
│   ├── test_experience_controller.py # 375 lines
│   └── test_resume_controller.py # (created)
└── infrastructure/                # Infrastructure tests
    ├── test_security.py          # 398 lines
    ├── test_ai_gateway.py        # 263 lines
    ├── test_ai_router.py         # 391 lines
    ├── test_ai_adapters.py       # 439 lines
    └── test_pdf_service.py       # 274 lines
```

## Running Tests

### Prerequisites

Ensure you have a PostgreSQL database running for integration tests:

```bash
# Using Docker
docker run -d \
  --name test-postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=test_db \
  -p 5432:5432 \
  postgres:16
```

### Install Test Dependencies

```bash
cd backend
uv pip install -e ".[dev]"
# or
pip install pytest pytest-asyncio pytest-cov httpx
```

### Run All Tests

```bash
python -m pytest tests/ -v
```

### Run Specific Test Categories

```bash
# Domain tests only
python -m pytest tests/domain/ -v

# Use case tests
python -m pytest tests/use_cases/ -v

# Repository tests (requires database)
python -m pytest tests/repositories/ -v

# Controller tests
python -m pytest tests/controllers/ -v

# Infrastructure tests
python -m pytest tests/infrastructure/ -v
```

### Run with Coverage

```bash
python -m pytest tests/ --cov=app --cov-report=html --cov-report=term
```

### Run Tests by Marker

```bash
# Unit tests only (no database)
python -m pytest tests/ -m unit -v

# Integration tests
python -m pytest tests/ -m integration -v

# Skip slow tests
python -m pytest tests/ -m "not slow" -v
```

## Test Configuration

### Environment Variables

Create a `.env.test` file:

```env
ENVIRONMENT=testing
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/test_db
SECRET_KEY=test-secret-key-for-testing-only
KIMI_API_KEY=test-kimi-key
DEEPSEEK_API_KEY=test-deepseek-key
```

### Fixtures (conftest.py)

Available fixtures:

- `db_session` - Async SQLAlchemy session for database tests
- `client` - HTTP client for API tests
- `authenticated_client` - Authenticated HTTP client with JWT
- `app` - FastAPI application instance
- `test_user_data` - Sample user data
- `test_jd_data` - Sample job description data
- `test_experience_data` - Sample experience data
- `test_resume_data` - Sample resume data
- `mock_ai_gateway` - Mocked AI gateway
- `mock_pdf_service` - Mocked PDF service
- `mock_kimi_adapter` - Mocked Kimi adapter
- `mock_deepseek_adapter` - Mocked DeepSeek adapter

## Test Categories

### Domain Tests

Test domain entities and business rules:

- Entity creation and validation
- Entity methods and properties
- State transitions
- Business rule enforcement

### Use Case Tests

Test business logic with mocked repositories:

- Input validation
- Success scenarios
- Error handling
- Repository interactions

### Repository Tests

Test database operations:

- CRUD operations
- Filtering and pagination
- Transaction handling
- Relationship loading

### Controller Tests

Test HTTP endpoints:

- Request/response schemas
- Authentication/authorization
- Status codes
- Error responses

### Infrastructure Tests

Test external services:

- JWT token handling
- Password hashing
- AI service adapters
- Circuit breaker pattern
- PDF generation

## Best Practices

1. **Use fixtures** from `conftest.py` for common setup
2. **Mock external services** (AI, PDF, email)
3. **Test async code** with `@pytest.mark.asyncio`
4. **Clean up** - Tests should not leave data in database
5. **Use markers** to categorize tests (`@pytest.mark.unit`, `@pytest.mark.integration`)
6. **Test both success and failure** scenarios

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install uv
          uv pip install -e ".[dev]"
      
      - name: Run tests
        run: |
          cd backend
          python -m pytest tests/ --cov=app --cov-report=xml
        env:
          DATABASE_URL: postgresql+asyncpg://user:password@localhost:5432/test_db
          SECRET_KEY: test-secret-key
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage.xml
```
