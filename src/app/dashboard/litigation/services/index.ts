import Litigation from '../page';

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

export const updateLitigation = async (
  accessToken: string,
  clientId: string,
  litigationId: string,
  payload: {
    litigation_amount: number;
    motivo: string;
    submotivo: string;
    contact: string;
  }
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/litigations/${litigationId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || "Error al editar litigio");
  }

  return response.json();
};
export const GetAllLitigationByDebtorId = async( accessToken: string, clientId: string, debtorId) => {
  const response = await fetch(`${API_URL}/v2/clients/${clientId}/litigations/debtor/${debtorId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  console.log('GEtALldebtor', response)
  return response.json();

}


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
