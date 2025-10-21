/**
 * Servicio API para Tracks de Gestión de Deudores
 */

import { CreateTrackPayload, CreateTrackResponse } from "../types/track";

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
