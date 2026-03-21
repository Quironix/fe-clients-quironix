import {
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  UpdateApiKeyRequest,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchApiKeys = async (
  accessToken: string,
  clientId: string
): Promise<ApiKey[]> => {
  const response = await fetch(
    `${API_URL}/clients/${clientId}/api-keys`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.api_keys)) return data.api_keys;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const createApiKey = async (
  payload: CreateApiKeyRequest,
  accessToken: string,
  clientId: string
): Promise<CreateApiKeyResponse> => {
  const response = await fetch(
    `${API_URL}/clients/${clientId}/api-keys`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al crear API key");
  }

  return response.json();
};

export const updateApiKey = async (
  id: string,
  payload: UpdateApiKeyRequest,
  accessToken: string,
  clientId: string
): Promise<ApiKey> => {
  const response = await fetch(
    `${API_URL}/clients/${clientId}/api-keys/${id}`,
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
    const error = await response.json();
    throw new Error(error.message || "Error al actualizar API key");
  }

  return response.json();
};

export const deleteApiKey = async (
  id: string,
  accessToken: string,
  clientId: string
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/clients/${clientId}/api-keys/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error al eliminar API key");
  }
};
