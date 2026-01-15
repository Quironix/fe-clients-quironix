export type KPIType = "Calidad producida" | "Eficiencia" | "Impecabilidad";

export type KPIUnit = "%" | "días" | "nº" | "$";

export type KPIStatus = "success" | "warning" | "error";

export type KPITrend = "up" | "down" | "stable";

export type ColorDirection = "ascending" | "descending";

export interface KPIThresholds {
  sla: number;
  acceptance_criteria: number;
  direction: ColorDirection;
}

export interface KPI {
  id: string;
  name: string;
  type: KPIType;
  definition: string;
  unit: KPIUnit;
  value: number;
  target: number;
  thresholds: KPIThresholds;
  status: KPIStatus;
  trend?: KPITrend;
  sla?: string;
  criterio?: string;
  lastUpdated?: string;
  history?: any[];
  invoices?: any[];
}

export interface KPIFilters {
  type?: KPIType | "all";
  searchTerm?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface Indicators {
  optimal: number;
  alert: number;
  healthScore: number;
}

export interface KPIResponse {
  data: KPI[];
  total: number;
  lastUpdated: string;
  indicators?: Indicators;
}

export interface ResponseKPIV2 {
  produced_quality: ItemKPI[];
  efficiency: ItemKPI[];
  impeccability: ItemKPI[];
  indicators: Indicators;
}

export interface ItemKPI {
  name: string;
  unit: string;
  value: null | number;
  sla: null | number;
  acceptance_criteria: null | number;
  history: any[];
  invoices: any[];
}
