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
  trend?: number[];
  ranking?: number;
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
  debtorId?: string;
  debtorName: string;
  description: string;
  amount: number;
  priority: number;
}

export interface TaskProgressData {
  completed: number;
  pending: number;
  total: number;
  progress_percent: number;
}

export interface CommitmentsSummaryData {
  totalCommitments: number;
  brokenCount: number;
  keptCount: number;
  futureCount: number;
  noInvoicesCount: number;
  brokenPercentage: number;
  fulfilledPercentage: number;
}

export interface ContactEffectivenessData {
  totalContacts: number;
  effectiveContacts: number;
  unreachableContacts: number;
  effectivenessPercent: number;
  todayTotal: number;
  todayEffective: number;
  todayEffectivenessPercent: number;
}

export interface PhaseBreakdown {
  phase: number;
  count: number;
  amount: number;
  countPercent: number;
  amountPercent: number;
}

export interface InvoicePhaseDistributionData {
  targetPhase: number;
  targetPhaseCount: number;
  targetPhaseAmount: number;
  totalOverdueCount: number;
  totalOverdueAmount: number;
  targetPhaseCountPercent: number;
  targetPhaseAmountPercent: number;
  distribution: PhaseBreakdown[];
}

export interface DsoProjectionData {
  currentDso: number;
  projectedDso: number;
  dsoReduction: number;
  targetDso: number;
  litigatedAmount: number;
  litigatedInvoicesCount: number;
  note: string;
}

export interface UpcomingCommitmentItem {
  debtorId: string;
  debtorName: string;
  amount: number;
  note: string;
}

export interface UpcomingCommitmentDay {
  date: string;
  when: string;
  totalAmount: number;
  count: number;
  items: UpcomingCommitmentItem[];
}

export interface WeeklyCashTrendItem {
  weekIndex: number;
  weekLabel: string;
  amount: number;
  startDate: string;
  endDate: string;
}

export interface CashDeviationSegment {
  key: string;
  label: string;
  amount: number;
  pct: number;
  debtorsCount: number;
}

export interface CashDeviationData {
  period: "dia" | "semana" | "mes";
  rangeLabel: string;
  estimatedAmount: number;
  collectedAmount: number;
  deviationAmount: number;
  deviationPct: number;
  segments: CashDeviationSegment[];
  insight: {
    topSegmentKey: string;
    topSegmentLabel: string;
    topSegmentAmount: number;
    topSegmentDebtorsCount: number;
  };
  chart: {
    label: string;
    labels: string[];
    estimated: number[];
    collected: number[];
    unit: string;
  };
}

export interface CashDeviationSegmentDebtor {
  debtorId: string;
  debtorName: string;
  invoicesCount: number;
  amount: number;
}

export interface ExecutiveSummaryAction {
  label: string;
  amount: string;
}

export interface ExecutiveSummaryData {
  text: string;
  actions: ExecutiveSummaryAction[];
}
