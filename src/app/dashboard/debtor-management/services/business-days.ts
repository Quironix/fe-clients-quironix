/**
 * Servicio API para el calendario de feriados (validación de fecha próxima
 * gestión). Ver PRD_tareas_validacion_fecha_y_pdf_facturas.md §8.
 */

export interface HolidaysResponse {
  year: number;
  country: string;
  holidays: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Obtiene los feriados de un año/país, reutilizando el mismo calendario
 * que el motor de proyección de pagos (no se duplica la tabla en el
 * frontend).
 */
export async function getHolidays(
  accessToken: string,
  clientId: string,
  year: number,
  country: string = "CL"
): Promise<HolidaysResponse> {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/business-days/holidays?year=${year}&country=${country}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch holidays");
  }

  return response.json();
}
