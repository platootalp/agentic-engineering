import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: _req.path,
    method: _req.method,
  });

  if (error instanceof ZodError) {
    return res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        '请求数据验证失败',
        error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }))
      )
    );
  }

  if (error.message === 'User already exists') {
    return res.status(409).json(errorResponse('CONFLICT', '用户已存在'));
  }

  if (error.message === 'Invalid credentials') {
    return res.status(401).json(errorResponse('UNAUTHORIZED', '密码错误'));
  }

  // 登录时用户不存在
  if (error.message === 'User not found' && _req.path === '/api/auth/login') {
    return res.status(401).json(errorResponse('USER_NOT_FOUND', '该邮箱尚未注册，请先注册'));
  }

  // 获取当前用户时用户不存在（Token 有效但用户被删除）
  if (error.message === 'User not found' && _req.path === '/api/auth/me') {
    return res.status(401).json(errorResponse('UNAUTHORIZED', '登录已过期，请重新登录'));
  }

  if (error.message === 'Holding not found' || error.message === 'Fund not found') {
    return res.status(404).json(errorResponse('NOT_FOUND', '未找到相关数据'));
  }

  if (error.message === 'Holding already exists for this fund') {
    return res.status(409).json(errorResponse('CONFLICT', '该基金持仓已存在'));
  }

  if (error.message === 'Access token is required') {
    return res.status(401).json(errorResponse('UNAUTHORIZED', '请先登录'));
  }

  if (error.message === 'Invalid or expired token') {
    return res.status(401).json(errorResponse('UNAUTHORIZED', '登录已过期，请重新登录'));
  }

  return res.status(500).json(
    errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试')
  );
}
