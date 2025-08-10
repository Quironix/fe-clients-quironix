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
  success: boolean;
  message: string;
  data: PaymentPlan | null;
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
  | "PENDING"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "DEFAULTED";
