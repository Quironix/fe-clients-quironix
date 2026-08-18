/* Placeholder content for dashboard sections that don't have a backend
   aggregation endpoint yet. Clearly separated from real API-backed data
   (kpis, aging buckets, debtor concentration, team overview, today
   priorities) so it's obvious which numbers are illustrative. */

export type HeroPeriod = "dia" | "semana" | "mes";

export const HERO_PERIOD_LABELS: Record<HeroPeriod, string> = {
  dia: "Día",
  semana: "Semana",
  mes: "Mes",
};

export interface CashDeviationSegmentDef {
  key: string;
  label: string;
  color: string;
  pct: number;
}

export const HERO_CASH_DEVIATION_SEGMENTS: CashDeviationSegmentDef[] = [
  { key: "litigio", label: "Litigio sin resolver", color: "#9333EA", pct: 35.3 },
  { key: "compromiso", label: "Compromiso incumplido", color: "#DC2626", pct: 27.9 },
  { key: "fase1", label: "Fase 1 vencida sin gestión", color: "#F27313", pct: 22.1 },
  { key: "pago", label: "Pago sin compensar", color: "#3B82F6", pct: 13.2 },
  { key: "otras", label: "Otras fases", color: "#94A3B8", pct: 1.5 },
];

export interface HeroCashDeviationPeriod {
  range: string;
  estimated: string;
  collected: string;
  deviation: string;
  deviationPct: string;
  segAmounts: string[];
  insightAmount: string;
}

export const MOCK_HERO_CASH_DEVIATION: Record<HeroPeriod, HeroCashDeviationPeriod> = {
  dia: {
    range: "Hoy",
    estimated: "$4,2M",
    collected: "$2,9M",
    deviation: "−$1,3M",
    deviationPct: "(−31%)",
    segAmounts: ["$0,5M", "$0,4M", "$0,3M", "$0,1M", "<$0,1M"],
    insightAmount: "$0,5M",
  },
  semana: {
    range: "Semana en curso",
    estimated: "$21,0M",
    collected: "$14,2M",
    deviation: "−$6,8M",
    deviationPct: "(−32%)",
    segAmounts: ["$2,4M", "$1,9M", "$1,5M", "$0,9M", "$0,1M"],
    insightAmount: "$2,4M",
  },
  mes: {
    range: "Mes en curso",
    estimated: "$84,0M",
    collected: "$57,1M",
    deviation: "−$26,9M",
    deviationPct: "(−32%)",
    segAmounts: ["$9,6M", "$7,6M", "$6,0M", "$3,6M", "$0,1M"],
    insightAmount: "$9,6M",
  },
};

export const MOCK_ESTIMATED_VS_COLLECTED: Record<
  HeroPeriod,
  { label: string; estimated: number[]; collected: number[]; unit: string }
> = {
  dia: {
    label: "últimos 10 días",
    estimated: [4.2, 4.2, 4.1, 4.2, 4.2, 4.2, 4.1, 4.2, 4.2, 4.2],
    collected: [3.8, 3.6, 3.4, 3.3, 3.1, 3.2, 3.0, 2.9, 2.9, 2.9],
    unit: "M",
  },
  semana: {
    label: "últimas 8 semanas",
    estimated: [21, 21, 20.5, 21, 21, 21, 21, 21],
    collected: [18.2, 17.1, 16.0, 15.6, 15.1, 14.9, 14.5, 14.2],
    unit: "M",
  },
  mes: {
    label: "últimos 6 meses",
    estimated: [84, 84, 82, 84, 84, 84],
    collected: [71, 68, 64, 61, 59, 57.1],
    unit: "M",
  },
};

export interface TodayStat {
  label: string;
  value: string;
  note: string;
  tone: "good" | "warn" | "bad";
}

export const MOCK_TODAY_STATS: TodayStat[] = [
  { label: "Tareas pendientes hoy", value: "14", note: "de 22 asignadas", tone: "warn" },
  { label: "Compromisos que vencen hoy", value: "3", note: "$340K en juego", tone: "bad" },
  { label: "Llamadas efectivas", value: "12 / 25", note: "48% de la meta diaria", tone: "warn" },
  { label: "Caja recuperada hoy", value: "$215K", note: "meta diaria $520K", tone: "warn" },
];

