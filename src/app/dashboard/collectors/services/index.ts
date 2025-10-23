// Ejemplo de servicio GET
export const getAll = async (accessToken: string, clientId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/REPLACE_ENDPOINT`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
};

export const create = async (
  accessToken: string,
  data: any,
  clientId: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/REPLACE_ENDPOINT`,
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
    throw new Error("Failed to create data");
  }

  return response.json();
};
