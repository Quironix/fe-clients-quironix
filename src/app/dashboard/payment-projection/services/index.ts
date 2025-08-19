/**
 * Servicio para obtener los indicadores del dashboard de proyección de pagos.
 *
 * @param accessToken Token de acceso para autenticación Bearer
 * @param clientId ID del cliente
 * @returns Respuesta con los indicadores o mensaje de error
 */
export const getIndicators = async (
  accessToken: string,
  clientId: string
): Promise<{
  success: boolean;
  message: string;
  data: any;
}> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reports/dashboard/indicators`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al obtener los indicadores",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Indicadores obtenidos correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al obtener los indicadores:", error);
    return {
      success: false,
      message: "Error al obtener los indicadores",
      data: null,
    };
  }
};

/**
 * Servicio para obtener todos los deudores del dashboard de proyección de pagos.
 *
 * @param accessToken Token de acceso para autenticación Bearer
 * @param clientId ID del cliente
 * @param search Código del deudor para filtrar (opcional)
 * @param period_month Mes del periodo para filtrar (opcional)
 * @param page Número de página (opcional, por defecto 1)
 * @param limit Límite de elementos por página (opcional, por defecto 10)
 * @returns Respuesta con la lista de deudores o mensaje de error
 */
export const getAllDebtors = async (
  accessToken: string,
  clientId: string,
  search?: string | null,
  period_month?: string | null,
  page?: number,
  limit?: number
): Promise<{
  success: boolean;
  message: string;
  data: any;
}> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    // Construir los query parameters de manera dinámica
    const queryParams = new URLSearchParams();

    if (search) {
      queryParams.append("search", search);
    }

    if (period_month) {
      queryParams.append("period_month", period_month);
    }

    if (page) {
      queryParams.append("page", page.toString());
    }

    if (limit) {
      queryParams.append("limit", limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `${API_URL}/v2/clients/${clientId}/reports/dashboard/debtors${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al obtener los deudores",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Deudores obtenidos correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al obtener los deudores:", error);
    return {
      success: false,
      message: "Error al obtener los deudores",
      data: null,
    };
  }
};

/**
 * Servicio para obtener los reportes mensuales de proyección de pagos por deudor.
 *
 * @param accessToken Token de acceso para autenticación Bearer
 * @param clientId ID del cliente
 * @param projectionId ID de la proyección
 * @returns Respuesta con los reportes mensuales o mensaje de error
 */
export const getReportsByDebtor = async (
  accessToken: string,
  clientId: string,
  projectionId: string
): Promise<{
  success: boolean;
  message: string;
  data: any;
}> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reports/payment-projection/${projectionId}/monthly`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message:
          errorData?.message || "Error al obtener los reportes mensuales",
        data: null,
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: "Reportes mensuales obtenidos correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al obtener los reportes mensuales:", error);
    return {
      success: false,
      message: "Error al obtener los reportes mensuales",
      data: null,
    };
  }
};

/**
 * Cambia las facturas de semana en una proyección de pagos.
 *
 * @param accessToken Token de acceso del usuario
 * @param clientId ID del cliente
 * @param debtorCode Código del deudor
 * @param moves Array de movimientos, cada uno con targetDate y un array de IDs de facturas
 * @returns Respuesta con el resultado de la operación o mensaje de error
 */
export const changeInvoices = async (
  accessToken: string,
  clientId: string,
  debtorCode: string,
  moves: Array<{
    targetDate: string;
    invoices: string[];
  }>
): Promise<{
  success: boolean;
  message: string;
  data: any;
}> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reports/payment-projections/${debtorCode}/invoices`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moves }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message:
          errorData?.message || "Error al cambiar las facturas de semana",
        data: null,
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: "Facturas cambiadas de semana correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al cambiar las facturas de semana:", error);
    return {
      success: false,
      message: "Error al cambiar las facturas de semana",
      data: null,
    };
  }
};
