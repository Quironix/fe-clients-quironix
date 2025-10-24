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
    timezone?: string;
    preferred_days?: string[];
  };
}

export interface CreateCollectorRequest {
  name: string;
  description: string;
  frequency: string;
  channel: "EMAIL" | "WHATSAPP" | "SMS";
  status: boolean;
  debtPhases: number[];
  subject: string;
  bodyMessage: string;
  sendAssociateInvoices: boolean;
  segmentations: CollectorSegmentation[];
}

export interface UpdateCollectorRequest {
  name?: string;
  description?: string;
  frequency?: string;
  channel?: "EMAIL" | "WHATSAPP" | "SMS";
  status?: boolean;
  debtPhases?: number[];
  subject?: string;
  bodyMessage?: string;
  sendAssociateInvoices?: boolean;
  segmentations?: CollectorSegmentation[];
}

export interface CollectorResponse {
  id: string;
  clientId: string;
  name: string;
  description: string;
  frequency: string;
  channel: string;
  status: boolean;
  debtPhases: number[];
  subject: string;
  bodyMessage: string;
  sendAssociateInvoices: boolean;
  segmentations: CollectorSegmentation[];
  createdAt: string;
  updatedAt: string;
}
