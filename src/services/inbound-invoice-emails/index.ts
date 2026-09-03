const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type InboundInvoiceEmailStatus =
  | "MATCHED"
  | "PENDING_REVIEW"
  | "LINKED"
  | "DISCARDED";

export interface InboundInvoiceEmailAttachment {
  filename: string;
  content_type: string;
  size_bytes: number;
  storage_path: string;
  storage_url: string;
}

export type InboundEmailIntent =
  | "COMPROBANTE_PAGO"
  | "SOLICITUD_FACTURA"
  | "CONSULTA_DATOS_DE_PAGO"
  | "ACUSE_RECIBO_SIN_ACCION"
  | "CONTACTO_NO_VIGENTE"
  | "COMPROMISO_PAGO"
  | "OTRA";

export type InboundEmailAgentStatus =
  | "PENDING"
  | "ROUTED_TO_MATCHING"
  | "HANDLED_BY_AGENT"
  | "ESCALATED_TO_HUMAN";

export type InboundEmailRoute = "MATCHING" | "AGENT";

export interface InboundInvoiceEmail {
  id: string;
  client_id: string;
  debtor_id: string | null;
  from_address: string;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  attachments: InboundInvoiceEmailAttachment[];
  status: InboundInvoiceEmailStatus;
  matched_by: "FOLIO" | "DOMAIN" | "RUT" | "MANUAL" | null;
  matched_invoice_id: string | null;
  linked_invoice_id: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Router de intención (PRD_03). Poblados por el clasificador LLM en modo
  // sombra / Fase 2; opcionales mientras el bff termina de proxearlos.
  direction?: "IN" | "OUT";
  intent?: InboundEmailIntent | null;
  intent_secondary?: string[] | null;
  intent_confidence?: number | null;
  agent_status?: InboundEmailAgentStatus | null;
  agent_suggested_reply?: string | null;
  agent_guardrail_triggered?: boolean | null;
  agent_requires_contact_review?: boolean | null;
}

export interface InvoiceInbox {
  alias: string;
  address: string;
}

// Un correo cuenta como "vinculado" tanto si lo vinculó un ejecutivo (LINKED)
// como si lo auto-vinculó la cascada de matching (MATCHED). Ambos tienen
// debtor_id seteado y son estados terminales.
export const isEmailLinked = (email: Pick<InboundInvoiceEmail, "status">) =>
  email.status === "LINKED" || email.status === "MATCHED";

// El router de intención (PRD_03) parte cada correo en dos rutas: los
// comprobantes de pago van a la cascada de matching, el resto lo toma el
// agente. Un correo sin intención clasificada (router apagado o bff sin
// proxear todavía) se trata como "resto" para que siga visible.
export const emailRoute = (
  email: Pick<InboundInvoiceEmail, "intent">,
): InboundEmailRoute =>
  email.intent === "COMPROBANTE_PAGO" ? "MATCHING" : "AGENT";

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

export async function getInboundInvoiceEmails(
  accessToken: string,
  clientId: string,
  status?: InboundInvoiceEmailStatus,
): Promise<InboundInvoiceEmail[]> {
  const params = status ? `?status=${status}` : "";
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/inbound-invoice-emails${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return handleResponse<InboundInvoiceEmail[]>(response);
}

export async function linkInboundInvoiceEmail(
  accessToken: string,
  clientId: string,
  id: string,
  data: { debtorId: string; invoiceId?: string },
): Promise<InboundInvoiceEmail> {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/inbound-invoice-emails/${id}/link`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  return handleResponse<InboundInvoiceEmail>(response);
}

export async function getInvoiceInbox(
  accessToken: string,
  clientId: string,
): Promise<InvoiceInbox> {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/invoice-inbox`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return handleResponse<InvoiceInbox>(response);
}
