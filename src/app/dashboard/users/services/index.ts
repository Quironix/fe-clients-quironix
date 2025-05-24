import { User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAll = async (accessToken: string, clientId: string) => {
  const response = await fetch(`${API_URL}/v2/clients/${clientId}/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.json();
};

export const create = async (
  user: User,
  accessToken: string,
  clientId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/users/create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al crear usuario");
  }

  return response.json();
};

export const update = async (
  id: string,
  user: Partial<User>,
  accessToken: string,
  clientId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/users/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al actualizar usuario");
  }

  return response.json();
};

export const deleteUser = async (
  userId: string,
  accessToken: string,
  clientId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/users/${userId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al eliminar usuario");
  }

  return response.json();
};

export const reinviteUser = async (
  email: string,
  accessToken: string,
  clientId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/users/reinvite`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al reinvitar usuario");
  }

  return response.json();
};

export const getRoles = async (accessToken: string, clientId: string) => {
  const response = await fetch(`${API_URL}/v2/clients/${clientId}/roles`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.json();
};
