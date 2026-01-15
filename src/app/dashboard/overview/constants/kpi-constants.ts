import {
  Columns2,
  Columns3,
  Columns4,
  Gauge,
  LayoutGrid,
  LineChart,
  List,
  Maximize,
  PieChart,
} from "lucide-react";
import { KPIType } from "../services/types";

export type ViewType =
  | "card"
  | "gauge"
  | "sparkline"
  | "ring"
  | "compact"
  | "detailed";

export const KPI_NAME_MAP: Record<string, string> = {
  CASH_GENERATION: "Generación de caja",
  CEI_PERCENTAGE: "% CEI",
  CREDIBILITY_INDEX: "Índice credibilidad",
  QUIRONIX_BANK_RECONCILIATION: "Conciliación bancaria Quironix",
  QUIRONIX_SERVICE_TIME_COMPENSATION:
    "Compensación tiempo de servicio - Quironix",
  LITIGATION_NORMALIZATION_PERCENTAGE: "% Normalización litigios",
  DDO: "DDO",
  MATCH_RATE_PERCENTAGE: "% Match rate",
  OPEN_LITIGATIONS: "Litigios abiertos",
  PAYMENTS_IN_TRANSIT: "Pagos en tránsito",
  SERVICE_TIME_COMPENSATION: "Compensación tiempo de servicio",
  NEGOTIATION_EFFECTIVENESS: "Efectividad de negociación",
  DBT: "DBT",
  OVER_DUE_PERCENTAGE: "% Over due",
  CRITICAL_OVER_DUE_PERCENTAGE: "% Over due crítico",
  DSO: "DSO",
  PROVISION: "Provisión",
};

export const KPI_DEFINITION_MAP: Record<string, string> = {
  CASH_GENERATION:
    "El Recaudado Real es la sumatoria de los pagos recibidos y debe excluir cheques a fecha, Ajustes y aplicaciones. Este debe mostrarse diariamente e ir con el acumulado mensual. Debe tener Cierre mensual.",
  CEI_PERCENTAGE:
    "Este Indicador representa el % que estoy logrando Cobrar de todo lo que se podía cobrar (deuda vencida). Lo importante es ir monitoreando su tendencia mes a mes para que se acerque al 100% que es el ideal.",
  CREDIBILITY_INDEX:
    "Este indicador mide la confiabilidad y autonomía de pago de cada deudor, reflejando el costo de gobernabilidad de la cartera. No se limita a medir el atraso de pagos (DBT), sino el esfuerzo operativo necesario para que el cliente cumpla lo que aceptó.",
  QUIRONIX_BANK_RECONCILIATION:
    "Este indicador busca medir el % de pagos de cartola que fueron aplicados de forma automática por Quironix",
  QUIRONIX_SERVICE_TIME_COMPENSATION:
    "Busca medir el % de pagos que fueron aplicados de forma automática en las primeras 24 horas desde el momento en que el pago ingresa en cartola o es registrado en la plataforma.",
  LITIGATION_NORMALIZATION_PERCENTAGE:
    "Mide el % de litigios que han sido normalizados.",
  DDO: "Métrica que se utiliza en algunas empresas, particularmente en sectores como seguros, retail o servicios financieros, para medir el tiempo promedio que toma resolver y aplicar deducciones en pagos o facturas pendientes.",
  MATCH_RATE_PERCENTAGE: "Mide cuanto % de facturación tiene NC",
  OPEN_LITIGATIONS:
    "%de litigios abiertos > 30 días en gestión. Sobre el total de litigios abiertos.",
  PAYMENTS_IN_TRANSIT:
    "Monto de pagos Aplicados v/s pagos Cargados usar todos los tipos de pago, no considerar ajustes y aplicaciones.",
  SERVICE_TIME_COMPENSATION:
    "Busca medir el % de pagos que fueron aplicados de forma manual en las primeras 24 horas desde el momento en que el pago ingresa en cartola o es registrado en la plataforma.",
  NEGOTIATION_EFFECTIVENESS:
    "Mide en %, cuantas veces que interviene un ejecutivo obtiene el compromiso de pago",
  DBT: "Días después del Vencimiento que se realizó Pago",
  OVER_DUE_PERCENTAGE: "Días de Deudas Vencida",
  CRITICAL_OVER_DUE_PERCENTAGE: "Días de Deudas Vencida con más de 30 días",
  DSO: "Días Calle",
  PROVISION: "Provisión de cobranza dudosa",
};

export const UNIT_MAP: Record<string, string> = {
  PERCENT: "%",
  DAYS: "días",
  NUMBER: "nº",
};

export const CATEGORY_MAP: Record<string, KPIType> = {
  produced_quality: "Calidad producida",
  efficiency: "Eficiencia",
  impeccability: "Impecabilidad",
};

export const VIEW_TYPES: Array<{
  id: ViewType;
  name: string;
  icon: React.ElementType;
}> = [
  { id: "card", name: "Card", icon: LayoutGrid },
  { id: "gauge", name: "Gauge", icon: Gauge },
  { id: "sparkline", name: "Sparkline", icon: LineChart },
  { id: "ring", name: "Ring", icon: PieChart },
  { id: "compact", name: "Compacto", icon: List },
  { id: "detailed", name: "Detallado", icon: Maximize },
];

export const GRID_COLUMN_OPTIONS = [
  { value: 2, icon: Columns2 },
  { value: 3, icon: Columns3 },
  { value: 4, icon: Columns4 },
];

export const CATEGORIES = [
  "all",
  "Calidad producida",
  "Eficiencia",
  "Impecabilidad",
] as const;

export const STATUS_COLORS = {
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-500",
    solid: "bg-emerald-500",
    hex: "#10b981",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-500",
    solid: "bg-amber-500",
    hex: "#f59e0b",
  },
  error: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-500",
    solid: "bg-red-500",
    hex: "#ef4444",
  },
} as const;

export const CATEGORY_BADGE_STYLES = {
  "Calidad Producida": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Eficiencia: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  Impecabilidad: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
} as const;

export const STATUS_LABELS = {
  success: "En meta",
  warning: "Atención",
  error: "Crítico",
} as const;

export const DESCENDING_METRICS = [
  "OVER_DUE_PERCENTAGE",
  "CRITICAL_OVER_DUE_PERCENTAGE",
  "DDO",
  "DBT",
  "DSO",
];
