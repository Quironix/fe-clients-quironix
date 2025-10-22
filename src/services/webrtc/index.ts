import type {
  ProvisionRequest,
  ProvisionResponse,
  WebRTCCredentials,
} from "./types";

const WEBRTC_API_URL =
  process.env.NEXT_PUBLIC_WEBRTC_API_URL || "https://172.17.16.24";

/**
 * Obtiene las credenciales SIP/WebRTC desde el servidor de provisión
 */
export async function provisionWebRTC(
  credentials: ProvisionRequest
): Promise<WebRTCCredentials> {
  try {
    const response = await fetch(`${WEBRTC_API_URL}/api/provision.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ProvisionResponse = await response.json();

    if (data.status !== "ok" || !data.sip_user || !data.ws_uri) {
      throw new Error(data.message || "Invalid credentials");
    }

    return {
      sipUser: data.sip_user,
      sipPass: data.sip_pass || "",
      sipDomain: data.sip_domain || "",
      wsUri: data.ws_uri,
    };
  } catch (error) {
    console.error("Error en provisión WebRTC:", error);
    throw error;
  }
}

/**
 * Credenciales de prueba para desarrollo
 */
export const TEST_CREDENTIALS = {
  "6170": {
    username: "6170",
    password: "9c8c35689dca898e0cbad7fc622944ca",
  },
  "6171": {
    username: "6171",
    password: "9c8c35689dca898e0cbad7fc622944ca",
  },
  "6172": {
    username: "6172",
    password: "9c8c35689dca898e0cbad7fc622944ca",
  },
  "6173": {
    username: "6173",
    password: "9c8c35689dca898e0cbad7fc622944ca",
  },
};
