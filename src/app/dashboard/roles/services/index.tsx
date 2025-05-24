import { Role } from "./types";

export const getAll = async (accessToken: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/roles`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }

  return response.json();
};

export const create = async (accessToken: string, role: Role) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/roles/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(role),
  });

  if (!response.ok) {
    throw new Error("Failed to create role");
  }

  return response.json();
};

export const update = async (accessToken: string, roleId: string, role: Role) => {
  console.log("Actualizando rol con ID:", roleId);
  console.log("Datos enviados:", JSON.stringify(role));

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/roles/${roleId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(role),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error en la respuesta:", response.status, errorData);
      throw new Error(`Failed to update role: ${response.status} ${errorData}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    throw error;
  }
};

export const remove = async (accessToken: string, roleId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/roles/${roleId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete role");
  }

  return response.json();
};

export const getAdminResources = async (accessToken: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get admin resources");
  }

  return response.json();
};
