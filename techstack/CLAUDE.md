# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TechStack Panorama is a tech stack visualization platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, and **Tailwind CSS 3.4**. It catalogs and visualizes frontend, backend, AI, infrastructure, and storage technologies with detailed info, scoring, and comparisons.

## Common Commands

```bash
bun run dev          # Start dev server on port 3888
bun run build        # Build production bundle
bun start            # Run production server
bun run lint         # ESLint check
bun run test         # Vitest watch mode
bun run test:run     # Vitest single run
bun run test:coverage # Coverage report
```

## Architecture

### Pages
Pages live under `src/app/` following Next.js App Router convention:
- `/` — Home page with module navigation cards
- `/frontend` — Frontend tech stack
- `/backend` — Unified backend entry with language tabs (Python/Go/Java/Rust/Node.js)
- `/backend/{lang}` — Per-language tech stack (e.g., `/backend/python`)
- `/ai-stack` — AI development stack
- `/infrastructure` — DevOps, CI/CD, cloud, monitoring
- `/storage` — Storage technologies (databases, caches, file storage, vector DBs)
- `/tech-stack` — Unified tech browse with filtering
- `/tech-stack/[id]` — Individual tech detail page
- `/tech-stack-all` — Comprehensive all-tech view with pagination
- `/tech-stack/archived` — Archived/deprecated tech

### Data Model
Tech data is defined in `src/data/tech/tech-database.ts` and structured around these types (defined in `src/data/tech/types.ts`):
- `TechDetail` — Complete tech info with id, category, subcategory, scores, deepDive content, and archive status
- `TechCategory` — Category card data (id, name, icon, color, problem, mainstream items)
- `TechItem` — Single tech with name, description, popularity (high/medium/rising)

Categories for `TechDetail.category` are: `'frontend' | 'backend' | 'ai' | 'infrastructure' | 'llm-algorithm' | 'llm-application' | 'storage'`

The `TechDetail.deepDive` field contains features, learning resources, best practices, comparisons, and use cases for detail pages.

### Components
- `src/components/tech/` — Tech-specific: `TechGrid`, `TechCard`, `TechCategoryCard`, `ScoreBadge`
- `src/components/ui/` — shadcn/ui components (49+): badge, button, card, dialog, tabs, table, toast, etc.
- `src/components/` — App-level: `sidebar`, `header`, `theme-provider`, `theme-toggle`, `error-boundary`

### Scoring System
`src/lib/scoring/` contains the scoring engine. `calculator.ts` computes tech scores, `config.ts` holds weights. Scores are attached to `TechDetail` via the `scores: TechScores` field.

### Key Libraries
- **State**: Zustand (global), TanStack Query (server state), React Hook Form (forms)
- **UI**: Radix UI primitives, shadcn/ui, Framer Motion (animations), Lucide icons
- **Data**: Prisma ORM (with `prisma/` schema), Zod validation
- **i18n**: next-intl (already installed but routes may not be fully localized)
