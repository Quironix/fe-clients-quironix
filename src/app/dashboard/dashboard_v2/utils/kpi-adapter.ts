import { KPI_NAME_MAP, STATUS_LABELS } from "../../overview/constants/kpi-constants";
import { KPI } from "../../overview/services/types";
import { calculateKPITrend, getProgressPercentage } from "../../overview/utils/kpi-utils";
import { KpiTone, MockKpiDef } from "../constants/mock-kpis";
import {
  CommitmentsSummaryData,
  ContactEffectivenessData,
  InvoicePhaseDistributionData,
  TaskProgressData,
} from "../types";

export interface Level2KpiData {
  taskProgress?: TaskProgressData;
  commitmentsSummary?: CommitmentsSummaryData;
  contactEffectiveness?: ContactEffectivenessData;
  invoicePhase?: InvoicePhaseDistributionData;
}

const MOCK_TO_TECHNICAL_NAME: Record<string, string> = {
  DSO: "DSO",
  "% Overdue Crítico": "CRITICAL_OVER_DUE_PERCENTAGE",
  "Overdue Crítico": "CRITICAL_OVER_DUE_PERCENTAGE",
  "Generación de Caja": "CASH_GENERATION",
  "Índice de Credibilidad": "CREDIBILITY_INDEX",
  "Efectividad de Negociación": "NEGOTIATION_EFFECTIVENESS",
};

const STATUS_TO_TONE: Record<KPI["status"], KpiTone> = {
  success: "good",
  warning: "warn",
  error: "bad",
};

const formatValue = (value: number) =>
  value.toLocaleString("es-CL", { maximumFractionDigits: 1 }).replace(".", ",");

const findRealKpi = (mockName: string, realKpis: KPI[]): KPI | undefined => {
  const technicalName = MOCK_TO_TECHNICAL_NAME[mockName];
  if (!technicalName) return undefined;
  const displayName = KPI_NAME_MAP[technicalName];
  return realKpis.find((k) => k.name === displayName);
};

const mapRealKpiToMockShape = (kpi: KPI, template: MockKpiDef): MockKpiDef => {
  const tone = STATUS_TO_TONE[kpi.status];
  const trendInfo = calculateKPITrend(kpi);
  const badgeTone: KpiTone = trendInfo ? (trendInfo.isGood ? "good" : "bad") : tone;
  const badgeArrow =
    trendInfo?.direction === "up" ? "↑" : trendInfo?.direction === "down" ? "↓" : "→";
  const badgeText = trendInfo ? `${badgeArrow} ${trendInfo.value}%` : STATUS_LABELS[kpi.status];
  const history = (kpi.history || [])
    .map((h) => h.value)
    .filter((v): v is number => v !== null);

  const merged: MockKpiDef = {
    ...template,
    value: formatValue(kpi.value),
    unit: kpi.unit,
    badge: { tx: badgeText, tone: badgeTone },
    status: tone,
    meta: `Meta: ${kpi.target}${kpi.unit}`,
  };

  switch (template.viz) {
    case "trend":
      merged.metaVal = kpi.target;
      merged.metaLabel = `Meta ${kpi.target}`;
      merged.trend = history.length >= 2 ? history : template.trend;
      break;
    case "fill":
      merged.pct = getProgressPercentage(kpi.value, kpi.target, kpi.thresholds.direction);
      break;
    case "gauge":
      merged.num = Math.max(0, Math.min(100, kpi.value));
      merged.target = kpi.target;
      break;
    case "share":
      merged.num = kpi.value;
      merged.target = kpi.target;
      merged.targetLabel = `Umbral ${kpi.target}${kpi.unit}`;
      break;
    default:
      break;
  }

  return merged;
};

const mapLevel2Kpi = (
  item: MockKpiDef,
  level2Data?: Level2KpiData,
): MockKpiDef => {
  if (!level2Data) return item;

  if (
    (item.name === "% Avance de Tareas" || item.name === "% Cumplimiento de Tareas") &&
    level2Data.taskProgress
  ) {
    const pct = level2Data.taskProgress.progress_percent;
    const tone: KpiTone = pct >= 80 ? "good" : pct >= 60 ? "warn" : "bad";
    return {
      ...item,
      value: `${pct}`,
      pct,
      status: tone,
      badge: { tx: pct >= 80 ? "Meta cumplida" : "En progreso", tone },
      meta: `Meta: 80% · ${level2Data.taskProgress.completed} de ${level2Data.taskProgress.total} tareas`,
    };
  }

  if (item.name === "% Compromisos Cumplidos" && level2Data.commitmentsSummary) {
    const pct = level2Data.commitmentsSummary.fulfilledPercentage;
    const tone: KpiTone = pct >= 75 ? "good" : pct >= 50 ? "warn" : "bad";
    return {
      ...item,
      value: `${pct}`,
      pct,
      status: tone,
      badge: { tx: pct >= 75 ? "Sobre meta" : "Bajo meta", tone },
      meta: `Meta: 75% · ${level2Data.commitmentsSummary.keptCount} cumplidos`,
    };
  }

  if (item.name === "Contactabilidad Efectiva" && level2Data.contactEffectiveness) {
    const pct = level2Data.contactEffectiveness.effectivenessPercent;
    const tone: KpiTone = pct >= 50 ? "good" : pct >= 35 ? "warn" : "bad";
    return {
      ...item,
      value: `${pct}`,
      num: pct,
      status: tone,
      badge: { tx: pct >= 50 ? "Sobre umbral" : "Bajo umbral", tone },
      meta: `Meta: 50% · ${level2Data.contactEffectiveness.effectiveContacts} contactos`,
    };
  }

  if (item.name === "Llamadas Efectivas" && level2Data.contactEffectiveness) {
    const count = level2Data.contactEffectiveness.todayEffective;
    const tone: KpiTone = count >= 15 ? "good" : count >= 10 ? "warn" : "bad";
    return {
      ...item,
      value: `${count}`,
      status: tone,
      badge: { tx: count >= 15 ? "En meta diaria" : "En progreso", tone },
      meta: `Meta: 25 llamadas · ${count} efectivas hoy`,
    };
  }

  if (item.name === "% Facturas en Fase 1" && level2Data.invoicePhase) {
    const pct = level2Data.invoicePhase.targetPhaseCountPercent;
    const tone: KpiTone = pct <= 35 ? "good" : pct <= 50 ? "warn" : "bad";
    return {
      ...item,
      value: `${pct}`,
      pct,
      status: tone,
      badge: { tx: pct <= 35 ? "Baja mora temprana" : "Monitorear", tone },
      meta: `Meta: ≤35% · ${level2Data.invoicePhase.targetPhaseCount} facturas`,
    };
  }

  return item;
};

export const buildKpiGridItems = (
  mockItems: MockKpiDef[],
  realKpis: KPI[] | undefined,
  level2Data?: Level2KpiData,
): MockKpiDef[] => {
  return mockItems.map((item) => {
    // 1. Try Level 1 real KPI first
    if (realKpis && realKpis.length > 0) {
      const realKpi = findRealKpi(item.name, realKpis);
      if (realKpi) return mapRealKpiToMockShape(realKpi, item);
    }

    // 2. Try Level 2 real KPI data
    const level2Item = mapLevel2Kpi(item, level2Data);
    if (level2Item !== item) return level2Item;

    // 3. Fallback to mock item
    return item;
  });
};
