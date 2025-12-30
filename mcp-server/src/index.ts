#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { checkScheduleTool, handleCheckSchedule } from './tools/check-schedule.js';
import {
  createReservationTool,
  handleCreateReservation,
} from './tools/create-reservation.js';

/**
 * Servidor MCP para Lumen Resto
 * Expone tools para consultar horarios y crear reservas
 */
const server = new Server(
  {
    name: 'lumen-resto-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Registrar handlers para tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [checkScheduleTool, createReservationTool],
  };
});

// Registrar handlers para tools/call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'check_restaurant_schedule':
        if (!args || typeof args !== 'object') {
          throw new Error('Argumentos inválidos para check_restaurant_schedule');
        }
        const scheduleArgs = args as { restaurant_id: string; date: string };
        const scheduleResult = await handleCheckSchedule(scheduleArgs);
        return {
          content: [
            {
              type: 'text',
              text: scheduleResult,
            },
          ],
        };

      case 'create_reservation':
        if (!args || typeof args !== 'object') {
          throw new Error('Argumentos inválidos para create_reservation');
        }
        const reservationArgs = args as {
          restaurant_id: string;
          client_id: string;
          reservation_date: string;
          party_size: number;
          duration_minutes?: number;
        };
        const reservationResult = await handleCreateReservation(reservationArgs);
        return {
          content: [
            {
              type: 'text',
              text: reservationResult,
            },
          ],
        };

      default:
        throw new Error(`Tool desconocida: ${name}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return {
      content: [
        {
          type: 'text',
          text: `Error al ejecutar ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Iniciar servidor con transporte STDIO
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('✅ Lumen Resto MCP Server iniciado (STDIO)');
}

main().catch((error) => {
  console.error('❌ Error al iniciar servidor MCP:', error);
  process.exit(1);
});

