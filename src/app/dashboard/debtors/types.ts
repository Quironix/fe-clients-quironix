export interface Debtor {
  id?: string;
  name: string;
  companies?: CompanyDebtor[] | null;
  debtorCompanies?: DebtorCompany[];
  channel: string | null;
  communication_channel: string | null;
  debtor_code: string;
  addresses: Address[];
  dni: Dni;
  metadata: Metadatum[];
  currency: string;
  email: string;
  phone: string;
  payment_method: string | null;
  contacts: Contact[];
  category: string;
  economic_activities: string[];
  sales_person: string;
  attention_days_hours: string;
}

interface CompanyDebtor {
  id: string;
  debtor_code?: string | null;
}

export interface Contact {
  name: string;
  role: string;
  email: string;
  phone: string;
  channel?: string;
  function?: string;
}

export interface Metadatum {
  value: string;
  type: string;
}

export interface Dni {
  type: string;
  dni: string;
  emit_date: string;
  expiration_date: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_primary: boolean;
}

export enum BulkDebtorsSchema {
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

export interface DebtorCompany {
  id?: string;
  debtor_id: string;
  company_id: string;
  debtor_code: string | null;
  created_at?: string;
  updated_at?: string;
}
