import { format } from "date-fns";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const getPaymentNetting = async ({
  accessToken,
  clientId,
  page = 1,
  limit = 10,
  status = "PENDING",
  createdAtToFrom = format(new Date(), "yyyy-MM-dd"),
  createdAtTo = format(new Date(), "yyyy-MM-dd"),
}: {
  accessToken: string;
  clientId: string;
  page: number;
  limit: number;
  status: string;
  createdAtToFrom: string;
  createdAtTo: string;
}) => {
  try {
    // Convertir fechas a formato ISO
    const fromISO = new Date(createdAtToFrom + 'T00:00:00.000Z').toISOString();
    const toISO = new Date(createdAtTo + 'T23:59:59.999Z').toISOString();

    // Construir parámetros de consulta dinámicamente
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      createdAtFrom: fromISO,
      createdAtTo: toISO,
    });

    // Agregar filtro de status solo si no es vacío o "ALL"
    if (status && status !== "ALL") {
      queryParams.append("status", status);
    }

    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reconciliation/movements?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al obtener los datos",
      data: null,
    };
  }
};
