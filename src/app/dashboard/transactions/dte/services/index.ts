import { BulkSchema } from "../types";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const bulkData = async (
  accessToken: string,
  clientId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("schemaType", BulkSchema.INVOICES);

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
        code: "ERROR_BULK_DTE",
      })
    );
  }
  return response.json();
};

export const getDTEs = async (accessToken: string, clientId: string) => {
  const response = await fetch(`${API_URL}/v2/clients/${clientId}/invoices`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch DTE");
  }
  return response.json();
};

export const createDTE = async (
  accessToken: string,
  clientId: string,
  data: any
) => {
  const response = await fetch(`${API_URL}/v2/clients/${clientId}/invoices`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getDTEById = async (
  accessToken: string,
  clientId: string,
  dteId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/invoices/${dteId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch DTE");
  }
  return response.json();
};

export const updateDTE = async (
  accessToken: string,
  clientId: string,
  dteId: string,
  data: any
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/invoices/${dteId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update DTE");
  }
  return response.json();
};

export const deleteDTE = async (
  accessToken: string,
  clientId: string,
  dteId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/invoices/${dteId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "DELETE",
    }
  );
  return response.json();
};
