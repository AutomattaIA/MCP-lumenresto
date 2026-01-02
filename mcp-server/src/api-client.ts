import { config } from './config.js';

export interface CheckScheduleResponse {
  success: boolean;
  data: {
    available: boolean;
    time_slots: Array<{
      time: string;
      available: boolean;
    }>;
    message?: string;
  };
}

export interface CreateReservationResponse {
  success: boolean;
  data: {
    reservation_id: string;
    table_number: number;
    reservation_date: string;
    party_size: number;
    message: string;
  };
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}

/**
 * Cliente HTTP para comunicarse con Railway API
 */
class RailwayApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.railwayApiUrl;
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData: ApiErrorResponse;
      try {
        const json = await response.json();
        errorData = json as ApiErrorResponse;
      } catch {
        errorData = {
          error: 'UnknownError',
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    const json = await response.json();
    return json as T;
  }

  /**
   * Consulta horarios disponibles de un restaurante
   */
  async fetchSchedule(
    restaurantId: string,
    date: string
  ): Promise<CheckScheduleResponse> {
    return this.request<CheckScheduleResponse>('/api/check-schedule', {
      method: 'POST',
      body: JSON.stringify({
        restaurant_id: restaurantId,
        date,
      }),
    });
  }

  /**
   * Crea una nueva reserva
   */
  async createReservation(
    restaurantId: string,
    clientId: string,
    reservationDate: string,
    partySize: number,
    durationMinutes: number = 120
  ): Promise<CreateReservationResponse> {
    return this.request<CreateReservationResponse>('/api/create-reservation', {
      method: 'POST',
      body: JSON.stringify({
        restaurant_id: restaurantId,
        client_id: clientId,
        reservation_date: reservationDate,
        party_size: partySize,
        duration_minutes: durationMinutes,
      }),
    });
  }
}

export const apiClient = new RailwayApiClient();

