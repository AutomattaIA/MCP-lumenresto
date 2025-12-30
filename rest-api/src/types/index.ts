import { z } from 'zod';

// ============================================
// Zod Schemas
// ============================================

export const CheckScheduleRequestSchema = z.object({
  restaurant_id: z.string().uuid('restaurant_id debe ser un UUID válido'),
  date: z.string().datetime('date debe estar en formato ISO 8601'),
});

export const CreateReservationRequestSchema = z.object({
  restaurant_id: z.string().uuid('restaurant_id debe ser un UUID válido'),
  client_id: z.string().uuid('client_id debe ser un UUID válido'),
  reservation_date: z.string().datetime('reservation_date debe estar en formato ISO 8601'),
  party_size: z.number().int().min(1, 'party_size debe ser al menos 1').max(50, 'party_size no puede exceder 50'),
  duration_minutes: z.number().int().min(30, 'duration_minutes mínimo es 30').max(480, 'duration_minutes máximo es 480').default(120),
});

// ============================================
// TypeScript Types
// ============================================

export type CheckScheduleRequest = z.infer<typeof CheckScheduleRequestSchema>;
export type CreateReservationRequest = z.infer<typeof CreateReservationRequestSchema>;

export interface Restaurant {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface BusinessHours {
  id: string;
  restaurant_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  open_time: string; // HH:mm format
  close_time: string; // HH:mm format
  is_closed: boolean;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: number;
  capacity: number;
  is_active: boolean;
  created_at: string;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  client_id: string;
  table_id: string;
  reservation_date: string;
  party_size: number;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  time: string; // ISO 8601 datetime
  available: boolean;
}

export interface CheckScheduleResponse {
  available: boolean;
  time_slots: TimeSlot[];
  message?: string;
}

export interface CreateReservationResponse {
  reservation_id: string;
  table_number: number;
  reservation_date: string;
  party_size: number;
  message: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

