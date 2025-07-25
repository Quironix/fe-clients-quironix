const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const getPaymentNetting = async ({
  accessToken,
  clientId,
  page = 1,
  limit = 10,
  status = "PENDING",
  createdAtToFrom,
  createdAtTo,
}: {
  accessToken: string;
  clientId: string;
  page?: number;
  limit?: number;
  status?: string;
  createdAtToFrom?: string;
  createdAtTo?: string;
}) => {
  try {
    // Convertir fechas a formato ISO

    // Construir parámetros de consulta dinámicamente
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (createdAtToFrom) {
      const fromISO = new Date(
        createdAtToFrom + "T00:00:00.000Z"
      ).toISOString();
      queryParams.append("createdAtFrom", fromISO);
    }
    if (createdAtTo) {
      const toISO = new Date(createdAtTo + "T23:59:59.999Z").toISOString();
      queryParams.append("createdAtTo", toISO);
    }

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

/**
 * Actualiza el perfil de usuario para la tabla de conciliación.
 *
 * @param {Object} params - Parámetros para la actualización.
 * @param {string} params.accessToken - Token de acceso para autenticación.
 * @param {string} params.clientId - ID del cliente.
 * @param {string} params.userId - ID del usuario.
 * @param {Array} params.reconciliationTable - Nueva configuración de la tabla de conciliación.
 * @returns {Promise<Object>} - Respuesta de la API.
 */
export const updateReconciliationTableProfile = async ({
  accessToken,
  clientId,
  userId,
  reconciliationTable,
}: {
  accessToken: string;
  clientId: string;
  userId: string;
  reconciliationTable: Array<{ name: string; is_visible: boolean }>;
}) => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/users/${userId}/profile`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reconciliation_table: reconciliationTable,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al actualizar el perfil",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Perfil actualizado correctamente",
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al actualizar el perfil",
      data: null,
    };
  }
};
