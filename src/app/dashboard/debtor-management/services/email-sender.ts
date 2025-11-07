import { EmailPayload, EmailResponse } from "../types/email";

export async function sendTrackEmail(
  payload: EmailPayload
): Promise<EmailResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch("/api/send-mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || data.details || `Error ${response.status}: ${response.statusText}`
      );
    }

    return {
      success: true,
      message: data.message || "Email enviado exitosamente",
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
