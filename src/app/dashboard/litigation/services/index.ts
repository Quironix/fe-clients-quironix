import { DISPUTE_MESSAGES } from "../../data";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const getLitigations = async (accessToken: string, clientId: string) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/litigations`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.json();
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
