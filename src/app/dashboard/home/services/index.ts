import {
  AgingBucket,
  CashDeviationData,
  CashDeviationSegmentDebtor,
  CommitmentsSummaryData,
  ContactEffectivenessData,
  DebtorConcentrationItem,
  DsoProjectionData,
  ExecutiveSummaryData,
  InvoicePhaseDistributionData,
  QuironscoreData,
  MyProgressData,
  TaskProgressData,
  TeamCapacityMember,
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
    return (
      json && typeof json === "object" && "data" in json ? json.data : json
    ) as T;
  } catch {
    return fallback;
  }
};

export const getAgingBuckets = (accessToken: string, clientId: string) =>
  safeFetch<AgingBucket[] | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/aging-buckets`,
    accessToken,
    null,
  );

export const getDebtorConcentration = (accessToken: string, clientId: string) =>
  safeFetch<DebtorConcentrationItem[] | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/debtor-concentration`,
    accessToken,
    null,
  );

export const getTeamOverview = (accessToken: string, clientId: string) =>
  safeFetch<TeamMemberRow[] | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/team-overview`,
    accessToken,
    null,
  );

export const getTodayPriorities = (
  accessToken: string,
  clientId: string,
  executiveId: string,
) =>
  safeFetch<TodayPriorityTask[] | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/executive-priorities?executiveId=${executiveId}`,
    accessToken,
    null,
  );

export const getTaskProgress = (
  accessToken: string,
  clientId: string,
  params?: { executiveId?: string; teamWide?: boolean },
) => {
  const query = new URLSearchParams();
  if (params?.executiveId) query.set("executiveId", params.executiveId);
  if (params?.teamWide !== undefined)
    query.set("teamWide", String(params.teamWide));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return safeFetch<TaskProgressData | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/task-progress${qs}`,
    accessToken,
    null,
  );
};

export const getCommitmentsSummary = (
  accessToken: string,
  clientId: string,
  executiveId?: string,
) => {
  const qs = executiveId ? `?executiveId=${executiveId}` : "";
  return safeFetch<CommitmentsSummaryData | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/commitments-summary${qs}`,
    accessToken,
    null,
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
  return safeFetch<ContactEffectivenessData | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/contact-effectiveness${qs}`,
    accessToken,
    null,
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
  return safeFetch<InvoicePhaseDistributionData | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/invoice-phase-distribution${qs}`,
    accessToken,
    null,
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
  return safeFetch<DsoProjectionData | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/dso-projection${qs}`,
    accessToken,
    null,
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
  return safeFetch<UpcomingCommitmentDay[] | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/upcoming-commitments${qs}`,
    accessToken,
    null,
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
  return safeFetch<WeeklyCashTrendItem[] | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/cash-trend-weekly${qs}`,
    accessToken,
    null,
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

export const getCashDeviationSegmentDebtors = (
  accessToken: string,
  clientId: string,
  segment: string,
  period: "dia" | "semana" | "mes" = "semana",
) => {
  return safeFetch<CashDeviationSegmentDebtor[] | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/cash-deviation-by-phase/${segment}/debtors?period=${period}`,
    accessToken,
    [],
  );
};

export const getExecutiveSummary = (accessToken: string, clientId: string) => {
  return safeFetch<ExecutiveSummaryData | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/executive-summary`,
    accessToken,
    null,
  );
};

export const getMyProgress = (accessToken: string, clientId: string) => {
  return safeFetch<MyProgressData | null>(
    `${API_URL}/v2/clients/${clientId}/managements/indicators`,
    accessToken,
    null,
  );
};

export const getTeamCapacity = (accessToken: string, clientId: string) => {
  return safeFetch<TeamCapacityMember[] | null>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/team-capacity`,
    accessToken,
    null,
  );
};

export const getQuironscore = async (
  accessToken: string,
  clientId: string,
): Promise<QuironscoreData | null> => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reports/kpis/quironscore`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) return null;
    const json = await response.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
};
