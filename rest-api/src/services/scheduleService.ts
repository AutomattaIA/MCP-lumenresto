import { supabase } from '../config/supabase.js';
import type { TimeSlot, CheckScheduleResponse } from '../types/index.js';

/**
 * Servicio para consultar horarios disponibles de un restaurante
 */
export async function checkRestaurantSchedule(
  restaurantId: string,
  date: string
): Promise<CheckScheduleResponse> {
  // Parsear fecha
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay(); // 0-6 (Sunday-Saturday)

  // 1. Verificar que el restaurante existe y está activo
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('id, name, is_active')
    .eq('id', restaurantId)
    .single();

  if (restaurantError || !restaurant) {
    throw new Error(`Restaurante no encontrado: ${restaurantId}`);
  }

  if (!restaurant.is_active) {
    throw new Error(`El restaurante ${restaurant.name} no está activo`);
  }

  // 2. Obtener horarios de negocio para el día de la semana
  const { data: businessHours, error: hoursError } = await supabase
    .from('business_hours')
    .select('open_time, close_time, is_closed')
    .eq('restaurant_id', restaurantId)
    .eq('day_of_week', dayOfWeek)
    .single();

  if (hoursError || !businessHours) {
    throw new Error('Horarios de negocio no configurados para este día');
  }

  if (businessHours.is_closed) {
    return {
      available: false,
      time_slots: [],
      message: 'El restaurante está cerrado este día',
    };
  }

  // 3. Obtener reservas existentes para la fecha
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: existingReservations, error: reservationsError } = await supabase
    .from('reservations')
    .select('reservation_date, duration_minutes')
    .eq('restaurant_id', restaurantId)
    .gte('reservation_date', startOfDay.toISOString())
    .lte('reservation_date', endOfDay.toISOString())
    .in('status', ['pending', 'confirmed']);

  if (reservationsError) {
    throw new Error(`Error al consultar reservas: ${reservationsError.message}`);
  }

  // 4. Calcular slots disponibles
  const timeSlots = generateTimeSlots(
    businessHours.open_time,
    businessHours.close_time,
    targetDate,
    existingReservations || []
  );

  const available = timeSlots.some((slot) => slot.available);
  
  let message = '';
  if (available) {
    const availableCount = timeSlots.filter((s) => s.available).length;
    const times = timeSlots
      .filter((s) => s.available)
      .map((s) => new Date(s.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }))
      .slice(0, 5)
      .join(', ');
    message = `Encontré ${availableCount} horario${availableCount > 1 ? 's' : ''} disponible${availableCount > 1 ? 's' : ''}: ${times}${availableCount > 5 ? ' y más' : ''}`;
  } else {
    message = 'No hay horarios disponibles para esta fecha';
  }

  return {
    available,
    time_slots: timeSlots,
    message,
  };
}

/**
 * Genera slots de tiempo disponibles considerando reservas existentes
 */
function generateTimeSlots(
  openTime: string,
  closeTime: string,
  date: Date,
  existingReservations: Array<{ reservation_date: string; duration_minutes: number }>
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const slotInterval = 30; // Intervalo de 30 minutos entre slots

  // Parsear horarios de apertura y cierre
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  const startTime = new Date(date);
  startTime.setHours(openHour, openMinute, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(closeHour, closeMinute, 0, 0);

  // Crear slots cada 30 minutos
  let currentTime = new Date(startTime);
  while (currentTime < endTime) {
    const slotEndTime = new Date(currentTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + 120); // Duración típica: 2 horas

    // Verificar si hay conflicto con reservas existentes
    const hasConflict = existingReservations.some((reservation) => {
      const resStart = new Date(reservation.reservation_date);
      const resEnd = new Date(resStart);
      resEnd.setMinutes(resEnd.getMinutes() + reservation.duration_minutes);

      // Hay conflicto si los intervalos se solapan
      return currentTime < resEnd && slotEndTime > resStart;
    });

    slots.push({
      time: currentTime.toISOString(),
      available: !hasConflict,
    });

    currentTime = new Date(currentTime);
    currentTime.setMinutes(currentTime.getMinutes() + slotInterval);
  }

  return slots;
}

