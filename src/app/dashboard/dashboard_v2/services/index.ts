import {
  AgingBucket,
  CashDeviationData,
  CommitmentsSummaryData,
  ContactEffectivenessData,
  DebtorConcentrationItem,
  DsoProjectionData,
  ExecutiveSummaryData,
  InvoicePhaseDistributionData,
  TaskProgressData,
  TeamMemberRow,
  TodayPriorityTask,
  UpcomingCommitmentDay,
  WeeklyCashTrendItem,
} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const safeFetch = async <T>(
  url: string,
  accessToken: string,
  fallback: T,
): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("request failed");
    const json = await response.json();
    return (json?.data ?? json) as T;
  } catch {
    return fallback;
  }
};

const MOCK_AGING_BUCKETS: AgingBucket[] = [
  { bucket: "0-30", amount: 42500000 },
  { bucket: "31-60", amount: 18700000 },
  { bucket: "61-90", amount: 9200000 },
  { bucket: "90+", amount: 6100000 },
];

const MOCK_DEBTOR_CONCENTRATION: DebtorConcentrationItem[] = [
  { debtorId: "1", debtorName: "Comercial Andes SpA", amount: 12800000, share: 0.18 },
  { debtorId: "2", debtorName: "Distribuidora Pacífico", amount: 9600000, share: 0.13 },
  { debtorId: "3", debtorName: "Retail Sur Ltda.", amount: 7400000, share: 0.1 },
  { debtorId: "4", debtorName: "Importadora Norte", amount: 5200000, share: 0.07 },
  { debtorId: "5", debtorName: "Servicios Maipo SA", amount: 4100000, share: 0.06 },
];

const MOCK_TEAM_OVERVIEW: TeamMemberRow[] = [
  { executiveId: "e1", executiveName: "Javiera Soto", progressPercent: 82, commitmentsFulfilledPercent: 74, cashGenerated: 15400000, contactPercent: 51, trend: [2400000, 2800000, 2100000, 3100000, 2500000, 2500000], ranking: 2 },
  { executiveId: "e2", executiveName: "Matías Reyes", progressPercent: 68, commitmentsFulfilledPercent: 61, cashGenerated: 11200000, contactPercent: 46, trend: [1800000, 1900000, 1500000, 2000000, 2100000, 1900000], ranking: 3 },
  { executiveId: "e3", executiveName: "Camila Vidal", progressPercent: 91, commitmentsFulfilledPercent: 88, cashGenerated: 19800000, contactPercent: 58, trend: [3100000, 3400000, 2900000, 3600000, 3200000, 3600000], ranking: 1 },
];

const MOCK_TODAY_PRIORITIES: TodayPriorityTask[] = [
  { id: "t1", debtorName: "Comercial Andes SpA", description: "Confirmar compromiso de pago vencido", amount: 4200000, priority: 1 },
  { id: "t2", debtorName: "Retail Sur Ltda.", description: "Llamada de seguimiento litigio", amount: 3100000, priority: 2 },
  { id: "t3", debtorName: "Importadora Norte", description: "Enviar estado de cuenta actualizado", amount: 1800000, priority: 3 },
];

const MOCK_TASK_PROGRESS: TaskProgressData = {
  completed: 24,
  pending: 6,
  total: 30,
  progress_percent: 80,
};

const MOCK_COMMITMENTS_SUMMARY: CommitmentsSummaryData = {
  totalCommitments: 18,
  brokenCount: 3,
  keptCount: 12,
  futureCount: 2,
  noInvoicesCount: 1,
  brokenPercentage: 20,
  fulfilledPercentage: 80,
};

const MOCK_CONTACT_EFFECTIVENESS: ContactEffectivenessData = {
  totalContacts: 142,
  effectiveContacts: 77,
  unreachableContacts: 65,
  effectivenessPercent: 54,
  todayTotal: 16,
  todayEffective: 12,
  todayEffectivenessPercent: 75,
};

const MOCK_INVOICE_PHASE_DISTRIBUTION: InvoicePhaseDistributionData = {
  targetPhase: 1,
  targetPhaseCount: 42,
  targetPhaseAmount: 18400000,
  totalOverdueCount: 128,
  totalOverdueAmount: 56000000,
  targetPhaseCountPercent: 33,
  targetPhaseAmountPercent: 33,
  distribution: [],
};

const MOCK_DSO_PROJECTION: DsoProjectionData = {
  currentDso: 54,
  projectedDso: 41,
  dsoReduction: 13,
  targetDso: 35,
  litigatedAmount: 18400000,
  litigatedInvoicesCount: 6,
  note: "-13 días al normalizar $18.4M en 6 casos",
};

const MOCK_UPCOMING_COMMITMENTS: UpcomingCommitmentDay[] = [
  {
    date: "2026-08-17",
    when: "Mañana · 17 Ago",
    totalAmount: 9600000,
    count: 2,
    items: [
      { debtorId: "1", debtorName: "Comercial Andes SpA", amount: 6200000, note: "Compromiso pago cuota 1" },
      { debtorId: "2", debtorName: "Distribuidora Pacífico", amount: 3400000, note: "Transferencia confirmada" },
    ],
  },
  {
    date: "2026-08-18",
    when: "Miércoles · 18 Ago",
    totalAmount: 4800000,
    count: 1,
    items: [
      { debtorId: "3", debtorName: "Retail Sur Ltda.", amount: 4800000, note: "Pago acordado fin de mes" },
    ],
  },
];

