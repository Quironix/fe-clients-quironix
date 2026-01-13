export type KPIType = "Calidad Producida" | "Eficiencia" | "Impecabilidad";

export type KPIUnit = "%" | "días" | "nº" | "$";

export type KPIStatus = "success" | "warning" | "error";

export type KPITrend = "up" | "down" | "stable";

export type ColorDirection = "ascending" | "descending";

export interface KPIThresholds {
  low: number;
  high: number;
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
  history?: Array<{
    date: string;
    value: number;
  }>;
}

export interface KPIFilters {
  type?: KPIType | "all";
  searchTerm?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface KPIResponse {
  data: KPI[];
  total: number;
  lastUpdated: string;
}

export interface ResponseKPIV2 {
  produced_quality: ItemKPI[];
  efficiency: ItemKPI[];
  impeccability: ItemKPI[];
}

export interface ItemKPI {
  name: string;
  unit: string;
  value: null | number;
  sla: null | number;
  acceptance_criteria: null | number;
}
