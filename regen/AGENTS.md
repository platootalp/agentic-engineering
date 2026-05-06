# REGEN - AI Resume Generator

**Generated:** 2026-02-25  
**Project:** Regen - AI智能简历生成器  
**Stack:** FastAPI + React + Chrome Extension

---

## OVERVIEW

Monorepo for AI-powered resume generation. Extracts job descriptions (JD) via Chrome extension, manages user experiences, and generates tailored resumes using AI.

**Components:**
- `backend/` - FastAPI with Clean Architecture (Python 3.11+)
- `frontend/` - React 18 + TypeScript + Vite + shadcn/ui
- `extension/` - Chrome Extension Manifest V3 for JD extraction
- `docker/` - Full containerized development environment

---

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add API endpoint | `backend/app/adapters/controllers/` | Follow existing router patterns |
| Add business logic | `backend/app/use_cases/` | One use case per file |
| Add domain entity | `backend/app/domain/entities/` | Use dataclasses |
| Add repository | `backend/app/adapters/repositories/` | Implement interface from domain |
| Add AI service | `backend/app/infrastructure/ai/` | Adapter pattern for LLM providers |
| Add UI page | `frontend/src/pages/` | Route-based organization |
| Add component | `frontend/src/components/` | By feature (auth/, jobs/, resumes/) |
| Add API client | `frontend/src/services/` | TanStack Query hooks |
| Add store | `frontend/src/stores/` | Zustand stores |
| Add JD adapter | `extension/src/content/adapters/` | Per-site extraction logic |

---

## PROJECT ENTRY POINTS

```bash
# Backend
backend/app/main.py              # FastAPI factory
backend/app/config.py            # Pydantic settings

# Frontend
frontend/src/main.tsx            # React entry
frontend/src/App.tsx             # Routes

# Extension
extension/src/background/index.ts # Service worker
extension/src/content/index.ts    # Content script
extension/src/popup/main.tsx      # Popup UI
```

---

## DEVELOPMENT COMMANDS

```bash
# Backend (requires PostgreSQL, Redis)
cd backend
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev              # http://localhost:3000

# Extension
cd extension
npm install
npm run build:dev
# Load extension/dist in chrome://extensions

# Full stack with Docker
cd docker
docker-compose up -d
```

---

## CONVENTIONS

### Backend (Python)
- **Architecture:** Clean Architecture - domain → use_cases → adapters → infrastructure
- **Naming:** `snake_case` for functions/variables, `PascalCase` for classes
- **Entities:** Dataclasses with factory methods (`create()`, `update()`)
- **Use Cases:** Input/Output dataclasses, `execute()` method
- **Repositories:** Interface in domain/, implementation in adapters/
- **Database:** All tables use `regen_` prefix (e.g., `regen_users`)
- **Tests:** Mirror structure in `tests/`, use pytest with async fixtures

### Frontend (TypeScript/React)
- **Paths:** `@/` maps to `src/`
- **Components:** shadcn/ui in `components/ui/`, feature components in subdirs
- **State:** Zustand for auth, TanStack Query for server state
- **Forms:** React Hook Form + Zod validation
- **Testing:** Vitest for unit, Playwright for E2E

### Extension (TypeScript)
- **Architecture:** Adapter pattern for different job sites
- **Manifest:** V3 with service worker
- **Content Scripts:** Site-specific adapters (zhipin, etc.)

---

## ANTI-PATTERNS (KNOWN ISSUES)

⚠️ **Placeholder AI Features:**
- `jd_controller.py:447` - AI analysis returns fake hardcoded data
- `experience_controller.py:448` - AI optimization is stubbed
- `resume_controller.py:509,597` - AI generation and PDF export are placeholders
- `ai/router.py:441-445` - Qwen and GLM adapters not implemented

⚠️ **Global State:**
- AI router uses singleton pattern (`ai/__init__.py`) - prefer DI

---

## NOTES

- Root `package.json` is minimal (only Radix deps) - no workspace config
- Backend uses `uv` (Astral) for Python package management
- Frontend proxies `/api` to backend in dev mode
- All Docker containers use `regen-` prefix
