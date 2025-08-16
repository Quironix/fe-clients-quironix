// ===== ENUMS Y TYPES =====
export type PaymentFrequency =
  | "FREQ_7_DAYS"
  | "FREQ_15_DAYS"
  | "FREQ_30_DAYS"
  | "FREQ_60_DAYS"
  | "FREQ_90_DAYS"
  | "MONTHLY"
  | "WEEKLY"
  | "BIWEEKLY"
  | "QUARTERLY";

export type PaymentMethod =
  | "BANK_TRANSFER"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CASH"
  | "CHECK";

export type PaymentPlanStatus =
  | "APPROVED"
  | "REJECTED"
  | "PENDING"
  | "OBJECTED"
  | "OTHERS";

// ===== INTERFACES BASE =====
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
}

export interface Dni {
  id: string;
  type: string;
  dni: string;
  emit_date: null;
  expiration_date: null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

export interface Creator {
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

export interface Debtor {
  id: string;
  name: string;
  client_id: string;
  channel: null;
  debtor_code: string;
  addresses: Address[];
  payment_method: null;
  dni_id?: string;
  dni: Dni;
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

export interface Phase {
  id: string;
  invoice_id: string;
  invoice: null;
  phase: number;
  created_at: string;
  updated_at: string;
}

// ===== INTERFACES DE FACTURAS =====
export interface BaseInvoice {
  id: string;
  type: string;
  number: string;
  external_number: string | null;
  is_internal_document: boolean;
  amount: string;
  order_number: null;
  issue_date: string;
  is_fictitious: boolean;
  company_id: null;
  company: null;
  reference: null;
  file: string | null;
  due_date: string;
  operation_date: null;
  reception_date: null;
  folio: string;
  balance: string;
  litigation_balance: string;
  number_of_installments: number;
  observations: string | null;
  order_code: null | string;
  ref_1: null;
  ref_2: null;
  ref_3: null;
  ref_4: null;
  client_id: string;
  client: null;
  debtor_id: string;
  debtor: null;
  status: string;
  phases: Phase[];
  created_at: string;
  updated_at: string;
}

export interface OriginalInvoice extends BaseInvoice {
  payment_plan_id: null;
}

export interface InstallmentInvoice extends BaseInvoice {
  payment_plan_id: string;
}

export interface Invoice extends BaseInvoice {
  payment_plan_id: null;
}

// ===== INTERFACES DE HISTORIAL =====
export interface PlanConfiguration {
  totalDebt: number;
  initialPayment: number;
  paymentEndDate: string;
  paymentFrequency: string;
  paymentStartDate: string;
  installmentAmount: number;
  annualInterestRate: number;
  numberOfInstallments: number;
}

export interface Change {
  field: string;
  newValue: string;
  oldValue: string;
}

export interface Metadata {
  observation?: string;
  planConfiguration: PlanConfiguration;
}

export interface History {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  changes: Change[];
  metadata: Metadata;
}

// ===== INTERFACES PRINCIPALES =====
export interface PaymentPlan {
  id?: string;
  requestId: string;
  debtorId: string;
  clientId: string;
  status: string;
  totalDebt: number;
  installmentAmount: number;
  paymentStartDate: string;
  paymentEndDate: string;
  invoiceIds: string[];
  debtConcept: string;
  totalPlanAmount: number;
  initialPayment: number;
  numberOfInstallments: number;
  paymentFrequency: string;
  annualInterestRate: number;
  paymentMethod: string;
  planStartDate: string;
  createdBy: string;
  approvedBy: string;
  approvedAt: string;
  approvalComment?: string;
  rejectionComment?: string;
  objectedComment?: string;
  createdAt: string;
  updatedAt: string;
  installmentInvoices: InstallmentInvoice[];
  originalInvoices: OriginalInvoice[];
  debtor: Debtor;
  creator: Creator;
  approver: Creator;
  history: History[];
}

// PaymentPlanResponse es idéntica a PaymentPlan, así que usamos type alias
export type PaymentPlanResponse = PaymentPlan;

// ===== INTERFACES DE REQUEST =====
export interface CreatePaymentPlanRequest {
  id?: string;
  debtor_id: string;
  total_debt: number;
  installment_amount: number;
  payment_start_date: string;
  payment_end_date: string;
  invoice_ids: string[];
  debt_concept: string;
  total_plan_amount: number;
  initial_payment: number;
  number_of_installments: number;
  payment_frequency: string;
  annual_interest_rate: number;
  payment_method: string;
  plan_start_date: string;
}

export interface UpdatePaymentPlanRequest {
  id?: string;
  name?: string;
  description?: string;
  total_amount?: number;
  installment_amount?: number;
  number_of_installments?: number;
  annual_interest_rate?: number;
  payment_method?: string;
  start_date?: string;
  payment_start_date?: string;
  payment_end_date?: string;
  payment_frequency?: PaymentFrequency;
  end_date?: string;
  debtor_id?: string;
  type?: string;
  status?: PaymentPlanStatus;
  reason?: string;
  comments?: string;
  frequency?: PaymentFrequency;
  objected_comment?: string;
}

export interface ApprovePaymentPlanRequest {
  approval_comment?: string;
}

export interface RejectPaymentPlanRequest {
  rejection_comment?: string;
}

// ===== INTERFACES DE RESPONSE =====
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface PaymentPlansListResponse {
  success: boolean;
  message: string;
  data: PaymentPlan[] | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentPlanStatus | "OTHERS";
}

export interface PaginatedPaymentPlansResponse {
  success: boolean;
  message: string;
  data: PaymentPlan[] | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
