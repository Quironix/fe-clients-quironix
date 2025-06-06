import { Step } from "@/components/Stepper/types";

export interface StepLayoutProps {
  children: React.ReactNode;
}

export interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStep: number;
  steps: Step[];
  onStepChange: (step: number) => void;
  profile: UserProfile;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  client_id: string;
  type: string;
  roles: Role[];
  email: string;
  phone_number: string;
  client: Client;
  created_at: string;
  updated_at: string;
}

export type ClientStatus = "INVITED" | "VALIDATED" | "SIGNED";

export interface Client {
  id: string;
  name: string;
  dni_type: null;
  dni_number: null;
  country_id: string;
  country: Country;
  operational_id: string;
  type: string;
  language: string;
  taxes: any[];
  email: null;
  phone_number: null;
  category: null;
  currency: null;
  status: ClientStatus;
  addresses: any[];
  contacts: Contact[];
  logo_url: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  subscriptions: Subscription[];
  terms_and_conditions?: string;
  contract?: string;
  operational?: {
    logo_url: string | null;
    decimals: number | null;
    erp_code: string | null;
    segmentation: {
      low: number | null;
      medium: number | null;
      high: number | null;
    };
    dbt: {
      low: number | null;
      medium: number | null;
      high: number | null;
    };
    automatic_nettings_process: boolean | null;
    amount_from: number | null;
    amount_to: number | null;
    committed_amount_tolerance: number | null;
    days_tolerance: number | null;
  };
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

export interface Country {
  id: string;
  name: string;
  iso: string;
  tax_rate: number;
  currency: string;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  currency: string;
  monthly_price: string;
  created_at: string;
  updated_at: string;
  system_resources: Systemresource[];
}

export interface Systemresource {
  id: string;
  name: string;
  description: string;
  key: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  first_name: string;
  last_name: string;
  email: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  scopes: string[];
}
