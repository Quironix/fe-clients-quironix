export type TranscriptSpeaker = "EXECUTIVE" | "DEBTOR";

export interface TranscriptTurn {
  speaker: TranscriptSpeaker;
  text: string;
}

export interface CallProposalInvoice {
  id: string;
  number: string;
  balance: number;
}

export type CallProposalScenario =
  | "DEPOSIT_PROMISE"
  | "COMPLETE_PAYMENT"
  | "PARTIAL_PAYMENT"
  | "NO_ANSWER"
  | "OTHER_INVOICES";

export interface CallProposal {
  id: string;
  scenario: CallProposalScenario;
  label: string;
  managementType: "CALL_OUT";
  debtorComment: string;
  executiveComment: string;
  caseData: Record<string, string | number>;
  invoices: CallProposalInvoice[];
  nextManagementDate: string | null;
  observation: string;
  confidence: number;
  reviewReasons: string[];
  executiveCommentOptions?: string[];
}

export interface CallCopilotConfig {
  enabled: boolean;
}

export interface SttToken {
  token: string;
  expires_in: number;
}

export interface ProposeResponse {
  summary: string | null;
  proposals: CallProposal[];
}

export type CallCopilotOutcome = "ACCEPTED" | "EDITED" | "DISCARDED" | "MANUAL";
