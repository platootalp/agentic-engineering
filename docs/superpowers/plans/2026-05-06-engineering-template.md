# Engineering Template Implementation Plan (Phase 1: React + FastAPI)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Hygen-based CLI project generator that scaffolds React+FastAPI projects with composable capability modules (auth-jwt, db-sqlite, docker, lint), and verify it generates a working project end-to-end.

**Architecture:** CLI entry (`bin/create-project.js`) uses inquirer.js for interactive prompts, then dispatches Hygen generators in sequence: base template first, then each selected capability module overlays its files. Hygen templates use EJS (`.t.ejs` / `.ejs` files) with frontmatter for conditional logic.

**Tech Stack:** Node.js, Hygen, inquirer.js, EJS templates

**Spec:** `docs/superpowers/specs/2026-05-06-engineering-template-design.md`

---

## File Structure

This plan creates the following files under `templates/` in the project root:

```
templates/
├── package.json
├── bin/
│   └── create-project.js              # CLI entry point
├── src/
│   ├── prompts.js                     # inquirer.js prompt definitions
│   ├── generators.js                  # Hygen generator dispatch logic
│   └── utils.js                       # Helper functions (validate project name, etc.)
├── _templates/
│   ├── shared/                        # Shared fragments used by all combos
│   │   ├── gitignore/
│   │   │   └── .ejb.ejs
│   │   ├── env-example/
│   │   │   └── .env.example.ejs
│   │   ├── readme/
│   │   │   └── README.md.ejs
│   │   ├── docs/
│   │   │   ├── architecture.md.ejs
│   │   │   ├── api.md.ejs
│   │   │   └── deployment.md.ejs
│   │   ├── docker/
│   │   │   ├── docker-compose.local.yml.ejs
│   │   │   └── docker-compose.prod.yml.ejs
│   │   └── script/
│   │       ├── setup.sh.ejs
│   │       ├── dev.sh.ejs
│   │       └── deploy.sh.ejs
│   ├── react-fastapi/                 # React + FastAPI base combo
│   │   ├── frontend/
│   │   │   ├── package.json.ejs
│   │   │   ├── index.html.ejs
│   │   │   ├── vite.config.ts.ejs
│   │   │   ├── tailwind.config.ts.ejs
│   │   │   ├── tsconfig.json.ejs
│   │   │   ├── tsconfig.app.json.ejs
│   │   │   ├── tsconfig.node.json.ejs
│   │   │   ├── eslint.config.js.ejs
│   │   │   ├── public/
│   │   │   │   └── vite.svg.ejs
│   │   │   └── src/
│   │   │       ├── main.tsx.ejs
│   │   │       ├── App.tsx.ejs
│   │   │       ├── api/client.ts.ejs
│   │   │       ├── router/index.tsx.ejs
│   │   │       ├── components/ui/.gitkeep.ejs
│   │   │       ├── components/layout/.gitkeep.ejs
│   │   │       ├── hooks/.gitkeep.ejs
│   │   │       ├── lib/.gitkeep.ejs
│   │   │       ├── pages/HomePage.tsx.ejs
│   │   │       ├── stores/.gitkeep.ejs
│   │   │       └── types/.gitkeep.ejs
│   │   └── backend/
│   │       ├── pyproject.toml.ejs
│   │       ├── Dockerfile.ejs
│   │       ├── .dockerignore.ejs
│   │       ├── alembic.ini.ejs
│   │       ├── alembic/
│   │       │   ├── env.py.ejs
│   │       │   └── versions/.gitkeep.ejs
│   │       ├── scripts/
│   │       │   ├── prestart.sh.ejs
│   │       │   └── seed.py.ejs
│   │       ├── tests/
│   │       │   ├── conftest.py.ejs
│   │       │   ├── core/.gitkeep.ejs
│   │       │   └── modules/.gitkeep.ejs
│   │       └── app/
│   │           ├── __init__.py.ejs
│   │           ├── main.py.ejs
│   │           ├── core/
│   │           │   ├── __init__.py.ejs
│   │           │   ├── config.py.ejs
│   │           │   ├── database.py.ejs
│   │           │   ├── security.py.ejs
│   │           │   ├── dependencies.py.ejs
│   │           │   └── exceptions.py.ejs
│   │           ├── modules/
│   │           │   ├── __init__.py.ejs
│   │           │   └── health/
│   │           │       ├── __init__.py.ejs
│   │           │       ├── router.py.ejs
│   │           │       ├── service.py.ejs
│   │           │       ├── schema.py.ejs
│   │           │       └── model.py.ejs
│   │           └── middleware/
│   │               ├── __init__.py.ejs
│   │               └── logging.py.ejs
│   ├── auth-jwt/                     # Capability: JWT auth
│   │   ├── react/                    # React frontend auth files
│   │   │   ├── components/
│   │   │   │   ├── LoginPage.tsx.ejs
│   │   │   │   └── RegisterPage.tsx.ejs
│   │   │   ├── stores/authStore.ts.ejs
│   │   │   ├── router/protected.tsx.ejs
│   │   │   └── types/auth.ts.ejs
│   │   └── fastapi/                  # FastAPI backend auth files
│   │       ├── modules/users/
│   │       │   ├── router.py.ejs
│   │       │   ├── service.py.ejs
│   │       │   ├── schema.py.ejs
│   │       │   └── model.py.ejs
│   │       ├── core/
│   │       │   ├── security.py.ejs
│   │       │   └── dependencies.py.ejs
│   │       └── tests/
│   │           └── modules/users/
│   │               ├── test_router.py.ejs
│   │               └── test_service.py.ejs
│   ├── db-sqlite/                    # Capability: SQLite
│   │   ├── fastapi/
│   │   │   └── core/database.py.ejs
│   │   └── shared/
│   │       └── .env.example.sqlite.ejs
│   ├── docker/                       # Capability: Docker prod
│   │   └── shared/
│   │       ├── docker-compose.prod.yml.ejs
│   │       ├── Dockerfile.frontend.ejs
│   │       └── Dockerfile.backend.ejs
│   └── lint/                         # Capability: Code standards
│       ├── react/
│       │   ├── eslint.config.js.ejs
│       │   ├── .prettierrc.ejs
│       │   └── .husky/
│       │       └── pre-commit.ejs
│       └── fastapi/
│           ├── .pre-commit-config.yaml.ejs
│           └── pyproject.toml.append.ejs
```

