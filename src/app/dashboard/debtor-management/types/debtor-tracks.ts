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
