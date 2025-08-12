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
  name?: string;
  description?: string;
  total_amount?: number;
  number_of_installments?: number;
  installment_amount?: number;
  start_date?: string;
  end_date?: string;
  frequency?: PaymentFrequency;
  status?: PaymentPlanStatus;
  debtor_id?: string;
}

export interface ApprovePaymentPlanRequest {
  comments?: string;
}

export interface RejectPaymentPlanRequest {
  rejected_date?: string;
  rejected_by?: string;
  rejection_reason: string;
  comments?: string;
}

export interface PaymentPlan {
  id: string;
  requestId: string;
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
  payment_frequency: PaymentFrequency;
  annual_interest_rate: number;
  payment_method: PaymentMethod;
  plan_start_date: string;
  status?: PaymentPlanStatus;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentPlanResponse {
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
  createdAt: string;
  updatedAt: string;
  debtor: Debtor;
  history: any[];
  rejectionReason?: string;
  rejectedDate?: string;
  rejectedBy?: string;
  originalInvoices: Invoice[];
}

export interface Invoice {
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
  payment_plan_id: null;
}

interface Phase {
  id: string;
  invoice_id: string;
  invoice: null;
  phase: number;
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
interface Dni {
  id: string;
  type: string;
  dni: string;
  emit_date: null;
  expiration_date: null;
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