export const MOCK_MY_TREND = {
  label: "Caja recuperada por semana · últimas 8",
  series: [2.4, 2.9, 3.1, 2.7, 3.0, 2.8, 3.1, 3.2],
  unit: "M",
};

export interface ProjectionScenario {
  currentLabel: string;
  currentValue: string;
  projectedLabel: string;
  projectedValue: string;
  targetLabel: string;
  targetValue: string;
  note: string;
}

export const MOCK_PROJECTION: ProjectionScenario = {
  currentLabel: "DSO actual",
  currentValue: "64 días",
  projectedLabel: "DSO proyectado",
  projectedValue: "55 días",
  targetLabel: "Objetivo",
  targetValue: "45 días",
  note: "Resolver los 2 litigios principales bajaría el DSO de 64 a 55 días y liberaría caja bloqueada sin gestión adicional.",
};

export interface TeamTrendEntry {
  trend: number[];
  move: "up" | "down" | "flat";
}

export const MOCK_TEAM_TREND: Record<string, TeamTrendEntry> = {
  e1: { trend: [70, 74, 78, 80, 79, 82], move: "up" },
  e2: { trend: [68, 70, 72, 73, 74, 74], move: "flat" },
  e3: { trend: [80, 84, 86, 88, 89, 91], move: "up" },
};

export interface TeamCapacityRow {
  executiveId: string;
  executiveName: string;
  pct: number;
  cases: number;
}

export const MOCK_TEAM_CAPACITY: TeamCapacityRow[] = [
  { executiveId: "e1", executiveName: "Javiera Soto", pct: 88, cases: 24 },
  { executiveId: "e2", executiveName: "Matías Reyes", pct: 76, cases: 20 },
  { executiveId: "e3", executiveName: "Camila Vidal", pct: 64, cases: 17 },
];

export interface ExecutiveSummaryAction {
  label: string;
  amount: string;
}

export interface ExecutiveSummary {
  text: string;
  actions: ExecutiveSummaryAction[];
}

export const MOCK_EXECUTIVE_SUMMARY: ExecutiveSummary = {
  text: "La caja recaudada está por debajo de lo estimado. El mayor faltante se concentra en litigios sin resolver y compromisos incumplidos. El Quironscore cayó, arrastrado por la caída en recuperación y el mayor riesgo de cartera.",
  actions: [
    { label: "Resolver disputa — Constructora Delta", amount: "$980K" },
    { label: "Campaña de renegociación — compromisos caídos", amount: "$1,9M" },
    { label: "Revisar límites de crédito — segmento retail", amount: "" },
  ],
};

export interface PipelineItem {
  debtorName: string;
  note: string;
  amount: string;
}

export interface PipelineDay {
  when: string;
  items: PipelineItem[];
}

export const MOCK_PIPELINE: PipelineDay[] = [
  {
    when: "Mañana",
    items: [
      { debtorName: "Retail Sur Ltda.", note: "Compromiso reagendado", amount: "$410K" },
      { debtorName: "Servicios Maipo SA", note: "Saldo del acuerdo parcial", amount: "$330K" },
    ],
  },
  {
    when: "Resto de la semana",
    items: [
      { debtorName: "Importadora Norte", note: "Fase 1 · vence el viernes", amount: "$96K" },
    ],
  },
];

export interface ProgressItem {
  label: string;
  valueLabel: string;
  pct: number;
  mark: number;
  note: string;
}

export const MOCK_MY_PROGRESS: ProgressItem[] = [
  { label: "Meta de hoy", valueLabel: "$215K / $520K", pct: 41, mark: 60, note: "Ritmo esperado a esta hora: 60%" },
  { label: "Mi semana", valueLabel: "$3,2M / $4,6M", pct: 70, mark: 75, note: "Vas 5 pts bajo el ritmo semanal" },
  { label: "Mi mes", valueLabel: "$11,8M / $18,0M", pct: 66, mark: 64, note: "Levemente sobre el ritmo mensual" },
];
