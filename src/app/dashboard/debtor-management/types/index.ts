export interface CallReasons {
  unfulfilled_commitment: {
    amount: number;
  };
  overdue_debt: {
    amount: number;
    percent: number;
  };
  upcoming_maturities: {
    amount: number;
  };
  protested_checks: {
    quantity: number;
    amount: number;
  };
  open_litigations: {
    quantity: number;
    amount: number;
  };
  cash_estimate: {
    collected_amount: number;
    projected_amount: number;
  };
  credit_risk_summary: {
    current_credit: number;
    available_credit: number;
    risk_category: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
    has_credit_line: boolean;
  };
}

export interface CommitmentDetail {
  date: string;
  amount: number;
  status: "completed" | "incomplete";
  description?: string;
  invoice_number?: string;
}

export interface PaymentCommitment {
  credibility: {
    percentage: number;
    complete: number;
    incomplete: number;
  };
  latest_commitments: CommitmentDetail[];
}

export interface CollectionProfile {
  call_brief?: string;
  call_reasons: CallReasons;
  payment_commitment: PaymentCommitment;
  protested_checks?: any[];
  last_payment_received?: any;
  litigations?: any;
  management?: any;
}
