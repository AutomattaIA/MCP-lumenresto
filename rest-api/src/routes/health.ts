import { Router, Request, Response } from 'express';
import { checkSupabaseConnection } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * GET /health
 * Health check endpoint para Railway y monitoreo
 */
router.get(
  '/health',
  asyncHandler(async (_req: Request, res: Response) => {
    const dbHealthy = await checkSupabaseConnection();

    const health = {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
      },
    };

    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(health);
  })
);

export default router;

