import { BulkDebtorsSchema } from "../types";
import { PaginatedResponse, PaginationParams } from "../types/pagination";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getDebtors = async (
  accessToken: string,
  clientId: string,
  params?: PaginationParams
): Promise<PaginatedResponse<any>> => {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.company_ids?.length) {
      params.company_ids.forEach((id) => searchParams.append("company_ids", id));
    }
    const queryString = searchParams.toString();

    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/debtors?${queryString}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
      throw new Error("Respuesta del servidor no válida");
    }

    if (!data.pagination || !Array.isArray(data.data)) {
      throw new Error("Estructura de respuesta paginada no válida");
    }

    return data as PaginatedResponse<any>;
  } catch (error) {
    console.error("Error al obtener deudores:", error);
    throw error;
  }
};

export const getDebtorById = async (
  accessToken: string,
  clientId: string,
  debtorId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/debtors/${debtorId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.json();
};

export const createDebtor = async (
  accessToken: string,
  clientId: string,
  debtor: any
) => {
  // añade validacion de errores de la respuesta
  const response = await fetch(`${API_URL}/v2/clients/${clientId}/debtors`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(debtor),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al crear el deudor");
  }
  return response.json();
};

export const updateDebtor = async (
  accessToken: string,
  clientId: string,
  debtor: any
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/debtors/${debtor.id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(debtor),
    }
  );
  return response.json();
};

export const bulkDebtors = async (
  accessToken: string,
  clientId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("schemaType", BulkDebtorsSchema.DEBTORS);

  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/file-processing/upload`,
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
        code: "ERROR_BULK_DEBTORS",
      })
    );
  }
  return response.json();
};

export const deleteDebtor = async (
  accessToken: string,
  clientId: string,
  debtorId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/debtors/${debtorId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.json();
};

export const getDebtorCollectionProfile = async (
  accessToken: string,
  clientId: string,
  debtorId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/managements/collection-profiles/debtor/${debtorId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const getDebtorCallBrief = async (
  accessToken: string,
  clientId: string,
  debtorId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/managements/call-briefs/debtor/${debtorId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const assignDebtorToExecutive = async (
  accessToken: string,
  clientId: string,
  debtorId: string,
  executiveId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/debtors/${debtorId}/executive/${executiveId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al asignar ejecutivo al deudor");
  }
  return response.json();
};

export const getDebtorEmailReplies = async (
  accessToken: string,
  clientId: string,
  debtorId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/debtors/${debtorId}/email-replies`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Correos salientes que son respuestas dentro de un hilo (enviados desde el
// panel de hilo) — no el primer envío, que ya se ve como la gestión real.
export const getDebtorOutgoingEmailReplies = async (
  accessToken: string,
  clientId: string,
  debtorId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/debtors/${debtorId}/outgoing-email-replies`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const getExecutives = async (
  accessToken: string,
  clientId: string
) => {
  const response = await fetch(`${API_URL}/v2/clients/${clientId}/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};
