// export interface PaymentNetting {
//   id: string;
//   amount: number;
//   bank_information: {
//     name: string;
//     bank: string;
//     account_number: string;
//   };
//   status: BankMovementStatusEnum;
//   code: string;
//   description: string;
//   comment: string;
//   created_at: any;
// }

export interface PaymentNetting {
  id: string;
  client_id: string;
  client: Client;
  client_bank_id: string;
  bank_information: Bankinformation;
  movement_date: string;
  status: BankMovementStatusEnum;
  description: string;
  company_id: string;
  company: Company;
  amount: string;
  comment: null;
  sender_bank: null;
  movement_number: null;
  sender_name: null;
  sender_id: null;
  sender_account_number: null;
  ingress_type: string;
  created_at: string;
  updated_at: string;
  metadata: null;
  square: string;
  debtor_suggestions: null;
  payment: Payment;
}

interface Payment {
  id: string;
  client_id: string;
  debtor_id: string;
  company_id: string;
  debtor: Debtor;
  bank_movement_id: string;
  bank_id: string;
  ingress_type: string;
  document_type: string;
  payment_number: null;
  amount: number;
  bank_received: string;
  received_at: string;
  due_at: null;
  balance: number;
  notes: null;
  deposit_at: string;
  square: string;
  created_at: string;
  updated_at: string;
  accounting_at: null;
  sender_account: null;
  phases: any[];
}

interface Debtor {
  id: string;
  name: string;
  client_id: string;
  channel: string;
  debtor_code: string;
  addresses: Address[];
  payment_method: string;
  dni_id: string;
  currency: string;
  email: string;
  phone: string;
  communication_channel: string;
  contacts: any;
  category: null;
  economic_activities: string[];
  sales_person: string;
  attention_days_hours: any[];
  executive_id: null;
  created_at: string;
  updated_at: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface Company {
  id: string;
  name: string;
  dni_type: string;
  dni_number: string;
  client_id: string;
  client_code: string;
  address: Address[];
  contacts: Contact[];
  category: string;
  created_at: string;
  updated_at: string;
}

interface Bankinformation {
  id: string;
  name: null;
  client_id: string;
  bank: string;
  currency: null;
  account_number: string;
  ledger_account: string;
  bank_provider: null;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  name: string;
  contract: string;
  type: string;
  email: null;
  phone_number: null;
  category: string;
  currency: string;
  operational_id: string;
  addresses: any[];
  contacts: Contact[];
  country_id: string;
  created_at: string;
  updated_at: string;
  terms_and_conditions: string;
  signature: string;
  signature_date: string;
  status: string;
  taxes: any[];
  language: string;
  dni_type: string;
  dni_number: string;
}

interface Contact {
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  phone: string;
  type_contact: string[];
  is_default: boolean;
}

export interface PaymentNettingFilters {
  search?: string;
  status?: string;
  company?: string;
  dateFrom?: string;
  dateTo?: string;
  // Alias para compatibilidad con el servicio API
  createdAtFrom?: string;
  createdAtTo?: string;
  // Nuevos parámetros para búsqueda específica
  amount?: string;
  description?: string;
}

export interface PaymentNettingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaymentNettingResponse {
  data: PaymentNetting[];
  pagination: PaymentNettingPagination;
}

// BORRAR \/

export type PaymentData = {
  id: string;
  estado: string;
  importe: number;
  banco: string;
  numeroCuenta: string;
  codigo: string;
  fecha: string;
  descripcion: string;
  comentario: string;
};

export enum BankMovementStatusEnum {
  PENDING = "Pendiente",
  PROCESSED = "Procesado",
  REJECTED = "Rechazado",
  ELIMINATED = "Eliminado",
  COMPENSATED = "Compensado",
  REJECTED_DUPLICATE = "Rechazado duplicado",
  ELIMINATED_NEGATIVE_AMOUNT = "Eliminado monto negativo",
  ELIMINATED_NO_TRACKING = "Eliminado sin tracking",
  MAINTAINED = "Mantenido",
  PAYMENT_CREATED = "Pago creado",
}
