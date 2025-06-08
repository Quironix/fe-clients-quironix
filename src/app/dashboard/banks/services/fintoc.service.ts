export const createFintocLinkIntent = async (
  accessToken: string,
  clientId: string
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
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create fintoc link intent");
  }

  return response.json();
};

export const exchangeDataFintoc = async (
  accessToken: string,
  clientId: string,
  exchangeToken: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/fintoc/exchange-data?exchangeToken=${exchangeToken}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create fintoc link intent");
  }

  return response.json();
};
