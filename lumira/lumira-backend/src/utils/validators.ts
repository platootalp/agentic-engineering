import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createHoldingSchema = z.object({
  fundId: z.string().length(6, 'Fund ID must be 6 characters'),
  totalShares: z.number().positive('Shares must be positive'),
  avgCost: z.number().positive('Average cost must be positive'),
  totalCost: z.number().positive('Total cost must be positive'),
  channel: z.string().optional(),
  group: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateHoldingSchema = z.object({
  totalShares: z.number().positive().optional(),
  avgCost: z.number().positive().optional(),
  totalCost: z.number().positive().optional(),
  channel: z.string().optional(),
  group: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const createTransactionSchema = z.object({
  holdingId: z.string(),
  fundId: z.string().length(6),
  type: z.enum(['BUY', 'SELL', 'DIVIDEND']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  shares: z.number().positive(),
  price: z.number().positive(),
  amount: z.number().positive(),
  fee: z.number().min(0),
  notes: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  shares: z.number().positive().optional(),
  price: z.number().positive().optional(),
  amount: z.number().positive().optional(),
  fee: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const timeRangeSchema = z.enum(['1m', '3m', '6m', '1y', 'ytd', 'all']);

export const fundSearchSchema = z.object({
  query: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateHoldingInput = z.infer<typeof createHoldingSchema>;
export type UpdateHoldingInput = z.infer<typeof updateHoldingSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
