# Lumira Backend

**Scope**: Express API server with Prisma ORM and PostgreSQL.

## Overview

RESTful API for fund portfolio management. Layered architecture: Routes → Controllers → Services → Prisma.

## Structure

```
src/
├── app.ts              # Express entry, middleware chain
├── config/             # Database, Redis, env
├── controllers/        # Request handlers (5 controllers)
├── middleware/         # Auth, error, rate limiting
├── routes/             # Route definitions
├── services/           # Business logic + external APIs
└── utils/              # Logger, response helpers, validators
```

## Layer Patterns

### 1. Routes (`routes/*.routes.ts`)
```typescript
import { Router } from 'express';
import { holdingController } from '../controllers/holding.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, holdingController.getAll);
router.post('/', authenticate, holdingController.create);

export default router;
```

### 2. Controllers (`controllers/*.controller.ts`)
```typescript
export class HoldingController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const holdings = await holdingService.getAll(req.user.id);
      res.json(successResponse(holdings));
    } catch (error) {
      next(error); // Pass to error middleware
    }
  }
}

export const holdingController = new HoldingController();
```

### 3. Services (`services/*.service.ts`)
```typescript
export class HoldingService {
  async getAll(userId: string): Promise<Holding[]> {
    return prisma.holding.findMany({ where: { userId } });
  }
}

export const holdingService = new HoldingService();
```

### 4. Response Format
```typescript
// Success
{ data: T, meta?: object }

// Error
{ error: string, message: string, details?: object }
```

## Key Conventions

| Aspect | Pattern |
|--------|---------|
| **Path aliases** | `@config/*`, `@controllers/*`, `@services/*`, etc. |
| **Error handling** | Always `try/catch` + `next(error)` |
| **Validation** | Zod schemas in `utils/validators.ts` |
| **Auth** | JWT middleware sets `req.user` |
| **Logging** | Winston logger (utils/logger.ts) |
| **Caching** | Redis with TTL constants |

## Database (Prisma)

### Key Models
- `Fund` - Fund metadata + NAV history
- `Holding` - User positions
- `Transaction` - Buy/sell records
- `User` - Authentication

### Enums
```typescript
FundType: STOCK | BOND | MIX | INDEX | QDII | FOF | MONEY
RiskLevel: LOW | LOW_MEDIUM | MEDIUM | MEDIUM_HIGH | HIGH
TransactionType: BUY | SELL | DIVIDEND
```

### Decimal Precision
- NAV: `Decimal(10, 4)`
- Amount: `Decimal(15, 2)`
- Shares: `Decimal(15, 4)`

## External Integration

**EastMoney Service** (`services/external/eastmoney.service.ts`)
- Search funds
- Real-time estimates
- NAV history
- Fund details

## Commands

```bash
npm run dev          # tsx watch (port 3001)
npm run build        # tsc compile
npm run db:migrate   # Prisma migrate dev
npm run db:generate  # Generate Prisma client
npm run db:studio    # Prisma Studio GUI
```

## Anti-Patterns

- ❌ Don't use `any` type
- ❌ Don't access prisma directly from controllers
- ❌ Don't send raw errors to client (use error middleware)
- ❌ Don't forget `await` on async operations
