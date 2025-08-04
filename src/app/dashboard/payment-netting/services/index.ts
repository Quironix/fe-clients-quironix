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

/**
 * Obtiene las facturas de un deudor específico para reconciliación.
 *
 * @param {Object} params - Parámetros para obtener las facturas.
 * @param {string} params.accessToken - Token de acceso para autenticación.
 * @param {string} params.clientId - ID del cliente.
 * @param {string} params.debtorId - ID del deudor.
 * @returns {Promise<Object>} - Respuesta de la API con las facturas.
 */
export const getInvoices = async ({
  accessToken,
  clientId,
  debtorId,
}: {
  accessToken: string;
  clientId: string;
  debtorId: string;
}) => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reconciliation/debtors/${debtorId}/invoices`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al obtener las facturas",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Facturas obtenidas correctamente",
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al obtener las facturas",
      data: null,
    };
  }
};

/**
 * Asigna un deudor a movimientos específicos para reconciliación manual.
 *
 * @param {Object} params - Parámetros para la asignación.
 * @param {string} params.accessToken - Token de acceso para autenticación.
 * @param {string} params.clientId - ID del cliente.
 * @param {string} params.debtorId - ID del deudor a asignar.
 * @param {Array<string>} params.movementIds - Array de IDs de movimientos.
 * @returns {Promise<Object>} - Respuesta de la API.
 */
export const assignDebtor = async ({
  accessToken,
  clientId,
  debtorId,
  movementIds,
}: {
  accessToken: string;
  clientId: string;
  debtorId: string;
  movementIds: string[];
}) => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reconciliations/manual`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          debtor_id: debtorId,
          movement_ids: movementIds,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al asignar el deudor",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Deudor asignado correctamente",
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al asignar el deudor",
      data: null,
    };
  }
};

/**
 * Obtiene los pagos de un deudor específico para reconciliación.
 * @param {string} params.accessToken - Token de acceso para autenticación.
 * @param {string} params.clientId - ID del cliente.
 * @param {string} params.debtorId - ID del deudor.
 * @returns {Promise<Object>} - Respuesta de la API con los pagos.
 */
export const getPayments = async ({
  accessToken,
  clientId,
  debtorId,
}: {
  accessToken: string;
  clientId: string;
  debtorId: string;
}) => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reconciliation/debtors/${debtorId}/payments`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al obtener los pagos",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Pagos obtenidos correctamente",
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al obtener los pagos",
      data: null,
    };
  }
};

/**
 * Crea una conciliación entre facturas y pagos para un deudor específico.
 * @param {Object} params - Parámetros para crear la conciliación.
 * @param {string} params.accessToken - Token de acceso para autenticación.
 * @param {string} params.clientId - ID del cliente.
 * @param {string} params.debtorId - ID del deudor.
 * @param {string[]} params.invoices - Arreglo de IDs de facturas.
 * @param {string[]} params.payments - Arreglo de IDs de pagos.
 * @returns {Promise<Object>} - Respuesta de la API.
 */
export const createConciliation = async ({
  accessToken,
  clientId,
  debtorId,
  invoices,
  payments,
}: {
  accessToken: string;
  clientId: string;
  debtorId: string;
  invoices: string[];
  payments: string[];
}) => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reconciliation/debtors/${debtorId}/execute`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoices,
          payments,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || "Error al crear la conciliación",
        data: null,
      };
    }

    return {
      success: true,
      message: "Conciliación creada correctamente",
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al crear la conciliación",
      data: null,
    };
  }
};