const MOCK_WEEKLY_CASH_TREND: WeeklyCashTrendItem[] = [
  { weekIndex: 1, weekLabel: "07/07", amount: 2800000, startDate: "", endDate: "" },
  { weekIndex: 2, weekLabel: "14/07", amount: 3100000, startDate: "", endDate: "" },
  { weekIndex: 3, weekLabel: "21/07", amount: 2900000, startDate: "", endDate: "" },
  { weekIndex: 4, weekLabel: "28/07", amount: 3600000, startDate: "", endDate: "" },
  { weekIndex: 5, weekLabel: "04/08", amount: 4200000, startDate: "", endDate: "" },
  { weekIndex: 6, weekLabel: "11/08", amount: 3900000, startDate: "", endDate: "" },
  { weekIndex: 7, weekLabel: "18/08", amount: 4500000, startDate: "", endDate: "" },
  { weekIndex: 8, weekLabel: "25/08", amount: 4800000, startDate: "", endDate: "" },
];

export const getAgingBuckets = (accessToken: string, clientId: string) =>
  safeFetch<AgingBucket[]>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/aging-buckets`,
    accessToken,
    MOCK_AGING_BUCKETS,
  );

export const getDebtorConcentration = (
  accessToken: string,
  clientId: string,
) =>
  safeFetch<DebtorConcentrationItem[]>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/debtor-concentration`,
    accessToken,
    MOCK_DEBTOR_CONCENTRATION,
  );

export const getTeamOverview = (accessToken: string, clientId: string) =>
  safeFetch<TeamMemberRow[]>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/team-overview`,
    accessToken,
    MOCK_TEAM_OVERVIEW,
  );

export const getTodayPriorities = (
  accessToken: string,
  clientId: string,
  executiveId: string,
) =>
  safeFetch<TodayPriorityTask[]>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/executive-priorities?executiveId=${executiveId}`,
    accessToken,
    MOCK_TODAY_PRIORITIES,
  );

export const getTaskProgress = (
  accessToken: string,
  clientId: string,
  params?: { executiveId?: string; teamWide?: boolean },
) => {
  const query = new URLSearchParams();
  if (params?.executiveId) query.set("executiveId", params.executiveId);
  if (params?.teamWide !== undefined) query.set("teamWide", String(params.teamWide));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return safeFetch<TaskProgressData>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/task-progress${qs}`,
    accessToken,
    MOCK_TASK_PROGRESS,
  );
};

export const getCommitmentsSummary = (
  accessToken: string,
  clientId: string,
  executiveId?: string,
) => {
  const qs = executiveId ? `?executiveId=${executiveId}` : "";
  return safeFetch<CommitmentsSummaryData>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/commitments-summary${qs}`,
    accessToken,
    MOCK_COMMITMENTS_SUMMARY,
  );
};

export const getContactEffectiveness = (
  accessToken: string,
  clientId: string,
  params?: { executiveId?: string; period?: string },
) => {
  const query = new URLSearchParams();
  if (params?.executiveId) query.set("executiveId", params.executiveId);
  if (params?.period) query.set("period", params.period);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return safeFetch<ContactEffectivenessData>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/contact-effectiveness${qs}`,
    accessToken,
    MOCK_CONTACT_EFFECTIVENESS,
  );
};

export const getInvoicePhaseDistribution = (
  accessToken: string,
  clientId: string,
  params?: { executiveId?: string; phase?: number },
) => {
  const query = new URLSearchParams();
  if (params?.executiveId) query.set("executiveId", params.executiveId);
  if (params?.phase !== undefined) query.set("phase", String(params.phase));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return safeFetch<InvoicePhaseDistributionData>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/invoice-phase-distribution${qs}`,
    accessToken,
    MOCK_INVOICE_PHASE_DISTRIBUTION,
  );
};

export const getDsoProjection = (
  accessToken: string,
  clientId: string,
  params?: { executiveId?: string },
) => {
  const query = new URLSearchParams();
  if (params?.executiveId) query.set("executiveId", params.executiveId);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return safeFetch<DsoProjectionData>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/dso-projection${qs}`,
    accessToken,
    MOCK_DSO_PROJECTION,
  );
};

export const getUpcomingCommitments = (
  accessToken: string,
  clientId: string,
  params?: { executiveId?: string; days?: number },
) => {
  const query = new URLSearchParams();
  if (params?.executiveId) query.set("executiveId", params.executiveId);
  if (params?.days !== undefined) query.set("days", String(params.days));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return safeFetch<UpcomingCommitmentDay[]>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/upcoming-commitments${qs}`,
    accessToken,
    MOCK_UPCOMING_COMMITMENTS,
  );
};

export const getCashTrendWeekly = (
  accessToken: string,
  clientId: string,
  params?: { executiveId?: string; weeks?: number },
) => {
  const query = new URLSearchParams();
  if (params?.executiveId) query.set("executiveId", params.executiveId);
  if (params?.weeks !== undefined) query.set("weeks", String(params.weeks));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return safeFetch<WeeklyCashTrendItem[]>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/cash-trend-weekly${qs}`,
    accessToken,
    MOCK_WEEKLY_CASH_TREND,
  );
};

export const getCashDeviationByPhase = (
  accessToken: string,
  clientId: string,
  period: "dia" | "semana" | "mes" = "semana",
) => {
  return safeFetch<CashDeviationData | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/cash-deviation-by-phase?period=${period}`,
    accessToken,
    null,
  );
};

export const getExecutiveSummary = (accessToken: string, clientId: string) => {
  return safeFetch<ExecutiveSummaryData | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/executive-summary`,
    accessToken,
    null,
  );
};
