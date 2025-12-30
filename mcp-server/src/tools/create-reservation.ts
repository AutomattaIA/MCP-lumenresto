import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { apiClient } from '../api-client.js';

/**
 * Tool para crear una nueva reserva con asignación automática de mesa
 */
export const createReservationTool: Tool = {
  name: 'create_reservation',
  description:
    'Crea una nueva reserva en el restaurante con asignación automática de mesa. El sistema busca una mesa disponible que cumpla con la capacidad requerida y que no tenga conflictos de horario.',
  inputSchema: {
    type: 'object',
    properties: {
      restaurant_id: {
        type: 'string',
        description: 'UUID del restaurante',
      },
      client_id: {
        type: 'string',
        description: 'UUID del cliente',
      },
      reservation_date: {
        type: 'string',
        description: 'Fecha y hora de la reserva en formato ISO 8601 (ej: 2024-01-20T20:00:00.000Z)',
      },
      party_size: {
        type: 'number',
        description: 'Número de personas (1-50)',
        minimum: 1,
        maximum: 50,
      },
      duration_minutes: {
        type: 'number',
        description: 'Duración de la reserva en minutos (30-480). Por defecto: 120',
        minimum: 30,
        maximum: 480,
        default: 120,
      },
    },
    required: ['restaurant_id', 'client_id', 'reservation_date', 'party_size'],
  },
};

/**
 * Handler para la tool create_reservation
 */
export async function handleCreateReservation(args: {
  restaurant_id: string;
  client_id: string;
  reservation_date: string;
  party_size: number;
  duration_minutes?: number;
}): Promise<string> {
  try {
    const result = await apiClient.createReservation(
      args.restaurant_id,
      args.client_id,
      args.reservation_date,
      args.party_size,
      args.duration_minutes || 120
    );

    if (!result.success) {
      return 'Error al crear la reserva.';
    }

    // Retornar mensaje de confirmación
    return result.data.message || `Reserva creada exitosamente. ID: ${result.data.reservation_id}`;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return `Error al crear la reserva: ${errorMessage}`;
  }
}

