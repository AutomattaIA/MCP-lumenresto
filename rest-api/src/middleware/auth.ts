import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

/**
 * Middleware de autenticación que valida el header X-API-Key
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Header X-API-Key es requerido',
    });
    return;
  }

  if (typeof apiKey !== 'string' || apiKey !== config.api.key) {
    // Log intento fallido (sin exponer la key correcta)
    console.warn(`[AUTH] Intento de acceso fallido desde ${req.ip}`);
    
    res.status(401).json({
      error: 'Unauthorized',
      message: 'X-API-Key inválido',
    });
    return;
  }

  next();
}

