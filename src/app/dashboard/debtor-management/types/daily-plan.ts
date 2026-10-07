export type TaskEngineMode = "legacy" | "shadow" | "obligations";

export type DailyPlanTab =
  | "CRITICAL"
  | "CASH_GENERATION"
  | "LITIGATION"
  | "TECHNICAL_FILE"
  | "ALL";

export interface DailyPlanItem {
  taskId: string;
  debtorId: string;
  debtor: { name: string; debtorCode: string | null };
  executiveId: string | null;
  workflowClass: "COBRANZA" | "LITIGIO";
  band: number | null;
  reasonCode: string | null;
  overdueAmount: string;
  planPosition: number | null;
  invoiceProgress: { withResult: number; total: number };
}

export interface DailyPlanResponse {
  asOf: string;
  total: number;
  countsByReason: Record<string, number>;
  countsByTab: Record<DailyPlanTab, number>;
  unassignedCount?: number;
  items: DailyPlanItem[];
  pagination: { page: number; limit: number; totalPages: number };
}

export interface DailyPlanParams {
  tab: DailyPlanTab;
  page: number;
  limit: number;
}
