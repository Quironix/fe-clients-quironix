export const createFintocLinkIntent = async (
  accessToken: string,
  clientId: string,
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/fintoc/link-intent`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create fintoc link intent");
  }

  return response.json();
};

export const exchangeDataFintoc = async (
  accessToken: string,
  clientId: string,
  exchangeToken: string,
  since?: string,
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/fintoc/exchange-data?exchangeToken=${exchangeToken}${since ? `&since=${since}` : ""}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create fintoc link intent");
  }

  return response.json();
};

export type FintocConnectionStatus =
  | "ACTIVE"
  | "LOGIN_REQUIRED"
  | "PROVIDER_DOWN"
  | "STALE";

export interface FintocAccountConnection {
  bank_information_id: string;
  bank: string | null;
  account_number: string | null;
  connection_status: FintocConnectionStatus;
  connection_reason: string | null;
  last_refreshed_at: string | null;
  status_changed_at: string | null;
  incident: { name: string; started: string; url: string } | null;
}

export const getFintocConnectionStatus = async (
  accessToken: string,
  clientId: string,
): Promise<FintocAccountConnection[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/fintoc/connection-status`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch fintoc connection status");
  }

  return response.json();
};
