import { KPI_NAME_MAP, STATUS_LABELS } from "../../overview/constants/kpi-constants";
import { KPI } from "../../overview/services/types";
import { calculateKPITrend, getProgressPercentage } from "../../overview/utils/kpi-utils";
import { KpiTone, MockKpiDef } from "../constants/mock-kpis";

/* Adaptador Nivel 1 (PRD §7.2): traduce KPIs reales al shape que ya
   consume KpiCardMock, para reutilizar el componente visual sin
   reescritura. Solo reemplaza las tarjetas cuyo nombre matchea un KPI
   real disponible — el resto se queda con su definición mock (Nivel 2/3/4). */

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

export const buildKpiGridItems = (
  mockItems: MockKpiDef[],
  realKpis: KPI[] | undefined
): MockKpiDef[] => {
  if (!realKpis || realKpis.length === 0) return mockItems;
  return mockItems.map((item) => {
    const realKpi = findRealKpi(item.name, realKpis);
    return realKpi ? mapRealKpiToMockShape(realKpi, item) : item;
  });
};
