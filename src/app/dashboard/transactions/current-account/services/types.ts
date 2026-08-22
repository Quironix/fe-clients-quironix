export type AccountStatementStatus = "open" | "closed" | "all";

export interface InvoiceStatementRow {
  row_type: "INVOICE";
  id: string;
  document_type: string;
  number: string;
  issue_date: string;
  due_date: string;
  amount: number;
  balance: number;
  status: "open" | "closed";
  applications_count: number;
  is_credit_or_debit_note: boolean;
  /** Only populated by the "todos los deudores" consolidated view. */
  debtor_id?: string;
  debtor_name?: string;
  debtor_code?: string;
  order_number?: string | null;
}

export interface ApplicationStatementRow {
  row_type: "APPLICATION";
  id: string;
  invoice_id: string;
  payment_id: string | null;
  payment_number: string | null;
  applied_at: string;
  amount_applied: number;
}

export interface PaymentRemainderStatementRow {
  row_type: "PAYMENT_REMAINDER";
  id: string;
  payment_date: string;
  payment_amount: number;
  remaining_balance: number;
  status: "open" | "closed";
}

export type AccountStatementRow =
  | InvoiceStatementRow
  | ApplicationStatementRow
  | PaymentRemainderStatementRow;

export interface AccountStatementPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AccountStatementResponse {
  data: AccountStatementRow[];
  pagination: AccountStatementPaginationMeta;
}
