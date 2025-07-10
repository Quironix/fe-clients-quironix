import { DocumentType } from "@/app/dashboard/data";

export interface Payments {
  id?: string;
  debtor_id: string;
  company_id?: string | null;
  bank_movement_id?: string | null;
  bank_id?: string | null;
  ingress_type: string;
  document_type: DocumentType | null;
  payment_number: string;
  amount: number;
  received_at: string;
  due_at: string | null;
  balance: number;
  square: string;
  sender_account?: string;
  accounting_at?: string;
  bank_received: string;
  notes: string;
  deposit_at: string | null;
  debtor?: {
    id: string;
    name: string;
  };
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
