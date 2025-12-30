import { Router, Response } from 'express';
import { validateBody } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { CreateReservationRequestSchema } from '../types/index.js';
import { createReservation } from '../services/reservationService.js';
import type { ApiSuccess, CreateReservationResponse } from '../types/index.js';

const router = Router();

/**
 * POST /api/create-reservation
 * Crea una nueva reserva con asignación automática de mesa
 */
router.post(
  '/create-reservation',
  validateBody(CreateReservationRequestSchema),
  asyncHandler(async (req, res: Response) => {
    const reservationData = req.body;

    const reservation = await createReservation(reservationData);

    const response: ApiSuccess<CreateReservationResponse> = {
      success: true,
      data: reservation,
    };

    res.status(201).json(response);
  })
);

export default router;

