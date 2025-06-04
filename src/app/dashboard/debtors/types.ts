export interface Debtor {
  name: string;
  channel: string;
  debtor_code: string;
  addresses: Address[];
  dni: Dni;
  metadata: Metadatum[];
  currency: string;
  email: string;
  phone: string;
  contacts: Contact[];
  category: string;
  economic_activities: string[];
  sales_person: string;
  attention_days_hours: string;
}

export interface Contact {
  name: string;
  role: string;
  email: string;
  phone: string;
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
