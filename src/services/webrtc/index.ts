import type {
  ProvisionRequest,
  ProvisionResponse,
  WebRTCCredentials,
} from "./types";

const WEBRTC_API_URL =
  process.env.NEXT_PUBLIC_WEBRTC_API_URL || "http://172.17.16.24";

const SIP_DOMAIN = process.env.NEXT_PUBLIC_WEBRTC_SIP_DOMAIN || "172.17.16.24";

const WS_URI =
  process.env.NEXT_PUBLIC_WEBRTC_WS_URI || "wss://pbx.quironix.com/ws";

const TURN_USERNAME = process.env.NEXT_PUBLIC_TURN_USERNAME || "";
const TURN_CREDENTIAL = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "";

const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: "stun:stun.cloudflare.com:3478",
  },
  {
    urls: [
      "turn:turn.cloudflare.com:3478?transport=udp",
      "turn:turn.cloudflare.com:3478?transport=tcp",
      "turns:turn.cloudflare.com:5349?transport=tcp",
    ],
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  },
];

export function createDirectWebRTCConfig(
  sipUser: string,
  sipPass: string,
): WebRTCCredentials {
  return {
    sipUser,
    sipPass,
    sipDomain: SIP_DOMAIN,
    wsUri: WS_URI,
    iceServers: ICE_SERVERS,
  };
}

export async function provisionWebRTC(
  credentials: ProvisionRequest,
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
      iceServers: ICE_SERVERS,
    };
  } catch (error) {
    console.error("Error en provisión WebRTC:", error);
    throw error;
  }
}

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
