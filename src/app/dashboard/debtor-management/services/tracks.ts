/**
 * Servicio API para Tracks de Gestión de Deudores
 */

import { CreateTrackPayload, CreateTrackResponse } from "../types/track";
import { DebtorTracksResponse, DebtorTracksParams } from "../types/debtor-tracks";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Crea un nuevo track de gestión
 *
 * @param accessToken - Token de autenticación
 * @param clientId - ID del cliente
 * @param payload - Datos del track a crear
 * @returns Respuesta con el track creado y las transiciones de fase
 */
export async function createTrack(
  accessToken: string,
  clientId: string,
  payload: CreateTrackPayload
): Promise<CreateTrackResponse> {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/managements/tracks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error al crear track: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Crea múltiples tracks de forma secuencial
 *
 * @param accessToken - Token de autenticación
 * @param clientId - ID del cliente
 * @param payloads - Array de payloads a crear
 * @returns Array de respuestas con los tracks creados
 */
export async function createMultipleTracks(
  accessToken: string,
  clientId: string,
  payloads: CreateTrackPayload[]
): Promise<CreateTrackResponse[]> {
  const results: CreateTrackResponse[] = [];
  const errors: { index: number; error: Error }[] = [];

  // Crear tracks secuencialmente (uno a uno)
  for (let i = 0; i < payloads.length; i++) {
    try {
      const result = await createTrack(accessToken, clientId, payloads[i]);
      results.push(result);
    } catch (error) {
      console.error(`Error al crear track ${i + 1}:`, error);
      errors.push({ index: i, error: error as Error });
    }
  }

  // Si hubo errores, lanzar excepción con detalles
  if (errors.length > 0) {
    throw new Error(
      `Se crearon ${results.length} de ${payloads.length} tracks. Errores: ${errors
        .map((e) => `Track ${e.index + 1}: ${e.error.message}`)
        .join(", ")}`
    );
  }

  return results;
}

/**
 * Obtiene todos los tracks de un deudor con paginación y filtros
 *
 * @param accessToken - Token de autenticación
 * @param clientId - ID del cliente
 * @param debtorId - ID del deudor
 * @param params - Parámetros de paginación y filtros
 * @param params.page - Número de página (default: 1)
 * @param params.limit - Cantidad de registros por página (default: 10)
 * @param params.status - Filtrar por estado (ej: COMPLETED)
 * @param params.type - Filtrar por tipo de gestión (ej: CALL)
 * @param params.result - Filtrar por resultado (ej: PROMISED_PAYMENT)
 * @param params.executive_id - Filtrar por ID del ejecutivo
 * @param params.contact_date_from - Fecha desde (formato: YYYY-MM-DD)
 * @param params.contact_date_to - Fecha hasta (formato: YYYY-MM-DD)
 * @returns Respuesta con los tracks del deudor y metadata de paginación
 */
export async function getDebtorTracks(
  accessToken: string,
  clientId: string,
  debtorId: string,
  params: DebtorTracksParams = { page: 1, limit: 10 }
): Promise<DebtorTracksResponse> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  if (params.status) queryParams.append("status", params.status);
  if (params.type) queryParams.append("type", params.type);
  if (params.result) queryParams.append("result", params.result);
  if (params.executive_id) queryParams.append("executive_id", params.executive_id);
  if (params.contact_date_from) queryParams.append("contact_date_from", params.contact_date_from);
  if (params.contact_date_to) queryParams.append("contact_date_to", params.contact_date_to);

  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/managements/tracks/debtor/${debtorId}?${queryParams}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error al obtener tracks del deudor: ${response.statusText}`
    );
  }

  return response.json();
}
