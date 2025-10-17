import {
  CollectorQuadrantsParams,
  CollectorQuadrantsResponse,
  ManagementIndicators,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getCollectorQuadrants = async (
  accessToken: string,
  clientId: string,
  params?: CollectorQuadrantsParams
): Promise<CollectorQuadrantsResponse> => {
  try {
    const queryParams: Record<string, string> = {};

    // Agregar parámetros opcionales solo si están definidos
    if (params?.quadrant !== undefined && params.quadrant !== null) {
      queryParams.quadrant = params.quadrant;
    }
    if (params?.search !== undefined && params.search !== null) {
      queryParams.search = params.search;
    }
    if (params?.page !== undefined && params.page !== null) {
      queryParams.page = params.page.toString();
    }
    if (params?.limit !== undefined && params.limit !== null) {
      queryParams.limit = params.limit.toString();
    }

    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${API_URL}/v2/clients/${clientId}/managements/collector-quadrants${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
      throw new Error("Respuesta del servidor no válida");
    }

    if (!data.pagination || !data.data) {
      throw new Error("Estructura de respuesta no válida");
    }

    return data as CollectorQuadrantsResponse;
  } catch (error) {
    console.error("Error al obtener cuadrantes de cobrador:", error);
    throw error;
  }
};

export const getManagementIndicators = async (
  accessToken: string,
  clientId: string
): Promise<ManagementIndicators> => {
  try {
    const url = `${API_URL}/v2/clients/${clientId}/managements/indicators`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
      throw new Error("Respuesta del servidor no válida");
    }

    return data as ManagementIndicators;
  } catch (error) {
    console.error("Error al obtener indicadores de gestión:", error);
    throw error;
  }
};
