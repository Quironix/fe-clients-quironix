export const signIn = async (email: string, password: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v2/auth/sign-in`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || "Error en la autenticación";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido al iniciar sesión");
  }
};

export const getUserProfile = async (token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/auth/profile`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

// Función para que el usuario autenticado defina su propia contraseña
// (cambio obligatorio de primer ingreso / post-recuperación)
export const changeOwnPassword = async (
  newPassword: string,
  token: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/auth/change-password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ new_password: newPassword }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.data || data?.message || "PASSWORD_CHANGE_FAILED";
    throw new Error(errorMessage);
  }

  return data;
};

// Función para solicitar recuperación de contraseña
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v2/auth/reset-password`,
      {
        method: "PUT",
        headers: {
          front: "web",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.message || "Error al solicitar recuperación de contraseña";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Error desconocido al solicitar recuperación de contraseña"
    );
  }
};
