import { Router, Response } from 'express';
import { validateBody } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { CheckScheduleRequestSchema } from '../types/index.js';
import { checkRestaurantSchedule } from '../services/scheduleService.js';
import type { ApiSuccess, CheckScheduleResponse } from '../types/index.js';

const router = Router();

/**
 * POST /api/check-schedule
 * Consulta los horarios disponibles de un restaurante para una fecha
 */
router.post(
  '/check-schedule',
  validateBody(CheckScheduleRequestSchema),
  asyncHandler(async (req, res: Response) => {
    const { restaurant_id, date } = req.body;

    const schedule = await checkRestaurantSchedule(restaurant_id, date);

    const response: ApiSuccess<CheckScheduleResponse> = {
      success: true,
      data: schedule,
    };

    res.json(response);
  })
);

export default router;