---

### Task 1: Initialize templates package and CLI skeleton

**Files:**
- Create: `templates/package.json`
- Create: `templates/bin/create-project.js`
- Create: `templates/src/prompts.js`
- Create: `templates/src/generators.js`
- Create: `templates/src/utils.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "create-project",
  "version": "0.1.0",
  "description": "CLI project template generator with composable tech stacks",
  "type": "module",
  "bin": {
    "create-project": "./bin/create-project.js"
  },
  "scripts": {
    "start": "node bin/create-project.js"
  },
  "dependencies": {
    "hygen": "^6.2.11",
    "inquirer": "^9.2.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

- [ ] **Step 2: Create utils.js**

```javascript
// templates/src/utils.js
export function validateProjectName(input) {
  if (!input.trim()) return 'Project name is required';
  if (!/^[a-z][a-z0-9-]*$/.test(input.trim())) {
    return 'Project name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens';
  }
  return true;
}

export function kebabToPascal(str) {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function kebabToCamel(str) {
  const pascal = kebabToPascal(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
```

- [ ] **Step 3: Create prompts.js**

```javascript
// templates/src/prompts.js
import inquirer from 'inquirer';
import { validateProjectName } from './utils.js';

const BACKEND_OPTIONS = {
  react: [
    { name: 'FastAPI (Python)', value: 'fastapi' },
    { name: 'Express (Node.js)', value: 'express' },
    { name: 'Next.js (Full Stack)', value: 'nextjs' },
  ],
  vue: [
    { name: 'FastAPI (Python)', value: 'fastapi' },
    { name: 'Nuxt 3 (Full Stack)', value: 'nuxt3' },
  ],
};

const UI_OPTIONS = {
  react: [
    { name: 'shadcn/ui + Tailwind CSS (default)', value: 'shadcn' },
    { name: 'Ant Design', value: 'antd' },
    { name: 'Tailwind CSS only', value: 'tailwind-only' },
    { name: 'Other (manual config)', value: 'other' },
  ],
  vue: [
    { name: 'Naive UI + Tailwind CSS (default)', value: 'naive' },
    { name: 'Element Plus', value: 'element-plus' },
    { name: 'Tailwind CSS only', value: 'tailwind-only' },
    { name: 'Other (manual config)', value: 'other' },
  ],
};

export async function runPrompts() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: validateProjectName,
    },
    {
      type: 'list',
      name: 'frontend',
      message: 'Select frontend framework:',
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Vue', value: 'vue' },
      ],
    },
    {
      type: 'list',
      name: 'backend',
      message: 'Select backend framework:',
      choices: (answers) => BACKEND_OPTIONS[answers.frontend],
    },
    {
      type: 'list',
      name: 'pythonPkgManager',
      message: 'Select Python package manager:',
      choices: [
        { name: 'uv (default)', value: 'uv' },
        { name: 'poetry', value: 'poetry' },
      ],
      when: (answers) => answers.backend === 'fastapi',
    },
    {
      type: 'list',
      name: 'uiLibrary',
      message: 'Select UI component library:',
      choices: (answers) => UI_OPTIONS[answers.frontend],
    },
    {
      type: 'list',
      name: 'database',
      message: 'Select database:',
      choices: [
        { name: 'SQLite (default)', value: 'sqlite' },
        { name: 'PostgreSQL', value: 'postgres' },
        { name: 'MySQL', value: 'mysql' },
      ],
    },
    {
      type: 'checkbox',
      name: 'capabilities',
      message: 'Select capabilities:',
      choices: [
        { name: 'Authentication (JWT)', value: 'auth-jwt', checked: true },
        { name: 'Docker', value: 'docker', checked: true },
        { name: 'Code Standards (Lint)', value: 'lint', checked: true },
        { name: 'Initial DB Migration', value: 'db-migration', checked: false },
      ],
    },
  ]);

  // Defaults
  answers.pythonPkgManager = answers.pythonPkgManager || 'uv';
  answers.combo = `${answers.frontend}-${answers.backend}`;

  return answers;
}
```

- [ ] **Step 4: Create generators.js**

```javascript
// templates/src/generators.js
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '..', '_templates');

export async function runGenerators(answers) {
  const targetDir = path.resolve(answers.projectName);
  const templateDir = TEMPLATES_DIR;

  const baseArgs = [
    `--projectName=${answers.projectName}`,
    `--frontend=${answers.frontend}`,
    `--backend=${answers.backend}`,
    `--uiLibrary=${answers.uiLibrary}`,
    `--database=${answers.database}`,
    `--pythonPkgManager=${answers.pythonPkgManager}`,
    `--combo=${answers.combo}`,
  ];

  // 1. Generate shared files
  runHygen(templateDir, targetDir, 'shared', 'new', baseArgs);

  // 2. Generate base combo template
  runHygen(templateDir, targetDir, answers.combo, 'new', baseArgs);

  // 3. Generate selected capability modules
  for (const cap of answers.capabilities) {
    runHygen(templateDir, targetDir, cap, 'new', baseArgs);
  }

  return targetDir;
}

