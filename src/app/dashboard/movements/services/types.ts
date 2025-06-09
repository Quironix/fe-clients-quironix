export interface MovementRequest {
  client_bank_id: string;
  movement_date: string;
  description: string;
  amount: number;
  movement_number?: number;
  comment?: string;
  sender_bank?: string;
  sender_name?: string;
  sender_id?: string;
  sender_account_number?: string;
}

export interface Movement {
  id: string;
  client_id: string;
  client_bank_id: string;
  bank_information: BankInformation;
  movement_date: Date;
  description: string;
  amount: number;
  comment: null;
  sender_bank: string;
  movement_number: null;
  sender_name: string;
  sender_id: string;
  sender_account_number: string;
  ingress_type: string;
  created_at: Date;
  updated_at: Date;
  metadata: Metadata;
}

export interface BankInformation {
  id: string;
  name: string;
  client_id: string;
  bank: string;
  currency: string;
  account_number: string;
  ledger_account: null;
  bank_provider: null;
  created_at: Date;
  updated_at: Date;
}

export interface Metadata extends Record<string, unknown> {}

export interface SenderAccount {
  number: string;
  holder_id: string;
  holder_name: string;
  institution: Institution;
}

export interface Institution {
  id: string;
  name: string;
  country: string;
}
