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
}

export interface CaseData {
  debtorComment?: string;
  litigationIds?: string[];
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
  };
}

export interface InvoiceTracksParams {
  page: number;
  limit: number;
}

export interface InvoiceTracksResponse {
  data: InvoiceWithTrack[];
  pagination: PaginationMeta;
}
