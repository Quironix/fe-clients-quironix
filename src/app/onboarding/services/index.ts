export const sendCode = async (accessToken: string, clientId: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/code-client-validation`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || "Error al enviar el código" };
    }

    return data;
  } catch (error) {
    console.error("Error:", error);
    return { error: "Error al enviar el código" };
  }
};

export const verifyCode = async (accessToken: string, clientId: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/code-client-validation/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || "Error al verificar el código" };
    }

    return data;
  } catch (error) {
    console.error("Error:", error);
    return { error: "Error al verificar el código" };
  }
};
