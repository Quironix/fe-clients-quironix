import type { TrackEmailMessage } from "@/app/dashboard/debtor-management/types/debtor-tracks";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type { TrackEmailMessage };

export interface GetInboundEmailRepliesFilters {
  agentStatus?:
    | "PENDING"
    | "HANDLED_BY_AGENT"
    | "ESCALATED_TO_HUMAN"
    | "SHADOW_ONLY";
  read?: boolean;
  search?: string;
  direction?: "IN" | "OUT";
  page?: number;
  limit?: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (Array.isArray(error?.message) ? error.message[0] : error?.message) ||
        `Error ${response.status}`,
    );
  }
  return response.json();
}

export type EmailChannel = "FINANZAS" | "COBRANZA";

export interface EmailOriginal {
  html: string | null;
  text: string | null;
  has_external_images: boolean;
}

const EMAIL_RESOURCE_BY_CHANNEL: Record<EmailChannel, string> = {
  FINANZAS: "inbound-invoice-emails",
  COBRANZA: "inbound-email-replies",
};

export async function getEmailOriginal(
  accessToken: string,
  clientId: string,
  channel: EmailChannel,
  id: string,
): Promise<EmailOriginal> {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/${EMAIL_RESOURCE_BY_CHANNEL[channel]}/${id}/original`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const original = await handleResponse<
    EmailOriginal | { message?: string }
  >(response);
  if (!("html" in original)) {
    throw new Error(original.message || "Error al cargar el correo original");
  }
  return original;
}

export async function resolveInboundEmailReply(
  accessToken: string,
  clientId: string,
  id: string,
  resolved: boolean,
): Promise<TrackEmailMessage> {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/inbound-email-replies/${id}/resolve`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resolved }),
    },
  );
  return handleResponse<TrackEmailMessage>(response);
}

export async function getInboundEmailReplies(
  accessToken: string,
  clientId: string,
  filters?: GetInboundEmailRepliesFilters,
): Promise<TrackEmailMessage[]> {
  const f = filters ?? {};
  const qs = new URLSearchParams();
  if (f.agentStatus) qs.set("agent_status", f.agentStatus);
  if (f.read !== undefined) qs.set("read", String(f.read));
  if (f.search) qs.set("search", f.search);
  if (f.direction) qs.set("direction", f.direction);
  if (f.page) qs.set("page", String(f.page));
  if (f.limit) qs.set("limit", String(f.limit));
  const params = qs.toString() ? `?${qs.toString()}` : "";
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/inbound-email-replies${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return handleResponse<TrackEmailMessage[]>(response);
}
