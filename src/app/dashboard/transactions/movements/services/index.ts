import { BulkDebtorsSchema } from "../../../debtors/types";
import { MovementRequest } from "./types";

export const getAll = async (accessToken: string, clientId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/bank-movements`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch bank movements");
  }

  return response.json();
};

export const create = async (
  accessToken: string,
  bankMovement: MovementRequest,
  clientId: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/bank-movements`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bankMovement),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create bank movement");
  }

  return response.json();
};

export const update = async (
  accessToken: string,
  bankMovementId: string,
  bankMovement: MovementRequest,
  clientId: string
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/bank-movements/${bankMovementId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankMovement),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to update bank movement: ${response.status} ${errorData}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error al actualizar movimiento bancario:", error);
    throw error;
  }
};

export const remove = async (
  accessToken: string,
  bankMovementId: string,
  clientId: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/bank-movements/${bankMovementId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete bank movement");
  }
};

export const bulkMovements = async (
  accessToken: string,
  clientId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("schemaType", BulkDebtorsSchema.MOVEMENTS);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/file-processing/upload`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
      body: formData,
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      JSON.stringify({
        message: error.message || "Error al cargar el archivo",
        code: "ERROR_BULK_MOVEMENTS",
      })
    );
  }
  return response.json();
};
