
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
  invoice_number: string
  name:string
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
  dateFrom?: string;
  dateTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
}