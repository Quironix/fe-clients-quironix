import { ClientCreate, ClientUpdate } from "./dto";
import { Client } from "./types";

export const getAll = async (accessToken: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/clients`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch clients");
  }

  return response.json();
};

export const create = async (accessToken: string, client: ClientCreate) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/clients/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  });

  if (!response.ok) {
    throw new Error("Failed to create client");
  }

  return response.json();
};

export const update = async (accessToken: string, clientId: string, client: ClientUpdate) => {
  try {
    // Preparar los datos para el envío según la estructura requerida por la API
    // Definir el tipo para evitar errores de TypeScript
    interface ClientUpdateData {
      name: string;
      country_id: string;
      plan_id: string;
      type: "FACTORING" | "CONFIRMING";
      contacts: [
        {
          first_name: string;
          last_name: string;
          email: string;
        },
      ];
      terms_and_conditions?: string;
      contract?: string;
    }

    const clientData: ClientUpdateData = {
      name: client.name,
      country_id: client.country_id,
      plan_id: client.plan_id,
      type: client.type,
      contacts: [client.contacts],
    };

    // Solo incluir estos campos si se proporcionan
    if (client.terms_and_conditions) {
      clientData.terms_and_conditions = client.terms_and_conditions;
    }

    if (client.contract) {
      clientData.contract = client.contract;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/clients/${clientId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error en la respuesta:", response.status, errorData);
      throw new Error(`Failed to update client: ${response.status} ${errorData}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    throw error;
  }
};

export const remove = async (accessToken: string, clientId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/clients/${clientId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.status === 204) {
    return { message: "Client deleted successfully", status: 204, removed: true };
  }

  if (!response.ok) {
    throw new Error("Failed to delete client");
  }

  return response.json();
};

export const getCountries = async (accessToken: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v2/countries`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }

  return response.json();
};
