const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createPaymentPlan({
  accessToken,
  clientId,
  dataToInsert,
}: {
  accessToken: string;
  clientId: string;
  dataToInsert: any;
}): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/payment-plans`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(dataToInsert),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Error al crear plan de pago",
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error creating payment plan:", error);
    return {
      success: false,
      message: "Error de red al crear plan de pago",
    };
  }
}
