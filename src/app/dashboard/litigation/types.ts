export interface Litigation {
  invoice_number: string;
  number: string;
  debtor_id: string;
  company_id?: string | null;
  name: string;
  date: string;
  disputeDays: string;
  approver: string;
  reason: string;
  subreason: string;
  amount: number;
  invoiceAmount: number;
  litigationAmount: number;
  bank_information: {
    bank: string;
    account_number: string;
  };
  status: LitigationMovementStatusEnum;
  code: string;
  description: string;
  comment: string;
}

export interface BulkUploadError {
  row: number;
  value: any;
  column: string;
  message: string;
}

export interface BulkUploadResponse {
  id: string;
  clientId: string;
  validCount: number;
  totalCount: number;
  invalidCount: number;
  errors: BulkUploadError[];
  createdAt: string;
  updatedAt: string;
  schema: string;
  success?: boolean;
  message?: string;
}
interface Executive {
  id: string;
  first_name: string;
  last_name: string;
  client_id: string;
  type: string;
  email: string;
  phone_number: null;
  created_at: string;
  updated_at: string;
}

export interface LitigationCompany {
  id?: string;
  debtor_id: string;
  company_id: string;
  debtor_code: string | null;
  created_at?: string;
  updated_at?: string;
  invoice_number: string;
  name: string;
}
export enum LitigationMovementStatusEnum {
  PENDING = "Pendiente",
  PROCESSED = "Procesado",
  REJECTED = "Rechazado",
  ELIMINATED = "Eliminado",
  COMPENSATED = "Compensado",
  REJECTED_DUPLICATE = "Rechazado duplicado",
  ELIMINATED_NEGATIVE_AMOUNT = "Eliminado monto negativo",
  ELIMINATED_NO_TRACKING = "Eliminado sin tracking",
  MAINTAINED = "Mantenido",
}

export interface LitigationFilters {
  search?: string;
  status?: string;
  company?: string;
  motivo?: string;
}

export interface LitigationItem {
  id: string;
  invoice_id: string;
  invoice: Invoice;
  litigation_amount: number;
  description: null;
  motivo: string;
  submotivo: string;
  contact: string;
  status: string;
  normalization_reason: null;
  normalization_by_contact: null;
  created_by: string;
  creator: Creator | null;
  approved_by: null;
  approver: Creator | null;
  debtor_id: string;
  debtor: Debtor;
  company_id: null;
  company: null;
  client_id: string;
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  user: Creator;
  content: string;
  client_id: string;
  is_important: boolean;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

interface Debtor {
  id: string;
  name: string;
  client_id: string;
  channel: null;
  debtor_code: string;
  addresses: Address[];
  payment_method: null;
  dni: Dni;
  dni_id: string;
  currency: string;
  email: string;
  phone: string;
  communication_channel: string;
  contacts: Contact[];
  category: null;
  economic_activities: string[];
  sales_person: string;
  attention_days_hours: any[];
  executive_id: null;
  created_at: string;
  updated_at: string;
}

interface Contact {
  name: string;
  email: string;
  phone: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
}

interface Creator {
  id: string;
  first_name: string;
  last_name: string;
  client_id: string;
  type: string;
  email: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

interface Invoice {
  id: string;
  type: string;
  number: string;
  external_number: string;
  is_internal_document: boolean;
  amount: string;
  order_number: null;
  issue_date: string;
  is_fictitious: boolean;
  company_id: null;
  company: null;
  reference: null;
  file: string;
  due_date: string;
  operation_date: null;
  reception_date: null;
  folio: string;
  balance: string;
  litigation_balance: string;
  number_of_installments: number;
  observations: null;
  order_code: string;
  ref_1: null;
  ref_2: null;
  ref_3: null;
  ref_4: null;
  client_id: string;
  client: null;
  debtor_id: string;
  debtor: null;
  status: string;
  phases: any[];
  created_at: string;
  updated_at: string;
  payment_plan_id: null;
}

interface Dni {
  id: string;
  type: string;
  dni: string;
  emit_date: null;
  expiration_date: null;
  created_at: string;
  updated_at: string;
}

export interface LitigationFilters {
  search?: string;
  status?: string;
  // Alias para compatibilidad con el servicio API
  createdAtFrom?: string;
  createdAtTo?: string;
}
