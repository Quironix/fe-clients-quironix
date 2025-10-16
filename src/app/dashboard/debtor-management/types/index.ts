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
}

export interface PaymentCommitment {
  fulfilled: number;
  unfulfilled: number;
}

export interface CollectionProfile {
  call_reasons: CallReasons;
  payment_commitment: PaymentCommitment;
}
