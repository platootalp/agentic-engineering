# AGENTS.md - TechStack Panorama

**Generated:** 2026-02-22
**Commit:** (auto-generated)
**Branch:** main

Guidelines for agentic coding agents working in this repository.

## OVERVIEW

TechStack Panorama (技术栈全景图) - A modern full-stack tech stack visualization platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Uses shadcn/ui component library with 49 components.

## STRUCTURE

```
./
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── ai-stack/     # AI development stack
│   │   ├── backend/      # Backend tech (Python/Go/Java/Rust/Node.js)
│   │   ├── frontend/     # Frontend tech stack
│   │   ├── infrastructure/# DevOps & infrastructure
│   │   ├── tech-stack/   # Unified tech stack browser
│   │   └── tech-stack-all/# All technologies view
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components (49 total)
│   │   ├── sidebar.tsx  # Navigation sidebar
│   │   ├── header.tsx   # Top header with theme toggle
│   │   ├── theme-provider.tsx  # Theme context provider
│   │   ├── theme-toggle.tsx    # Light/dark mode toggle
│   │   └── error-boundary.tsx  # Error handling
│   ├── data/            # Static data and types
│   │   └── tech/        # Tech stack data files
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   └── test/            # Test setup and utilities
├── editor/              # LeetCode editor module (separate)
├── docs/                # Documentation and plans
├── prisma/              # Database schema
└── public/              # Static assets
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/Modify UI components | `src/components/ui/` | shadcn/ui components |
| Add new page | `src/app/[route]/page.tsx` | Follow existing patterns |
| Add tech data | `src/data/tech/` | See types.ts for schema |
| Custom hooks | `src/hooks/` | Use kebab-case naming |
| Utilities | `src/lib/` | Shared helper functions |
| LeetCode content | `editor/cn/` | Separate module |
| Theme/Colors | `src/app/globals.css` | CSS variables for theming |

## COMMANDS

```bash
# Development (runs on port 3888)
bun run dev

# Build for production (outputs standalone to .next/standalone/)
bun run build

# Start production server
bun start

# Lint code with ESLint
bun run lint

# Run tests
bun run test           # Run tests in watch mode
bun run test:run       # Run tests once
bun run test:coverage  # Run tests with coverage

# Database operations (Prisma)
bun run db:push      # Push schema changes
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run db:reset     # Reset database
```

**Note**: Vitest is configured for testing. See `vitest.config.ts` for configuration.

## CONVENTIONS

### Imports & Path Aliases
- Use `@/*` alias for imports from `src/` (configured in tsconfig.json)
- Import order: React/Next → External libs → Internal components → Types
- Example: `import { Button } from '@/components/ui/button'`

### Component Structure
- **Server Components** (default): No directive needed, use for static content
- **Client Components**: Add `'use client'` at the top for interactive components
- Use `memo()` for expensive components that receive stable props
- Use `displayName` on memoized components for debugging

### Naming Conventions
- **Components**: PascalCase (e.g., `TechCard.tsx`, `Sidebar.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `use-mobile.ts`, `use-toast.ts`)
- **Utils**: camelCase (e.g., `utils.ts`, `db.ts`)
- **Types/Interfaces**: PascalCase, prefer interfaces over type aliases
- **Files**: kebab-case for non-component files (e.g., `error-boundary.tsx`)

### Styling (Tailwind CSS)
- Use Tailwind utility classes exclusively
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Colors: Use CSS variables (e.g., `bg-primary`, `text-foreground`)
- Dark mode: Use `dark:` prefix for dark-specific styles
- Gradient theme: Blue-Purple-Pink gradients for visual accents

### TypeScript
- Strict mode enabled but `noImplicitAny: false`
- Always define prop interfaces explicitly
- Use `React.ComponentProps<"element">` for HTML element extensions
- Prefer explicit return types on exported functions

### Error Handling
- Use Error Boundary for React component errors (see `error-boundary.tsx`)
- Wrap async operations in try-catch with user-friendly error messages
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe access

### shadcn/ui Patterns
- Components are in `/src/components/ui/`
- Use `cva` (class-variance-authority) for component variants
- Extend components via props, not by modifying source
- Import Radix primitives via shadcn components

### Data Patterns
- Static data: Define in page files or `/src/data/tech/`
- Types: Define in `/src/data/tech/types.ts`
- Use Chinese for UI text, English for code/comments

### Theme System
- Theme provider wraps the app in `layout.tsx`
- Supports `light`, `dark`, and `system` modes
- CSS variables defined in `globals.css`
- Use `next-themes` for theme management

## ANTI-PATTERNS (THIS PROJECT)

- **Never modify shadcn/ui source directly** - Extend via props instead
- **No custom ESLint/Prettier configs** - Uses defaults only
- **Don't use `as any` or `@ts-ignore`** - Fix types properly
- **Avoid empty catch blocks** - Always handle errors meaningfully

## Dependencies to Know

### Core
- **Framework**: next, react, react-dom
- **Language**: typescript
- **Styling**: tailwindcss, tailwind-merge, clsx

### UI
- **Components**: @radix-ui/*, shadcn/ui
- **Icons**: lucide-react
- **Animation**: framer-motion
- **Charts**: recharts

### State & Data
- **State**: zustand
- **Query**: @tanstack/react-query, @tanstack/react-table
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **Database**: prisma, @prisma/client

### Additional Features
- **Auth**: next-auth
- **i18n**: next-intl
- **Drag & Drop**: @dnd-kit/*
- **Editor**: @mdxeditor/editor
- **Markdown**: react-markdown, react-syntax-highlighter

### Testing
- **Runner**: vitest
- **React Testing**: @testing-library/react, @testing-library/jest-dom
- **Environment**: jsdom
- **Coverage**: @vitest/coverage-v8

## ESLint Configuration

Uses `eslint-config-next` with Next.js recommended rules. Run `bun run lint` before committing.

## Testing Guidelines

- Tests located in `src/**/*.test.ts` or `src/**/*.spec.ts`
- Test setup in `src/test/setup.ts`
- Use `@testing-library/react` for component tests
- Coverage excludes: node_modules, test files, config files, page/layout files