function runHygen(templatesDir, targetDir, generator, action, args) {
  const cmd = [
    'npx',
    'hygen',
    generator,
    action,
    ...args,
    `--cwd=${targetDir}`,
    `--templates=${templatesDir}`,
  ].join(' ');

  console.log(`  Generating: ${generator}/${action}`);
  execSync(cmd, { stdio: 'inherit', cwd: targetDir });
}
```

- [ ] **Step 5: Create bin/create-project.js**

```javascript
#!/usr/bin/env node
// templates/bin/create-project.js
import { runPrompts } from '../src/prompts.js';
import { runGenerators } from '../src/generators.js';
import { kebabToPascal } from '../src/utils.js';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('\n  Project Template Generator\n');

  const answers = await runPrompts();
  answers.projectNamePascal = kebabToPascal(answers.projectName);

  // Create target directory
  const targetDir = path.resolve(answers.projectName);
  if (fs.existsSync(targetDir)) {
    console.error(`\n  Error: Directory "${answers.projectName}" already exists.`);
    process.exit(1);
  }
  fs.mkdirSync(targetDir, { recursive: true });

  console.log('\n  Generating project...');
  await runGenerators(answers);

  console.log(`\n  Project "${answers.projectName}" is ready!`);
  console.log(`\n  cd ${answers.projectName}`);
  console.log(`  cat README.md  # for next steps\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 6: Install dependencies and test CLI runs**

Run: `cd templates && npm install`
Then: `node bin/create-project.js --help` (will fail with inquirer error since no TTY, but should not crash on import)

Expected: Dependencies install without errors, CLI script parses without syntax errors.

- [ ] **Step 7: Commit**

```bash
git add templates/package.json templates/bin/ templates/src/
git commit -m "feat: add CLI skeleton with inquirer prompts and hygen dispatch"
```

---

### Task 2: Create shared template files

**Files:**
- Create: `templates/_templates/shared/new/.gitignore.ejs`
- Create: `templates/_templates/shared/new/.env.example.ejs`
- Create: `templates/_templates/shared/new/README.md.ejs`
- Create: `templates/_templates/shared/new/docs/architecture.md.ejs`
- Create: `templates/_templates/shared/new/docs/api.md.ejs`
- Create: `templates/_templates/shared/new/docs/deployment.md.ejs`
- Create: `templates/_templates/shared/new/docker/docker-compose.local.yml.ejs`
- Create: `templates/_templates/shared/new/docker/docker-compose.prod.yml.ejs`
- Create: `templates/_templates/shared/new/script/setup.sh.ejs`
- Create: `templates/_templates/shared/new/script/dev.sh.ejs`
- Create: `templates/_templates/shared/new/script/deploy.sh.ejs`

- [ ] **Step 1: Create .gitignore.ejs**

```
---
to: "<%= projectName %>/.gitignore"
---
# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
dist/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build
*.egg-info/
build/

# Test
coverage/
.coverage
htmlcov/
```

- [ ] **Step 2: Create .env.example.ejs**

```
---
to: "<%= projectName %>/.env.example"
---
# Application
APP_NAME=<%= projectName %>
APP_ENV=development

# Database
DATABASE_URL=sqlite:///./<%= projectName %>.db

# Frontend
VITE_API_URL=http://localhost:8000
```

- [ ] **Step 3: Create README.md.ejs**

```
---
to: "<%= projectName %>/README.md"
---
# <%= projectName %>

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** FastAPI + Python
- **Database:** SQLite (default, switchable to PostgreSQL/MySQL)

## Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.11
- uv (or poetry)

### Setup

```bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && uv sync

# Run development servers
cd ..
./script/dev.sh
```

## Project Structure

See [docs/architecture.md](docs/architecture.md) for details.

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Deployment](docs/deployment.md)
```

- [ ] **Step 4: Create docs/ templates**

`docs/architecture.md.ejs`:
```
---
to: "<%= projectName %>/docs/architecture.md"
---
# <%= projectName %> - Architecture

## Overview

This project uses a **React + FastAPI** stack with domain-modular architecture.

## Frontend

- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Routing:** React Router v6

### Directory Structure

```
frontend/src/
├── api/           # API client
├── assets/        # Static assets
├── components/    # UI components
│   ├── ui/        # Base UI library
│   └── layout/    # Layout components
├── hooks/         # Custom React hooks
├── lib/           # Utilities
├── pages/         # Page components
├── router/        # Route configuration
├── stores/        # Zustand stores
└── types/         # TypeScript types
```

## Backend

- **Framework:** FastAPI
- **ORM:** SQLAlchemy 2.0 async
- **Migrations:** Alembic
- **Architecture:** Domain-modular

### Directory Structure

```
backend/app/
├── core/          # Global infrastructure (config, database, security)
├── modules/       # Business domain modules
│   └── {domain}/  # Each domain: router, service, schema, model
├── middleware/     # Application middleware
└── main.py        # FastAPI entry point
```

### Adding a New Domain Module

1. Create `backend/app/modules/{domain}/` with: `router.py`, `service.py`, `schema.py`, `model.py`
2. Register the router in `backend/app/main.py`
3. Create an Alembic migration: `cd backend && alembic revision --autogenerate -m "add {domain}"`
```

`docs/api.md.ejs`:
```
---
to: "<%= projectName %>/docs/api.md"
---
# <%= projectName %> - API Reference

Base URL: `http://localhost:8000`

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |

## Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/users/register` | Register new user |
| POST | `/api/v1/users/login` | Login and get JWT token |

> Add your API endpoints here as you build them.
```

`docs/deployment.md.ejs`:
```
---
to: "<%= projectName %>/docs/deployment.md"
---
# <%= projectName %> - Deployment

## Docker (Recommended)

```bash
# Build and run
docker-compose -f docker/docker-compose.prod.yml up -d

# View logs
docker-compose -f docker/docker-compose.prod.yml logs -f
```

## Manual Deployment

### Frontend

```bash
cd frontend
npm run build
# Serve dist/ with nginx, caddy, etc.
```

### Backend

```bash
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```
```

- [ ] **Step 5: Create docker/ templates**

`docker/docker-compose.local.yml.ejs`:
```
---
to: "<%= projectName %>/docker/docker-compose.local.yml"
---
version: "3.8"

services:
  frontend:
    build:
      context: ../frontend
      dockerfile: ../docker/Dockerfile.frontend
    ports:
      - "3000:3000"
    volumes:
      - ../frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000

  backend:
    build:
      context: ../backend
      dockerfile: ../docker/Dockerfile.backend
    ports:
      - "8000:8000"
    volumes:
      - ../backend:/app
    environment:
      - DATABASE_URL=sqlite:///./<%= projectName %>.db
    command: uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

`docker/docker-compose.prod.yml.ejs`:
```
---
to: "<%= projectName %>/docker/docker-compose.prod.yml"
---
version: "3.8"

services:
  frontend:
    build:
      context: ../frontend
      dockerfile: ../docker/Dockerfile.frontend
    ports:
      - "3000:80"
    restart: unless-stopped

  backend:
    build:
      context: ../backend
      dockerfile: ../docker/Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped
```

