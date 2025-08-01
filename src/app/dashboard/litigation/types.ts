
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
  id: string;
  invoice_id: string;
  invoice?: {
    id: string;
    type: string;
    number: string;
    external_number: string;
    is_internal_document: boolean;
    amount: string;
    order_number: string;
    issue_date: string;
    is_fictitious: boolean;
    company_id: string | null;
    company: any;
    reference: string;
    file: any; 
    due_date: string;
    operation_date: string;
    reception_date: string;
    folio: string;
    balance: string;
    litigation_balance: string;
    number_of_installments: number;
    observations: string;
    order_code: string;
    ref_1: string;
    ref_2: string;
    ref_3: string;
    ref_4: string;
    client_id: string;
    client: any;
    debtor_id: string;
    debtor: any;
    status: string;
    phases: any[];
    created_at: string;
    updated_at: string;
    payment_plan_id: string | null;
  };
  litigation_amount: number;
  motivo: string;
  submotivo: string;
  contact: string;
  normalization_reason: string | null;
  normalization_by_contact: string | null;
  created_by: string;
  creator: {
    id: string;
    first_name: string;
    last_name: string;
    client_id: string;
    type: string;
    email: string;
    phone_number: string | null;
    created_at: string;
    updated_at: string;
  };
  approved_by: string | null;
  debtor: {
    id: string;
    name: string;
    client_id: string;
    channel: string | null;
    debtor_code: string;
    addresses: {
      street: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      postal_code: string | null;
      is_primary: boolean;
    }[];
    payment_method: string;
    dni_id: string;
    currency: string;
    email: string | null;
    phone: string | null;
    communication_channel: string | null;
    contacts: {
      name: string;
      role: string;
      email: string;
      phone: string;
      channel: string;
      function: string;
    }[];
    category: string | null;
    economic_activities: any[];
    sales_person: any;
    attention_days_hours: {
      day: string;
      hour_start: string;
      hour_end: string;
    }[];
    executive_id: string | null;
    created_at: string;
    updated_at: string;
  company_id: string | null;
  company: any;
  comments: any[];
}

  
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