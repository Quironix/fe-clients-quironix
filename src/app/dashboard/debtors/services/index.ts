const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getDebtors = async (accessToken: string, clientId: string) => {
  try {
    const response = await fetch(`${API_URL}/v2/clients/${clientId}/debtors`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validar que la respuesta tenga la estructura esperada
    if (!data || typeof data !== "object") {
      throw new Error("Respuesta del servidor no válida");
    }

    return data;
  } catch (error) {
    console.error("Error al obtener deudores:", error);
    throw error;
  }
};

export const createDebtor = async (
  debtor: any,
  accessToken: string,
  clientId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/debtors/create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(debtor),
    }
  );
  return response.json();
};

export const updateDebtor = async (
  debtor: any,
  accessToken: string,
  clientId: string
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