- [ ] **Step 6: Create script/ templates**

`script/setup.sh.ejs`:
```
---
to: "<%= projectName %>/script/setup.sh"
---
#!/usr/bin/env bash
set -euo pipefail

echo "Setting up <%= projectName %>..."

# Frontend
echo "Installing frontend dependencies..."
cd "$(dirname "$0")/../frontend"
npm install

# Backend
echo "Installing backend dependencies..."
cd "$(dirname "$0")/../backend"
uv sync

echo "Setup complete! Run ./script/dev.sh to start development."
```

`script/dev.sh.ejs`:
```
---
to: "<%= projectName %>/script/dev.sh"
---
#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(dirname "$0")/.."

echo "Starting development servers..."

# Start backend in background
(cd "$PROJECT_DIR/backend" && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &
BACKEND_PID=$!

# Start frontend
(cd "$PROJECT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

echo "Backend running on http://localhost:8000"
echo "Frontend running on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM
wait
```

`script/deploy.sh.ejs`:
```
---
to: "<%= projectName %>/script/deploy.sh"
---
#!/usr/bin/env bash
set -euo pipefail

echo "Deploying <%= projectName %>..."

cd "$(dirname "$0")/.."
docker-compose -f docker/docker-compose.prod.yml up -d --build

echo "Deploy complete!"
```

- [ ] **Step 7: Make scripts executable and commit**

```bash
# No chmod needed - Hygen writes the files, we chmod after generation
# But we verify the templates are well-formed by checking them
ls -la templates/_templates/shared/new/
git add templates/_templates/
git commit -m "feat: add shared template files (gitignore, env, readme, docs, docker, scripts)"
```

---

### Task 3: Create React+FastAPI base template - Frontend

**Files:**
- Create: `templates/_templates/react-fastapi/new/frontend/package.json.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/index.html.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/vite.config.ts.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/tailwind.config.ts.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/tsconfig.json.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/tsconfig.app.json.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/tsconfig.node.json.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/eslint.config.js.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/public/vite.svg.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/main.tsx.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/App.tsx.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/api/client.ts.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/router/index.tsx.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/pages/HomePage.tsx.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/components/ui/.gitkeep.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/components/layout/.gitkeep.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/hooks/.gitkeep.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/lib/.gitkeep.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/stores/.gitkeep.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/types/.gitkeep.ejs`
- Create: `templates/_templates/react-fastapi/new/frontend/src/assets/.gitkeep.ejs`

- [ ] **Step 1: Create frontend config files**

`frontend/package.json.ejs`:
```
---
to: "<%= projectName %>/frontend/package.json"
---
{
  "name": "<%= projectName %>-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "zustand": "^4.5.4",
    "axios": "^1.7.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^9.9.0",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "typescript": "^5.5.4",
    "vite": "^5.4.0"
  }
}
```

`frontend/index.html.ejs`:
```
---
to: "<%= projectName %>/frontend/index.html"
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= projectNamePascal %></title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`frontend/vite.config.ts.ejs`:
```
---
to: "<%= projectName %>/frontend/vite.config.ts"
---
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

`frontend/tailwind.config.ts.ejs`:
```
---
to: "<%= projectName %>/frontend/tailwind.config.ts"
---
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

`frontend/tsconfig.json.ejs`:
```
---
to: "<%= projectName %>/frontend/tsconfig.json"
---
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`frontend/tsconfig.app.json.ejs`:
```
---
to: "<%= projectName %>/frontend/tsconfig.app.json"
---
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

`frontend/tsconfig.node.json.ejs`:
```
---
to: "<%= projectName %>/frontend/tsconfig.node.json"
---
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

`frontend/eslint.config.js.ejs`:
```
---
to: "<%= projectName %>/frontend/eslint.config.js"
---
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
```

- [ ] **Step 2: Create frontend source files**

`frontend/public/vite.svg.ejs`:
```
---
to: "<%= projectName %>/frontend/public/vite.svg"
---
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFBD4F"></stop><stop offset="100%" stop-color="#FF9640"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>
```

`frontend/src/main.tsx.ejs`:
```
---
to: "<%= projectName %>/frontend/src/main.tsx"
---
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './assets/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`frontend/src/App.tsx.ejs`:
```
---
to: "<%= projectName %>/frontend/src/App.tsx"
---
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

function App() {
  return <RouterProvider router={router} />
}

export default App
```

`frontend/src/api/client.ts.ejs`:
```
---
to: "<%= projectName %>/frontend/src/api/client.ts"
---
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient
```

`frontend/src/router/index.tsx.ejs`:
```
---
to: "<%= projectName %>/frontend/src/router/index.tsx"
---
import { createBrowserRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
])
```

`frontend/src/pages/HomePage.tsx.ejs`:
```
---
to: "<%= projectName %>/frontend/src/pages/HomePage.tsx"
---
function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4"><%= projectNamePascal %></h1>
        <p className="text-gray-600">Welcome to your new project.</p>
      </div>
    </div>
  )
}

export default HomePage
```

- [ ] **Step 3: Create .gitkeep placeholder files for empty directories**

Hygen cannot create empty directories, so we use `.gitkeep` files. Each one follows this pattern:

```
---
to: "<%= projectName %>/frontend/src/components/ui/.gitkeep"
---
```

Create the following `.gitkeep.ejs` files (all with identical content `---\nto: "path"\n---\n`):
- `frontend/src/components/ui/.gitkeep.ejs`
- `frontend/src/components/layout/.gitkeep.ejs`
- `frontend/src/hooks/.gitkeep.ejs`
- `frontend/src/lib/.gitkeep.ejs`
- `frontend/src/stores/.gitkeep.ejs`
- `frontend/src/types/.gitkeep.ejs`
- `frontend/src/assets/.gitkeep.ejs`

- [ ] **Step 4: Create assets/index.css**

```
---
to: "<%= projectName %>/frontend/src/assets/index.css"
---
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Commit**

```bash
git add templates/_templates/react-fastapi/
git commit -m "feat: add React+FastAPI frontend base template"
```

---

### Task 4: Create React+FastAPI base template - Backend

