# FRONTEND - React + TypeScript

**Stack:** React 18, TypeScript, Vite, TailwindCSS, shadcn/ui

---

## STRUCTURE

```
frontend/src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # LoginForm, RegisterForm
│   ├── jobs/            # JobCard, JobForm
│   ├── experiences/     # ExperienceForm
│   ├── resumes/         # TemplateSelector
│   └── common/          # Header, ProtectedRoute
├── pages/               # Route-based page components
│   ├── index.tsx        # Home
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── jobs/
│   ├── experiences/
│   └── resumes/
├── services/            # API clients (TanStack Query)
├── stores/              # Zustand state management
├── hooks/               # Custom React hooks
├── lib/
│   ├── validations/     # Zod schemas
│   └── utils.ts         # Utility functions
└── types/               # TypeScript interfaces
```

---

## WHERE TO LOOK

| Task | Location | Pattern |
|------|----------|---------|
| Add page | `pages/` | Export component, add to `App.tsx` routes |
| Add UI component | `components/ui/` | Use shadcn/ui CLI or copy pattern |
| Add feature component | `components/{feature}/` | Co-locate with related components |
| Add API hook | `services/` | TanStack Query with Axios |
| Add validation | `lib/validations/` | Zod schema |
| Add global state | `stores/` | Zustand store |

---

## CONVENTIONS

### Component Pattern
```typescript
// Function component with typed props
interface Props {
  title: string;
  onAction: () => void;
}

export function Component({ title, onAction }: Props) {
  return <div>{title}</div>;
}
```

### API Hook Pattern
```typescript
// services/api.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.get('/jobs').then(r => r.data),
  });
}
```

### Store Pattern
```typescript
// stores/auth.store.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### Form Pattern
```typescript
// lib/validations/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Component
const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
});
```

---

## TESTING

```bash
# Unit tests (Vitest)
npm run test
npm run test:coverage

# E2E tests (Playwright)
npm run test:e2e
npm run test:e2e:ui      # Interactive mode
```

**Test Patterns:**
- Component tests: `Component.test.tsx` co-located
- Hook tests: `hooks/useHook.test.tsx`
- E2E: `e2e/*.spec.ts` with page objects

---

## PATH ALIASES

```typescript
// tsconfig.json
"@/*": ["./src/*"]

// Usage
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
```
