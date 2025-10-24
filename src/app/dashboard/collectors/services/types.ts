export interface CollectorSegmentation {
  applicable_segment: string;
  min_delay_days: number;
  frequency: string;
  exclusions: {
    exclude_weekends?: boolean;
    exclude_holidays?: boolean;
    exclude_cash_documents?: boolean;
    exclude_protested_checks?: boolean;
    exclude_promissory_notes?: boolean;
    exclude_credit_notes?: boolean;
  };
  schedule: {
    preferred_time: string;
    timezone: string;
  };
}

export interface CreateCollectorRequest {
  name: string;
  description: string;
  frequency: string;
  channel: "EMAIL" | "WHATSAPP" | "SMS";
  status: boolean;
  debt_phases: number[];
  subject: string;
  body_message: string;
  send_associate_invoices: boolean;
  segmentations: CollectorSegmentation[];
}

export interface CollectorResponse {
  id: string;
  name: string;
  description: string;
  frequency: string;
  channel: string;
  status: boolean;
  debt_phases: number[];
  subject: string;
  body_message: string;
  send_associate_invoices: boolean;
  segmentations: CollectorSegmentation[];
  created_at: string;
  updated_at: string;
}
