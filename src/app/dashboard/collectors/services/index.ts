import type {
  CreateCollectorRequest,
  CollectorResponse,
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
