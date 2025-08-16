const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getCashFlowConfiguration = async (
  accessToken: string,
  clientId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/projection-configuration`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Error al obtener la configuración del flujo de caja"
    );
  }
  return response.json();
};

export const updateCashFlowConfiguration = async (
  accessToken: string,
  clientId: string,
  configuration: any
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/projection-configuration`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(configuration),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Error al actualizar la configuración del flujo de caja"
    );
  }
  return response.json();
};
