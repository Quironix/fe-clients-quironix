import type {
  CallCopilotConfig,
  CallCopilotOutcome,
  ProposeResponse,
  SttToken,
  TranscriptTurn,
} from "../types/call-copilot";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(
  accessToken: string,
  path: string,
  init: { method: "GET" | "POST"; body?: unknown }
): Promise<T> {
  const response = await fetch(`${API_URL}/v2/clients/${path}`, {
    method: init.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || response.statusText);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export function getCallCopilotConfig(
  accessToken: string,
  clientId: string
): Promise<CallCopilotConfig> {
  return request(accessToken, `${clientId}/call-copilot/config`, {
    method: "GET",
  });
}

export function getSttToken(
  accessToken: string,
  clientId: string
): Promise<SttToken> {
  return request(accessToken, `${clientId}/call-copilot/stt-token`, {
    method: "POST",
  });
}

export function proposeCallManagement(
  accessToken: string,
  clientId: string,
  debtorId: string,
  body: {
    sessionId: string;
    turns: TranscriptTurn[];
    callEnded?: boolean;
    durationSeconds?: number;
  }
): Promise<ProposeResponse> {
  return request(
    accessToken,
    `${clientId}/call-copilot/debtors/${debtorId}/propose`,
    { method: "POST", body }
  );
}

export function recordCallOutcome(
  accessToken: string,
  clientId: string,
  sessionId: string,
  body: { outcome: CallCopilotOutcome; proposalId?: string; trackId?: string }
): Promise<void> {
  return request(
    accessToken,
    `${clientId}/call-copilot/sessions/${sessionId}/outcome`,
    { method: "POST", body }
  );
}
