const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  phone_number: string;
}

export const updateProfile = async (
  userId: string,
  payload: UpdateProfilePayload,
  accessToken: string,
  clientId: string
) => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/users/${userId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al actualizar perfil");
  }

  return response.json();
};

export const resetPassword = async (email: string) => {
  const response = await fetch(`${API_URL}/v2/auth/reset-password`, {
    method: "PUT",
    headers: {
      front: "web",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al solicitar cambio de contraseña");
  }

  return response.json();
};
