import { EmailPayload, EmailResponse } from "../types/email";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function sendTrackEmail(
  payload: EmailPayload,
  token: string,
  clientId: string
): Promise<EmailResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/managements/emails/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          data.details ||
          `Error ${response.status}: ${response.statusText}`
      );
    }

    return {
      success: data.sent === true,
      message: "Email enviado exitosamente",
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      console.error("Email sending timeout");
      return {
        success: false,
        message: "El envío de email excedió el tiempo límite",
      };
    }

    console.error("Error sending email:", error);
    return {
      success: false,
      message: error.message || "Error al enviar email",
    };
  }
}

export async function queueTrackSummaryEmail(
  trackIds: string[],
  token: string,
  clientId: string
): Promise<EmailResponse> {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/managements/emails/track-summary`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ track_ids: trackIds }),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Error ${response.status}`);
    }

    return { success: true, message: "Correo de resumen en cola" };
  } catch (error) {
    console.error("Error queueing track summary email:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error al encolar el correo",
    };
  }
}
