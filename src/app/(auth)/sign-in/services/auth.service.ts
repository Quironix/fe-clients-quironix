export const signIn = async (email: string, password: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v2/auth/sign-in`,
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
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
