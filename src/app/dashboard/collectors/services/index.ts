import type {
  CreateCollectorRequest,
  CollectorResponse,
  UpdateCollectorRequest,
} from "./types";

export const getAll = async (accessToken: string, clientId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/collectors`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collectors");
  }

  return response.json();
};

export const getById = async (
  accessToken: string,
  collectorId: string,
  clientId: string
): Promise<CollectorResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/collectors/${collectorId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collector");
  }

  return response.json();
};

export const create = async (
  accessToken: string,
  data: CreateCollectorRequest,
  clientId: string
): Promise<CollectorResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/collectors`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Failed to create collector"
    );
  }

  return response.json();
};

export const update = async (
  accessToken: string,
  collectorId: string,
  data: UpdateCollectorRequest,
  clientId: string
): Promise<CollectorResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/collectors/${collectorId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Failed to update collector"
    );
  }

  return response.json();
};

export const updateStatus = async (
  accessToken: string,
  collectorId: string,
  status: boolean,
  clientId: string
): Promise<CollectorResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/collectors/${collectorId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Failed to update collector status"
    );
  }

  return response.json();
};

export const deleteCollector = async (
  accessToken: string,
  collectorId: string,
  clientId: string
): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/collectors/${collectorId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Failed to delete collector"
    );
  }
};
