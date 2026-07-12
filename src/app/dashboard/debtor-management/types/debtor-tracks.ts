export interface DebtorTracksParams {
  page: number;
  limit: number;
  status?: string;
  type?: string;
  result?: string;
  executive_id?: string;
  contact_date_from?: string;
  contact_date_to?: string;
}

export interface Executive {
  id: string;
  first_name: string;
  last_name: string;
  client_id: string;
  type: string;
  email: string;
  phone_number: string;
  sip_code: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  type: "EMAIL" | "PHONE" | "WHATSAPP" | "SMS" | "LETTER";
  value: string;
  name?: string; // Opcional: nombre del contacto enriquecido en el frontend
}

export interface Collector {
  name?: string;
  channel?: string;
}

export interface CaseData {
  debtorComment?: string;
  litigationIds?: string[];
  collector?: Collector;
  [key: string]: any;
}

export interface Invoice {
  id: string;
  [key: string]: any;
}

export interface DebtorTrack {
  id: string;
  clientId: string;
  debtorId: string;
  managementType: string;
  executiveId: string;
  executive: Executive;
  contact: Contact;
  debtorComment: string;
  executiveComment: string;
  observation: string;
  nextManagementDate: string;
  caseData?: CaseData;
  metadata: Record<string, any>;
  invoiceIds: string[];
  invoices: Invoice[];
  createdAt: string;
  updatedAt: string;
  documentNumber?: string;
  order_code?: string;
  numberOfInstallments?: number;
  daysOverdue?: number;
  amount?: number;
  documentPhase?: string;
  timeInPhase?: string;
  paymentCommitmentDate?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface DebtorTracksResponse {
  data: DebtorTrack[];
  pagination: PaginationMeta;
}

export interface InvoicePhase {
  id: string;
  invoice_id: string;
  invoice: null;
  phase: number;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithTrack {
  id: string;
  type: string;
  number: string;
  external_number: string;
  is_internal_document: boolean;
  amount: string;
  order_number: string | null;
  issue_date: string;
  is_fictitious: boolean;
  company_id: string | null;
  reference: string | null;
  file: string;
  due_date: string;
  operation_date: string | null;
  reception_date: string | null;
  folio: string;
  balance: string;
  litigation_balance: string;
  number_of_installments: number;
  observations: string;
  order_code: string;
  ref_1: string | null;
  ref_2: string | null;
  ref_3: string | null;
  ref_4: string | null;
  client_id: string;
  debtor_id: string;
  debtor_code: string;
  status: string;
  created_at: string;
  updated_at: string;
  payment_plan_id: string | null;
  phases: InvoicePhase[];
  track: {
    id: string;
    clientId: string;
    debtorId: string;
    managementType: string;
    executiveId: string;
    executive: Executive;
    contact: Contact;
    debtorComment: string;
    executiveComment: string;
    observation: string;
    nextManagementDate: string;
    caseData: CaseData;
    metadata: Record<string, any>;
    invoiceIds: string[];
    invoices: any[];
    createdAt: string;
    updatedAt: string;
    attachments?: { filename: string; storage_url: string }[];
    emailSubject?: string;
    emailBody?: string;
  };
  // Cuando un mismo track agrupa varias facturas (envío batch del
  // collector), acá quedan las filas por factura originales para poder
  // sumar montos y contar documentos en el hilo de correo.
  batchInvoices?: InvoiceWithTrack[];
  // Números de documento de las facturas del track, cuando la fila
  // (por ejemplo un correo entrante) agrupa más de una factura y por lo
  // tanto no puede mostrar un único N° Documento.
  batchInvoiceNumbers?: string[];
}

export interface EmailMessageAttachment {
  filename: string;
  content_type: string;
  size_bytes: number;
  storage_path: string;
  storage_url: string;
}

export interface TrackEmailMessage {
  id: string;
  direction: "IN" | "OUT";
  client_id: string;
  debtor_id: string;
  from_address: string;
  subject?: string | null;
  body_text?: string | null;
  body_html?: string | null;
  track_id?: string | null;
  attachments?: EmailMessageAttachment[];
  to_addresses?: string[] | null;
  template_id?: string | null;
  sent_by_executive_id?: string | null;
  created_at: string;
}

export interface InvoiceTracksParams {
  page: number;
  limit: number;
  search?: string;
}

export interface InvoiceTracksResponse {
  data: InvoiceWithTrack[];
  pagination: PaginationMeta;
}
