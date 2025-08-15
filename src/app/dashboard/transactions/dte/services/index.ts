import { BulkSchema } from "../types";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DTEPaginationParams {
  page?: number;
  limit?: number;
}

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

export const getDTEs = async (
  accessToken: string,
  clientId: string,
  params?: DTEPaginationParams
) => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const url = `${API_URL}/v2/clients/${clientId}/invoices${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
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

export const getDTEsByDebtor = async (
  accessToken: string,
  clientId: string,
  debtorId: string,
  params?: { balance?: string; number?: string; type?: string }
) => {
  const queryParams = new URLSearchParams();
  if (params?.balance) queryParams.append("balance", params.balance);
  if (params?.number) queryParams.append("number", params.number);
  if (params?.type) queryParams.append("document_type", params.type);

  const queryString = queryParams.toString();
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/invoices/debtor/${debtorId}${queryString ? `?${queryString}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch DTEs");
  }
  return response.json();
};
