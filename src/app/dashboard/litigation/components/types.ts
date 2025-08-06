export interface Debtors {
  id: string;
  name: string;
  company_id: null;
  companies?: Company[] | null;
  client_id: string;
  channel: string;
  debtor_code: null;
  addresses: any[];
  dni_id: string;
  dni: Dni;
  currency: string;
  email: string;
  phone: string;
  contacts: Contact[];
  category: null;
  economic_activities: any[];
  sales_person: null;
  attention_days_hours: null;
  executive_id: string;
  executive: Executive;
  created_at: string;
  updated_at: string;
  invoice_number: string
}

interface Company {
  id: string;
  debtor_code?: string;
  invoice_number: string
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

interface Contact {
  name: null;
  email: string;
  phone: string;
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