**Files:**
- Create: `templates/_templates/react-fastapi/new/backend/pyproject.toml.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/Dockerfile.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/.dockerignore.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/alembic.ini.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/alembic/env.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/alembic/versions/.gitkeep.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/scripts/prestart.sh.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/scripts/seed.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/tests/conftest.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/__init__.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/main.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/core/__init__.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/core/config.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/core/database.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/core/security.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/core/dependencies.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/core/exceptions.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/modules/__init__.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/modules/health/__init__.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/modules/health/router.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/modules/health/service.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/modules/health/schema.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/modules/health/model.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/middleware/__init__.py.ejs`
- Create: `templates/_templates/react-fastapi/new/backend/app/middleware/logging.py.ejs`

- [ ] **Step 1: Create backend config files**

`backend/pyproject.toml.ejs`:
```
---
to: "<%= projectName %>/backend/pyproject.toml"
---
<% if (pythonPkgManager === 'uv') { %>[project]
name = "<%= projectName %>-backend"
version = "0.1.0"
description = "<%= projectName %> backend API"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.111.0",
    "uvicorn[standard]>=0.30.0",
    "sqlalchemy[asyncio]>=2.0.31",
    "aiosqlite>=0.20.0",
    "pydantic-settings>=2.3.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.9",
    "alembic>=1.13.0",
]

[tool.ruff]
target-version = "py311"
line-length = 120

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]

[tool.mypy]
python_version = "3.11"
strict = true<% } else { %>[tool.poetry]
name = "<%= projectName %>-backend"
version = "0.1.0"
description = "<%= projectName %> backend API"
authors = []

[tool.poetry.dependencies]
python = "^3.11"
fastapi = ">=0.111.0"
uvicorn = {version = ">=0.30.0", extras = ["standard"]}
sqlalchemy = {version = ">=2.0.31", extras = ["asyncio"]}
aiosqlite = ">=0.20.0"
pydantic-settings = ">=2.3.0"
python-jose = {version = ">=3.3.0", extras = ["cryptography"]}
passlib = {version = ">=1.7.4", extras = ["bcrypt"]}
python-multipart = ">=0.0.9"
alembic = ">=1.13.0"

[tool.ruff]
target-version = "py311"
line-length = 120

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]

[tool.mypy]
python_version = "3.11"
strict = true<% } %>
```

`backend/Dockerfile.ejs`:
```
---
to: "<%= projectName %>/backend/Dockerfile"
---
FROM python:3.11-slim

WORKDIR /app

<% if (pythonPkgManager === 'uv') { %>COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY pyproject.toml .
RUN uv sync --no-dev

COPY . .

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]<% } else { %>RUN pip install poetry

COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false && poetry install --no-dev --no-interaction

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]<% } %>
```

`backend/.dockerignore.ejs`:
```
---
to: "<%= projectName %>/backend/.dockerignore"
---
__pycache__/
*.pyc
.venv/
tests/
*.egg-info/
.git/
.mypy_cache/
.ruff_cache/
```

- [ ] **Step 2: Create alembic configuration**

`backend/alembic.ini.ejs`:
```
---
to: "<%= projectName %>/backend/alembic.ini"
---
[alembic]
script_location = alembic
sqlalchemy.url = sqlite:///./<%= projectName %>.db

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

`backend/alembic/env.py.ejs`:
```
---
to: "<%= projectName %>/backend/alembic/env.py"
---
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.core.config import settings
from app.core.database import Base

config = context.config
config.set_main_option("sqlalchemy.url", str(settings.DATABASE_URL))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

- [ ] **Step 3: Create backend scripts and tests**

`backend/scripts/prestart.sh.ejs`:
```
---
to: "<%= projectName %>/backend/scripts/prestart.sh"
---
#!/usr/bin/env bash
set -euo pipefail

echo "Running prestart script..."
cd "$(dirname "$0")/.."
<% if (pythonPkgManager === 'uv') { %>uv run alembic upgrade head<% } else { %>poetry run alembic upgrade head<% } %>
echo "Prestart complete."
```

`backend/scripts/seed.py.ejs`:
```
---
to: "<%= projectName %>/backend/scripts/seed.py"
---
"""Seed the database with initial data."""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session


async def seed() -> None:
    async with async_session() as session:
        # Add seed data here
        await session.commit()
        print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
```

`backend/tests/conftest.py.ejs`:
```
---
to: "<%= projectName %>/backend/tests/conftest.py"
---
import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.database import Base
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def setup_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
```

- [ ] **Step 4: Create app/core/ files**

`backend/app/__init__.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/__init__.py"
---
```

`backend/app/main.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/main.py"
---
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.middleware.logging import add_request_logging
from app.modules.health.router import router as health_router

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware
add_request_logging(app)

# Exception handlers
register_exception_handlers(app)

# Routes
app.include_router(health_router, prefix="/api/v1", tags=["health"])


@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.APP_NAME} API"}
```

`backend/app/core/__init__.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/core/__init__.py"
---
```

`backend/app/core/config.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/core/config.py"
---
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "<%= projectName %>"
    APP_ENV: str = "development"
    DATABASE_URL: str = "sqlite+aiosqlite:///./<%= projectName %>.db"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
```

`backend/app/core/database.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/core/database.py"
---
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(str(settings.DATABASE_URL), echo=settings.APP_ENV == "development")
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session
```

`backend/app/core/security.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/core/security.py"
---
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
```

`backend/app/core/dependencies.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/core/dependencies.py"
---
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/users/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username
```

`backend/app/core/exceptions.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/core/exceptions.py"
---
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )
```

- [ ] **Step 5: Create app/modules/health/ (example domain module)**

`backend/app/modules/__init__.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/modules/__init__.py"
---
```

`backend/app/modules/health/__init__.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/modules/health/__init__.py"
---
```

`backend/app/modules/health/router.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/modules/health/router.py"
---
from fastapi import APIRouter
from app.modules.health.service import HealthService
from app.modules.health.schema import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return await HealthService.check()
```

`backend/app/modules/health/service.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/modules/health/service.py"
---
from app.modules.health.schema import HealthResponse


class HealthService:
    @staticmethod
    async def check() -> HealthResponse:
        return HealthResponse(status="ok")
```

