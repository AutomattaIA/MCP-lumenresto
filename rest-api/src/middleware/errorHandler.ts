import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../types/index.js';

/**
 * Middleware centralizado para manejo de errores
 */
export function errorHandler(
  err: Error | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log del error
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Errores de validación Zod
  if (err instanceof ZodError) {
    const errorResponse: ApiError = {
      error: 'ValidationError',
      message: 'Error de validación en los datos enviados',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };

    res.status(400).json(errorResponse);
    return;
  }

  // Errores de Supabase
  if (err.message.includes('PGRST') || err.message.includes('PostgreSQL')) {
    const errorResponse: ApiError = {
      error: 'DatabaseError',
      message: 'Error al acceder a la base de datos',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    };

    res.status(500).json(errorResponse);
    return;
  }

  // Error genérico
  const errorResponse: ApiError = {
    error: 'InternalServerError',
    message: err.message || 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  res.status(500).json(errorResponse);
}

/**
 * Wrapper para rutas async que captura errores automáticamente
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

