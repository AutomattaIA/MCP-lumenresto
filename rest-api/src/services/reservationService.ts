import { supabase } from '../config/supabase.js';
import type { CreateReservationRequest, CreateReservationResponse, Table } from '../types/index.js';

/**
 * Servicio para crear reservas con asignación automática de mesa
 */
export async function createReservation(
  data: CreateReservationRequest
): Promise<CreateReservationResponse> {
  const { restaurant_id, client_id, reservation_date, party_size, duration_minutes } = data;

  // 1. Validar que el restaurante existe y está activo
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('id, name, is_active')
    .eq('id', restaurant_id)
    .single();

  if (restaurantError || !restaurant) {
    throw new Error(`Restaurante no encontrado: ${restaurant_id}`);
  }

  if (!restaurant.is_active) {
    throw new Error(`El restaurante ${restaurant.name} no está activo`);
  }

  // 2. Buscar mesa disponible
  const targetDate = new Date(reservation_date);
  const reservationEnd = new Date(targetDate);
  reservationEnd.setMinutes(reservationEnd.getMinutes() + duration_minutes);

  // Obtener todas las mesas del restaurante que cumplan capacidad
  const { data: tables, error: tablesError } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurant_id)
    .eq('is_active', true)
    .gte('capacity', party_size)
    .order('capacity', { ascending: true }); // Preferir mesas más pequeñas

  if (tablesError) {
    throw new Error(`Error al buscar mesas: ${tablesError.message}`);
  }

  if (!tables || tables.length === 0) {
    throw new Error(`No hay mesas disponibles con capacidad para ${party_size} personas`);
  }

  // 3. Verificar disponibilidad de cada mesa (no debe tener reservas solapadas)
  const { data: conflictingReservations, error: reservationsError } = await supabase
    .from('reservations')
    .select('table_id, reservation_date, duration_minutes')
    .eq('restaurant_id', restaurant_id)
    .in('table_id', tables.map((t) => t.id))
    .in('status', ['pending', 'confirmed'])
    .gte('reservation_date', new Date(targetDate.getTime() - 24 * 60 * 60 * 1000).toISOString()) // Desde 24h antes
    .lte('reservation_date', reservationEnd.toISOString());

  if (reservationsError) {
    throw new Error(`Error al verificar disponibilidad: ${reservationsError.message}`);
  }

  // Encontrar primera mesa sin conflictos
  let availableTable: Table | null = null;

  for (const table of tables) {
    const hasConflict = conflictingReservations?.some((reservation) => {
      if (reservation.table_id !== table.id) return false;

      const resStart = new Date(reservation.reservation_date);
      const resEnd = new Date(resStart);
      resEnd.setMinutes(resEnd.getMinutes() + reservation.duration_minutes);

      // Hay conflicto si los intervalos se solapan
      return targetDate < resEnd && reservationEnd > resStart;
    });

    if (!hasConflict) {
      availableTable = table as Table;
      break;
    }
  }

  if (!availableTable) {
    throw new Error('No hay mesas disponibles para el horario solicitado');
  }

  // 4. Crear la reserva
  const { data: reservation, error: createError } = await supabase
    .from('reservations')
    .insert({
      restaurant_id,
      client_id,
      table_id: availableTable.id,
      reservation_date: reservation_date,
      party_size,
      duration_minutes,
      status: 'confirmed',
    })
    .select('id, reservation_date, party_size')
    .single();

  if (createError || !reservation) {
    throw new Error(`Error al crear reserva: ${createError?.message || 'Error desconocido'}`);
  }

  // 5. Formatear respuesta
  const formattedDate = new Date(reservation.reservation_date).toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `Reserva confirmada para ${reservation.party_size} persona${reservation.party_size > 1 ? 's' : ''} en la mesa ${availableTable.table_number} el ${formattedDate}`;

  return {
    reservation_id: reservation.id,
    table_number: availableTable.table_number,
    reservation_date: reservation.reservation_date,
    party_size: reservation.party_size,
    message,
  };
}

