export interface Client {
  id: string;
  name: string;
  dni_type: null;
  dni_number: null;
  country_id: string;
  operational_id: string;
  contract: string;
  terms_and_conditions: string;
  signature: null;
  signature_date: null;
  type: string;
  language: string;
  taxes: any[];
  email: null;
  phone_number: null;
  category: null;
  currency: null;
  status: string;
  addresses: any[];
  contacts: Contact[];
  logo_url: null;
  created_at: string;
  updated_at: string;
  companies: any[];
  operational: Operational;
  country: Country;
  subscriptions: Subscription[];
  plan_id?: string;
}

export interface Subscription {
  id: string;
  plan_id: string;
  client_id: string;
  currency: string;
  start_at: string;
  end_at: string;
  billing_cycle: string;
  created_at: string;
  updated_at: string;
  status: string;
  plan: Plan;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  currency: string;
  monthly_price: string;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  name: string;
  iso: string;
  tax_rate: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Operational {
  id: string;
  erp_code: null;
  logo_url: null;
  decimals: number;
  segmentation: string;
  dbt: string;
  automatic_nettings_process: boolean;
  amount_from: number;
  amount_to: number;
  committed_amount_tolerance: number;
  days_tolerance: number;
  extension_request_period: number;
  annual_extensions_per_debtor: number;
  maximum_extension_period: number;
  client_id: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  first_name: string;
  last_name: string;
  email: string;
}
