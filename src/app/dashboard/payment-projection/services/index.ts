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
 * @returns Respuesta con la lista de deudores o mensaje de error
 */
export const getAllDebtors = async (
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
      `${API_URL}/v2/clients/${clientId}/reports/dashboard/debtors`,
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
