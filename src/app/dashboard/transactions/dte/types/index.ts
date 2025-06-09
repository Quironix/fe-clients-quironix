export interface DTE {
  id?: string;
  type: string;
  number: string;
  external_number: string;
  amount: number;
  order_number: string;
  issue_date: string;
  due_date: string;
  operation_date: string;
  reception_date: string;
  folio: boolean;
  number_of_installments: string;
  ref_1: string;
  ref_2: string;
  ref_3: string;
  ref_4: string;
  debtor_id: string;
}

export enum BulkSchema {
  DEBTORS = "DEBTORS",
  MOVEMENTS = "MOVEMENTS",
  INVOICES = "INVOICES",
  PAYMENTS = "PAYMENTS",
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
