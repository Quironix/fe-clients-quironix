export type DashboardType = "MANAGER" | "COLLECTION_MANAGER" | "EXECUTIVE";

export const DASHBOARD_TYPE_ORDER: DashboardType[] = [
  "MANAGER",
  "COLLECTION_MANAGER",
  "EXECUTIVE",
];

export const DASHBOARD_TYPE_LABELS: Record<DashboardType, string> = {
  MANAGER: "Manager",
  COLLECTION_MANAGER: "Jefe de Cobranza",
  EXECUTIVE: "Ejecutivo de Cobranza",
};

export interface TeamMemberRow {
  executiveId: string;
  executiveName: string;
  progressPercent: number;
  commitmentsFulfilledPercent: number;
  cashGenerated: number;
  contactPercent?: number;
}

export interface AgingBucket {
  bucket: string;
  amount: number;
}

export interface DebtorConcentrationItem {
  debtorId: string;
  debtorName: string;
  amount: number;
  share: number;
}

export interface TodayPriorityTask {
  id: string;
  debtorName: string;
  description: string;
  amount: number;
  priority: number;
}
