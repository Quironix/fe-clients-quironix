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
  matched_by: "EMAIL" | "MANUAL" | null;
  linked_invoice_id: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface InvoiceInbox {
  alias: string;
  address: string;
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
