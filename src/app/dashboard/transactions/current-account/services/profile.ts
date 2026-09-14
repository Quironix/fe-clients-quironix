import { TableColumnPreference } from "@/context/ProfileContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Llaves de grilla que el backend acepta en `table_preferences` (QUI-17 §8.4). */
export const CURRENT_ACCOUNT_TABLE_KEY = "current_account";
export const CURRENT_ACCOUNT_ALL_DEBTORS_TABLE_KEY =
  "current_account_all_debtors";

/**
 * Guarda la preferencia de columnas de UNA grilla en el perfil del usuario.
 *
 * QUI-17 §8 — reemplaza a `updateCurrentAccountTableProfile`, que mandaba
 * `current_account_table` y recibia 200 OK sobre un campo que el backend no
 * tenia: TypeORM lo descartaba en silencio y el usuario veia "Perfil
 * actualizado correctamente" sobre algo que se evaporaba al recargar.
 *
 * El backend hace merge por llave, asi que mandar una grilla no pisa las otras.
 */
export const updateTablePreferences = async ({
  accessToken,
  clientId,
  userId,
  tableName,
  columns,
}: {
  accessToken: string;
  clientId: string;
  userId: string;
  tableName: string;
  columns: TableColumnPreference[];
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
          table_preferences: {
            [tableName]: columns,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
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
