export interface EmailInvoice {
  type: string;
  number: string;
  issue_date: string;
  due_date: string;
  due_days: string;
  amount: string;
  balance: string;
  rut_emisor: string;
  phase: string;
}

export interface EmailDynamicTemplateData {
  subject?: string;
  logo_client: string;
  name_client: string;
  body_description: string;
  header_text: string;
  header_amount: string;
  is_invoices: boolean;
  invoices: EmailInvoice[];
  is_factoring: boolean;
  body_html: string;
  contact_phone: string;
  contact_email: string;
  contact_mail?: string;
  bank_account_info?: string;
  amount?: string;
  date?: string;
  email_company?: string;
}

export interface EmailPayload {
  /**
   * Recipient(s). The backend (services-quironix SendManagementEmailDto)
   * accepts either a single email or a non-empty array — see
   * PRD_contactos_del_deudor.md O3.
   */
  to: string | string[];
  templateId: string;
  subject?: string;
  from?: {
    name?: string;
  };
  personalizations?: Array<{
    to: Array<{ email: string }>;
    subject: string;
    dynamicTemplateData: EmailDynamicTemplateData | any;
  }>;
  dynamicTemplateData: EmailDynamicTemplateData;
  trackId?: string;
  attachments?: EmailAttachment[];
  management?: { debtorComment: string; executiveComment: string };
}

export interface EmailResponse {
  success: boolean;
  message: string;
}

export interface EmailAttachment {
  /** Base64-encoded file content — no data URI prefix. */
  content: string;
  /** MIME type, e.g. "image/png", "application/pdf". */
  type: string;
  /** File name shown to the recipient, e.g. "evidencia.png". */
  filename: string;
  /** "attachment" (downloadable) or "inline". Defaults to "attachment". */
  disposition?: "attachment" | "inline";
}
