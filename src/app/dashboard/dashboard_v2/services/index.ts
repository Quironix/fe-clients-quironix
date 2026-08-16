import {
  AgingBucket,
  DebtorConcentrationItem,
  TeamMemberRow,
  TodayPriorityTask,
} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const safeFetch = async <T>(
  url: string,
  accessToken: string,
  fallback: T
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
  { executiveId: "e1", executiveName: "Javiera Soto", progressPercent: 82, commitmentsFulfilledPercent: 74, cashGenerated: 15400000, contactPercent: 51 },
  { executiveId: "e2", executiveName: "Matías Reyes", progressPercent: 68, commitmentsFulfilledPercent: 61, cashGenerated: 11200000, contactPercent: 46 },
  { executiveId: "e3", executiveName: "Camila Vidal", progressPercent: 91, commitmentsFulfilledPercent: 88, cashGenerated: 19800000, contactPercent: 58 },
];

const MOCK_TODAY_PRIORITIES: TodayPriorityTask[] = [
  { id: "t1", debtorName: "Comercial Andes SpA", description: "Confirmar compromiso de pago vencido", amount: 4200000, priority: 1 },
  { id: "t2", debtorName: "Retail Sur Ltda.", description: "Llamada de seguimiento litigio", amount: 3100000, priority: 2 },
  { id: "t3", debtorName: "Importadora Norte", description: "Enviar estado de cuenta actualizado", amount: 1800000, priority: 3 },
];

export const getAgingBuckets = (accessToken: string, clientId: string) =>
  safeFetch<AgingBucket[]>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/aging-buckets`,
    accessToken,
    MOCK_AGING_BUCKETS
  );

export const getDebtorConcentration = (
  accessToken: string,
  clientId: string
) =>
  safeFetch<DebtorConcentrationItem[]>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/debtor-concentration`,
    accessToken,
    MOCK_DEBTOR_CONCENTRATION
  );

export const getTeamOverview = (accessToken: string, clientId: string) =>
  safeFetch<TeamMemberRow[]>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/team-overview`,
    accessToken,
    MOCK_TEAM_OVERVIEW
  );

export const getTodayPriorities = (
  accessToken: string,
  clientId: string,
  executiveId: string
) =>
  safeFetch<TodayPriorityTask[]>(
    `${API_URL}/v2/clients/${clientId}/reports/dashboard/executive-priorities?executiveId=${executiveId}`,
    accessToken,
    MOCK_TODAY_PRIORITIES
  );
