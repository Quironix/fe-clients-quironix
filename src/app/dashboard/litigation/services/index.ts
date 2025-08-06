import { DISPUTE_MESSAGES } from "../../data";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
// export const getLitigations = async (accessToken: string, clientId: string) => {

//   const response = await fetch(
//     `${API_URL}/v2/clients/${clientId}/litigations?status=PENDING`,
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     }
//   );
//   return response.json();
// };

export const getLitigations = async ({
  accessToken,
  clientId,
  page = 1,
  limit = 10,
  status = "PENDING",
  motivo,
}: {
  accessToken: string;
  clientId: string;
  page?: number;
  limit?: number;
  status?: string;
  motivo?: string;
}) => {
  try {
    // Convertir fechas a formato ISO

    // Construir parámetros de consulta dinámicamente
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Agregar filtro de status solo si no es vacío o "ALL"
    if (status && status !== "ALL") {
      queryParams.append("status", status);
    }
    // Agregar filtro de motivo solo si no es vacío o "ALL"
    if (motivo && motivo !== "ALL") {
      queryParams.append("motivo", motivo);
    }

    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/litigations?${queryParams.toString()}`,
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

export const GetAllLitigationByDebtorId = async (
  accessToken: string,
  clientId: string,
  debtorId
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/litigations/debtor/${debtorId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  console.log("GEtALldebtor", response);
  return response.json();
};

export const createLitigation = async ({
  accessToken,
  clientId,
  dataToInsert,
}: {
  accessToken: string;
  clientId: string;
  dataToInsert: any;
}) => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/litigations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToInsert),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message:
          DISPUTE_MESSAGES[
            errorData?.message as keyof typeof DISPUTE_MESSAGES
          ] || "Error al crear litigio",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Litigio creado correctamente",
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al crear litigio",
      data: null,
    };
  }
};

export const updateLitigation = async (
  accessToken: string,
  clientId: string,
  litigationId: string,
  dataToUpdate: {
    litigation_amount: number;
    motivo: string;
    submotivo: string;
    contact: string;
  }
) => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/litigations/${litigationId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToUpdate),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message:
          DISPUTE_MESSAGES[
            errorData?.message as keyof typeof DISPUTE_MESSAGES
          ] || "Error al actualizar litigio",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Litigio actualizado correctamente",
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al actualizar litigio",
      data: null,
    };
  }
};

export const normalization = async (
  accessToken: string,
  clientId: string,
  litigationId: string,
  dataToUpdate: {
    normalization_reason: string | number;
    normalization_by_contact: string;
    comment: string;
    is_important_comment: boolean | string;
  }
) => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/litigations/${litigationId}/normalize`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToUpdate),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message:
          DISPUTE_MESSAGES[
            errorData?.message as keyof typeof DISPUTE_MESSAGES
          ] || "Error al normalizar litigio",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Litigio normalizado correctamente",
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al normalizar litigio",
      data: null,
    };
  }
};

/**
 * Actualiza el perfil de usuario para la tabla de litigios.
 *s
 * @param {Object} params - Parámetros para la actualización.
 * @param {string} params.accessToken - Token de acceso para autenticación.
 * @param {string} params.clientId - ID del cliente.
 * @param {string} params.userId - ID del usuario.
 * @param {Array} params.litigationTable - Nueva configuración de la tabla de litigios.
 * @returns {Promise<Object>} - Respuesta de la API.
 */
export const updateLitigationTableProfile = async ({
  accessToken,
  clientId,
  userId,
  litigationTable,
}: {
  accessToken: string;
  clientId: string;
  userId: string;
  litigationTable: Array<{ name: string; is_visible: boolean }>;
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
          litigations_table: litigationTable,
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

export const getLitigationsByDebtor = async (
  accessToken: string,
  clientId: string,
  debtorId: string
) => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/litigations/debtor/${debtorId}`,
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
        message: errorData?.message || "Error al obtener litigios por deudor",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Litigios obtenidos correctamente",
      data: data.data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al obtener litigios por deudor",
      data: null,
    };
  }
};

export const bulkLitigatiions = async (
  accessToken: string,
  clientId: string,
  payload: {
    litigation_ids: string[];
    normalization_reason: string;
    normalization_by_contact: string;
    comment?: string;
  }
) => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/litigations/bulk-normalize`,
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
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al normalizar litigios en lote",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Litigios normalizados correctamente",
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al normalizar litigios en lote",
      data: null,
    };
  }
};
