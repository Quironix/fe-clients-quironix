export interface BankInformation {
  id: string;
  name: string;
  client_id: string;
  bank: string;
  currency: null;
  account_number: string;
  ledger_account: string;
  bank_provider: BankProviderEnum | null;
  created_at: Date;
  updated_at: Date;
}

export interface BankInformationRequest {
  bank: string;
  account_number: string;
  ledger_account?: string;
}

export interface BankProvider {
  id: string;
  provider: BankProviderEnum;
  provider_config: Record<string, any>;
  bank_information_id: string;
  bank_information: BankInformation | null;
  created_at: string;
  updated_at: string;
}

export enum BankProviderEnum {
  FINTOC = "FINTOC",
}
