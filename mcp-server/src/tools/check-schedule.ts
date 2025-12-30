import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { apiClient } from '../api-client.js';

/**
 * Tool para consultar horarios disponibles de un restaurante
 */
export const checkScheduleTool: Tool = {
  name: 'check_restaurant_schedule',
  description:
    'Consulta los horarios disponibles de un restaurante para una fecha específica. Retorna información sobre slots de tiempo disponibles y mensaje descriptivo.',
  inputSchema: {
    type: 'object',
    properties: {
      restaurant_id: {
        type: 'string',
        description: 'UUID del restaurante',
      },
      date: {
        type: 'string',
        description: 'Fecha en formato ISO 8601 (ej: 2024-01-20T19:00:00.000Z)',
      },
    },
    required: ['restaurant_id', 'date'],
  },
};

/**
 * Handler para la tool check_restaurant_schedule
 */
export async function handleCheckSchedule(
  args: { restaurant_id: string; date: string }
): Promise<string> {
  try {
    const result = await apiClient.fetchSchedule(args.restaurant_id, args.date);

    if (!result.success) {
      return 'Error al consultar horarios disponibles.';
    }

    const { available, time_slots, message } = result.data;

    if (!available) {
      return message || 'No hay horarios disponibles para la fecha solicitada.';
    }

    // Formatear respuesta para el LLM
    const availableSlots = time_slots.filter((slot) => slot.available);
    const slotTimes = availableSlots
      .slice(0, 10) // Limitar a 10 slots para no saturar el contexto
      .map((slot) => {
        const date = new Date(slot.time);
        return date.toLocaleString('es-ES', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      })
      .join(', ');

    return `${message}\n\nHorarios disponibles: ${slotTimes}${
      availableSlots.length > 10 ? ` (y ${availableSlots.length - 10} más)` : ''
    }`;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return `Error al consultar horarios: ${errorMessage}`;
  }
}