`backend/app/modules/health/schema.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/modules/health/schema.py"
---
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
```

`backend/app/modules/health/model.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/modules/health/model.py"
---
# Health module has no database model.
# This file is kept as a placeholder to show the domain module pattern.
# Delete this file if your domain doesn't need a model.
```

- [ ] **Step 6: Create app/middleware/**

`backend/app/middleware/__init__.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/middleware/__init__.py"
---
```

`backend/app/middleware/logging.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/middleware/logging.py"
---
import time
import logging
from fastapi import FastAPI, Request

logger = logging.getLogger(__name__)


def add_request_logging(app: FastAPI) -> None:
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code} ({duration_ms:.1f}ms)"
        )
        return response
```

- [ ] **Step 7: Create remaining .gitkeep placeholders**

Create these `.gitkeep.ejs` files:
- `backend/alembic/versions/.gitkeep.ejs` → `to: "<%= projectName %>/backend/alembic/versions/.gitkeep"`
- `backend/tests/core/.gitkeep.ejs` → `to: "<%= projectName %>/backend/tests/core/.gitkeep"`
- `backend/tests/modules/.gitkeep.ejs` → `to: "<%= projectName %>/backend/tests/modules/.gitkeep"`

- [ ] **Step 8: Commit**

```bash
git add templates/_templates/react-fastapi/new/backend/
git commit -m "feat: add React+FastAPI backend base template with domain-modular architecture"
```

---

### Task 5: Create auth-jwt capability module

**Files:**
- Create: `templates/_templates/auth-jwt/new/react/components/LoginPage.tsx.ejs`
- Create: `templates/_templates/auth-jwt/new/react/components/RegisterPage.tsx.ejs`
- Create: `templates/_templates/auth-jwt/new/react/stores/authStore.ts.ejs`
- Create: `templates/_templates/auth-jwt/new/react/router/protected.tsx.ejs`
- Create: `templates/_templates/auth-jwt/new/react/types/auth.ts.ejs`
- Create: `templates/_templates/auth-jwt/new/fastapi/modules/users/__init__.py.ejs`
- Create: `templates/_templates/auth-jwt/new/fastapi/modules/users/router.py.ejs`
- Create: `templates/_templates/auth-jwt/new/fastapi/modules/users/service.py.ejs`
- Create: `templates/_templates/auth-jwt/new/fastapi/modules/users/schema.py.ejs`
- Create: `templates/_templates/auth-jwt/new/fastapi/modules/users/model.py.ejs`
- Create: `templates/_templates/auth-jwt/new/fastapi/core/security.py.ejs`
- Create: `templates/_templates/auth-jwt/new/fastapi/core/dependencies.py.ejs`
- Create: `templates/_templates/auth-jwt/new/fastapi/tests/modules/users/test_router.py.ejs`
- Create: `templates/_templates/auth-jwt/new/fastapi/tests/modules/users/test_service.py.ejs`

- [ ] **Step 1: Create React frontend auth files**

`react/types/auth.ts.ejs`:
```
---
to: "<%= projectName %>/frontend/src/types/auth.ts"
---
export interface User {
  id: string
  username: string
  email: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}
```

`react/stores/authStore.ts.ejs`:
```
---
to: "<%= projectName %>/frontend/src/stores/authStore.ts"
---
import { create } from 'zustand'
import type { User } from '@/types/auth'
import apiClient from '@/api/client'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (username, password) => {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    const { data } = await apiClient.post('/v1/users/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    localStorage.setItem('token', data.access_token)
    set({ token: data.access_token, isAuthenticated: true })
  },

  register: async (username, email, password) => {
    await apiClient.post('/v1/users/register', { username, email, password })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
```

`react/components/LoginPage.tsx.ejs`:
```
---
to: "<%= projectName %>/frontend/src/pages/LoginPage.tsx"
---
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
      navigate('/')
    } catch {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  )
}
```

`react/components/RegisterPage.tsx.ejs`:
```
---
to: "<%= projectName %>/frontend/src/pages/RegisterPage.tsx"
---
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(username, email, password)
      navigate('/login')
    } catch {
      setError('Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center">Register</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Register
        </button>
      </form>
    </div>
  )
}
```

`react/router/protected.tsx.ejs`:
```
---
to: "<%= projectName %>/frontend/src/router/protected.tsx"
---
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
```

- [ ] **Step 2: Create FastAPI backend auth (users domain module)**

`fastapi/modules/users/__init__.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/modules/users/__init__.py"
---
```

`fastapi/modules/users/model.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/modules/users/model.py"
---
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=True)
```

`fastapi/modules/users/schema.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/modules/users/schema.py"
---
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

`fastapi/modules/users/service.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/modules/users/service.py"
---
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exceptions import AppException
from app.modules.users.model import User
from app.modules.users.schema import UserRegister, Token


class UserService:
    @staticmethod
    async def register(db: AsyncSession, data: UserRegister) -> User:
        result = await db.execute(select(User).where(User.username == data.username))
        if result.scalar_one_or_none():
            raise AppException(status_code=400, detail="Username already registered")
        result = await db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise AppException(status_code=400, detail="Email already registered")
        user = User(
            username=data.username,
            email=data.email,
            hashed_password=get_password_hash(data.password),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def login(db: AsyncSession, username: str, password: str) -> Token:
        result = await db.execute(select(User).where(User.username == username))
        user = result.scalar_one_or_none()
        if not user or not verify_password(password, user.hashed_password):
            raise AppException(status_code=401, detail="Incorrect username or password")
        access_token = create_access_token(subject=user.username)
        return Token(access_token=access_token)
```

`fastapi/modules/users/router.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/modules/users/router.py"
---
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.users.schema import UserRegister, UserResponse, Token
from app.modules.users.service import UserService

router = APIRouter()


@router.post("/users/register", response_model=UserResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    user = await UserService.register(db, data)
    return user


@router.post("/users/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    return await UserService.login(db, form_data.username, form_data.password)
```

- [ ] **Step 3: Create auth test files**

`fastapi/tests/modules/users/test_router.py.ejs`:
```
---
to: "<%= projectName %>/backend/tests/modules/users/test_router.py"
---
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post(
        "/api/v1/users/register",
        json={"username": "testuser", "email": "test@example.com", "password": "secret123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"


@pytest.mark.asyncio
async def test_register_duplicate(client: AsyncClient):
    payload = {"username": "dup", "email": "dup@example.com", "password": "secret123"}
    await client.post("/api/v1/users/register", json=payload)
    response = await client.post("/api/v1/users/register", json=payload)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post(
        "/api/v1/users/register",
        json={"username": "loginuser", "email": "login@example.com", "password": "secret123"},
    )
    response = await client.post(
        "/api/v1/users/login",
        data={"username": "loginuser", "password": "secret123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
```

`fastapi/tests/modules/users/test_service.py.ejs`:
```
---
to: "<%= projectName %>/backend/tests/modules/users/test_service.py"
---
import pytest
from app.modules.users.service import UserService
from app.modules.users.schema import UserRegister


@pytest.mark.asyncio
async def test_register_user(db_session):
    data = UserRegister(username="svcuser", email="svc@example.com", password="secret123")
    user = await UserService.register(db_session, data)
    assert user.username == "svcuser"
    assert user.email == "svc@example.com"
```

- [ ] **Step 4: Commit**

```bash
git add templates/_templates/auth-jwt/
git commit -m "feat: add auth-jwt capability module (React frontend + FastAPI users domain)"
```

---

### Task 6: Create db-sqlite capability module

**Files:**
- Create: `templates/_templates/db-sqlite/new/fastapi/core/database.py.ejs`
- Create: `templates/_templates/db-sqlite/new/shared/.env.example.sqlite.ejs`

- [ ] **Step 1: Create SQLite database config**

This module overrides the base `database.py` with SQLite-specific configuration (already the default, but makes the choice explicit).

`fastapi/core/database.py.ejs`:
```
---
to: "<%= projectName %>/backend/app/core/database.py"
---
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(
    str(settings.DATABASE_URL),
    echo=settings.APP_ENV == "development",
    connect_args={"check_same_thread": False},  # SQLite-specific
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session
```

`shared/.env.example.sqlite.ejs`:
```
---
to: "<%= projectName %>/backend/.env.example"
---
# Database - SQLite
DATABASE_URL=sqlite+aiosqlite:///./<%= projectName %>.db
```

- [ ] **Step 2: Commit**

```bash
git add templates/_templates/db-sqlite/
git commit -m "feat: add db-sqlite capability module"
```

---

### Task 7: Create docker capability module

**Files:**
- Create: `templates/_templates/docker/new/shared/docker-compose.prod.yml.ejs`
- Create: `templates/_templates/docker/new/shared/Dockerfile.frontend.ejs`
- Create: `templates/_templates/docker/new/shared/Dockerfile.backend.ejs`

- [ ] **Step 1: Create production Docker configs**

These override/enhance the basic docker-compose.prod.yml from shared with proper multi-stage builds.

`shared/Dockerfile.frontend.ejs`:
```
---
to: "<%= projectName %>/docker/Dockerfile.frontend"
---
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

`shared/Dockerfile.backend.ejs`:
```
---
to: "<%= projectName %>/docker/Dockerfile.backend"
---
FROM python:3.11-slim AS build
WORKDIR /app
<% if (pythonPkgManager === 'uv') { %>COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
COPY backend/pyproject.toml .
RUN uv sync --no-dev --frozen
COPY backend/ .
<% } else { %>RUN pip install poetry
COPY backend/pyproject.toml backend/poetry.lock* ./
RUN poetry config virtualenvs.create false && poetry install --no-dev --no-interaction
COPY backend/ .
<% } %>
EXPOSE 8000
<% if (pythonPkgManager === 'uv') { %>CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]<% } else { %>CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]<% } %>
```

`shared/docker-compose.prod.yml.ejs`:
```
---
to: "<%= projectName %>/docker/docker-compose.prod.yml"
---
version: "3.8"

services:
  frontend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.frontend
    ports:
      - "3000:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:80"]
      interval: 30s
      timeout: 5s
      retries: 3

  backend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=production
      - DATABASE_URL=${DATABASE_URL:-sqlite+aiosqlite:///./<%= projectName %>.db}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')"]
      interval: 30s
      timeout: 5s
      retries: 3
```

- [ ] **Step 2: Commit**

```bash
git add templates/_templates/docker/
git commit -m "feat: add docker capability module with multi-stage builds and health checks"
```

---

### Task 8: Create lint capability module

**Files:**
- Create: `templates/_templates/lint/new/react/eslint.config.js.ejs`
- Create: `templates/_templates/lint/new/react/.prettierrc.ejs`
- Create: `templates/_templates/lint/new/react/.prettierignore.ejs`
- Create: `templates/_templates/lint/new/fastapi/.pre-commit-config.yaml.ejs`

- [ ] **Step 1: Create React lint config (overrides base with Prettier + Husky)**

`react/eslint.config.js.ejs`:
```
---
to: "<%= projectName %>/frontend/eslint.config.js"
---
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
```

`react/.prettierrc.ejs`:
```
---
to: "<%= projectName %>/frontend/.prettierrc"
---
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

`react/.prettierignore.ejs`:
```
---
to: "<%= projectName %>/frontend/.prettierignore"
---
dist
node_modules
```

- [ ] **Step 2: Create FastAPI pre-commit config**

`fastapi/.pre-commit-config.yaml.ejs`:
```
---
to: "<%= projectName %>/backend/.pre-commit-config.yaml"
---
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.5.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.10.1
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
```

- [ ] **Step 3: Commit**

```bash
git add templates/_templates/lint/
git commit -m "feat: add lint capability module (ESLint+Prettier for React, Ruff+mypy pre-commit for FastAPI)"
```

---

### Task 9: Wire up generators and verify end-to-end

**Files:**
- Modify: `templates/src/generators.js`
- Modify: `templates/bin/create-project.js`

- [ ] **Step 1: Update generators.js to handle Hygen properly**

The initial `generators.js` needs to be adjusted because Hygen expects to run from the target directory with templates specified. Update to use `hygen` correctly:

```javascript
// templates/src/generators.js
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '..', '_templates');

export async function runGenerators(answers) {
  const targetDir = path.resolve(answers.projectName);

  const baseArgs = buildArgs(answers);

  // 1. Generate shared files
  console.log('  Generating shared files...');
  runHygen('shared', 'new', targetDir, baseArgs);

  // 2. Generate base combo template
  console.log(`  Generating ${answers.combo} template...`);
  runHygen(answers.combo, 'new', targetDir, baseArgs);

  // 3. Generate selected capability modules
  for (const cap of answers.capabilities) {
    console.log(`  Generating capability: ${cap}...`);
    runHygen(cap, 'new', targetDir, baseArgs);
  }

  return targetDir;
}

function buildArgs(answers) {
  return [
    `--projectName=${answers.projectName}`,
    `--projectNamePascal=${answers.projectNamePascal}`,
    `--frontend=${answers.frontend}`,
    `--backend=${answers.backend}`,
    `--uiLibrary=${answers.uiLibrary}`,
    `--database=${answers.database}`,
    `--pythonPkgManager=${answers.pythonPkgManager || 'uv'}`,
    `--combo=${answers.combo}`,
  ];
}

function runHygen(generator, action, targetDir, args) {
  const cmd = [
    'npx',
    'hygen',
    generator,
    action,
    ...args,
  ].join(' ');

  try {
    execSync(cmd, {
      stdio: 'pipe',
      cwd: targetDir,
      env: {
        ...process.env,
        HYGEN_TMPLS: TEMPLATES_DIR,
        HYGEN_TARGET: targetDir,
      },
    });
  } catch (error) {
    console.error(`  Error generating ${generator}: ${error.message}`);
    throw error;
  }
}
```

- [ ] **Step 2: Update bin/create-project.js with post-generation steps**

```javascript
#!/usr/bin/env node
// templates/bin/create-project.js
import { runPrompts } from '../src/prompts.js';
import { runGenerators } from '../src/generators.js';
import { kebabToPascal } from '../src/utils.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function main() {
  console.log('\n  Project Template Generator\n');

  const answers = await runPrompts();
  answers.projectNamePascal = kebabToPascal(answers.projectName);

  // Create target directory
  const targetDir = path.resolve(answers.projectName);
  if (fs.existsSync(targetDir)) {
    console.error(`\n  Error: Directory "${answers.projectName}" already exists.`);
    process.exit(1);
  }
  fs.mkdirSync(targetDir, { recursive: true });

  console.log('\n  Generating project...\n');
  await runGenerators(answers);

  // Post-generation: make scripts executable
  const scriptDir = path.join(targetDir, 'script');
  if (fs.existsSync(scriptDir)) {
    execSync('chmod +x script/*.sh', { cwd: targetDir });
  }

  // Post-generation: install dependencies
  console.log('\n  Installing dependencies...');
  const frontendDir = path.join(targetDir, 'frontend');
  const backendDir = path.join(targetDir, 'backend');

  if (fs.existsSync(frontendDir)) {
    console.log('  Installing frontend dependencies...');
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
  }

  if (fs.existsSync(backendDir) && answers.backend === 'fastapi') {
    console.log('  Installing backend dependencies...');
    const cmd = answers.pythonPkgManager === 'uv' ? 'uv sync' : 'poetry install';
    try {
      execSync(cmd, { cwd: backendDir, stdio: 'inherit' });
    } catch {
      console.log('  Note: Backend install skipped (uv/poetry not available). Install manually later.');
    }
  }

  console.log(`\n  Project "${answers.projectName}" is ready!`);
  console.log(`\n  cd ${answers.projectName}`);
  console.log(`  cat README.md  # for next steps\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Run end-to-end test**

```bash
cd templates
npm install
node bin/create-project.js
```

When prompted, enter:
- Project name: `test-project`
- Frontend: React
- Backend: FastAPI (Python)
- Python package manager: uv
- UI: shadcn/ui + Tailwind CSS (default)
- Database: SQLite (default)
- Capabilities: all selected (auth-jwt, docker, lint)

Expected: A `test-project/` directory is created with the full structure matching the spec. Verify:

```bash
# Check key files exist
ls test-project/frontend/src/main.tsx
ls test-project/frontend/src/api/client.ts
ls test-project/frontend/src/router/index.tsx
ls test-project/backend/app/main.py
ls test-project/backend/app/core/config.py
ls test-project/backend/app/core/database.py
ls test-project/backend/app/core/security.py
ls test-project/backend/app/modules/health/router.py
ls test-project/backend/app/modules/users/router.py
ls test-project/docs/architecture.md
ls test-project/docker/docker-compose.local.yml
ls test-project/script/dev.sh
```

- [ ] **Step 4: Verify generated project builds**

```bash
cd test-project/frontend
npx tsc --noEmit
npm run build
```

Expected: TypeScript compiles without errors, Vite build succeeds.

- [ ] **Step 5: Verify backend starts**

```bash
cd test-project/backend
uv sync
uv run python -c "from app.main import app; print('OK')"
```

Expected: `OK` printed, no import errors.

- [ ] **Step 6: Clean up test project and commit**

```bash
rm -rf test-project
git add templates/
git commit -m "feat: wire up generators and add end-to-end generation flow"
```

---

## Self-Review

**1. Spec coverage:**
- React+FastAPI base template: Tasks 2, 3, 4
- auth-jwt capability: Task 5
- db-sqlite capability: Task 6
- docker capability: Task 7
- lint capability: Task 8
- CLI with inquirer prompts: Task 1
- Dynamic prompt options (backend by frontend, UI by frontend): Task 1 (prompts.js)
- Python package manager (uv/poetry): Task 1 (prompts.js), Task 4 (pyproject.toml.ejs)
- UI library selection: Task 1 (prompts.js) - actual UI lib files are Phase 3
- End-to-end verification: Task 9
- docs/, docker/, script/ top-level dirs: Task 2

**2. Placeholder scan:** No TBD, TODO, or "implement later" found. All code steps contain actual content.

**3. Type consistency:** `projectNamePascal` is computed in `create-project.js` and used consistently in templates. `pythonPkgManager` defaults to `'uv'` in both prompts and generators. All EJS variable names are consistent across templates.

**Gaps identified and fixed inline:**
- None found. All spec requirements map to tasks.
