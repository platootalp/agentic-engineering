# Lib - Core Utilities

**Scope**: Shared utilities, API clients, database layer, and external integrations.

## Overview

7 core modules providing cross-cutting functionality for the entire frontend.

## Module Reference

| File | Purpose | Key Exports |
|------|---------|-------------|
| `utils.ts` | General utilities | `cn()`, `formatNumber()`, `debounce()`, `throttle()` |
| `api-client.ts` | HTTP client | `ApiClient` class, `ApiError` |
| `api.ts` | Domain APIs | `authApi`, `holdingsApi`, `transactionsApi`, `portfolioApi` |
| `db.ts` | IndexedDB layer | `db` instance, `fundDb`, `holdingDb`, `transactionDb` |
| `calculate.ts` | Financial math | XIRR, Sharpe ratio, max drawdown |
| `eastmoney-api.ts` | Fund data API | Search, estimates, NAV history |
| `eastmoney-ranking-api.ts` | Rankings API | Top gainers/losers |

## Key Patterns

### 1. cn() - Tailwind Class Merging
```typescript
import { cn } from "@/lib/utils";

// Use for all conditional classes
className={cn(
  "base-classes",
  condition && "conditional-class",
  className // allow override
)}
```

### 2. API Client Pattern
```typescript
// api-client.ts - Low-level HTTP
class ApiClient {
  async get<T>(path: string): Promise<T>;
  async post<T>(path: string, body: unknown): Promise<T>;
}

// api.ts - Domain modules
export const holdingsApi = {
  getAll: () => apiClient.get<Holding[]>('/holdings'),
  create: (data) => apiClient.post<Holding>('/holdings', data),
};
```

### 3. IndexedDB (Dexie) Pattern
```typescript
// Define schema
class LumiraDatabase extends Dexie {
  funds!: Table<Fund, string>;
  holdings!: Table<Holding, string>;
}

// CRUD operations
export const holdingDb = {
  getAll: () => db.holdings.toArray(),
  add: (data) => db.holdings.add({ ...data, createdAt: new Date() }),
  update: (id, data) => db.holdings.update(id, data),
  delete: (id) => db.holdings.delete(id),
};
```

### 4. Number Formatting
```typescript
// Always use Chinese locale for financial data
formatNumber(12345.67, 2); // "12,345.67"
```

## Fund-Specific Utilities

### Trading Time Checks
```typescript
isTradingDay(date);    // Monday-Friday
isTradingHours(date);  // 9:30-11:30, 13:00-15:00 (China market)
```

### Cache TTL
- Estimates: 30 seconds (`NEXT_PUBLIC_ESTIMATE_CACHE_TTL`)
- Search: 5 minutes (`NEXT_PUBLIC_SEARCH_CACHE_TTL`)

## Anti-Patterns

- ❌ Don't use `any` type (use `unknown` with guards)
- ❌ Don't call APIs directly (use api modules)
- ❌ Don't access IndexedDB directly (use db helpers)
- ❌ Don't use `console.log` (use proper error handling)
