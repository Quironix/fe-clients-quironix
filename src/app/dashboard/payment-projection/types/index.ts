// Definir aquí los tipos específicos del módulo

export interface PaymentProjectionItem {
  id?: string;
  name: string;
  // Agregar más propiedades según sea necesario
}

export interface PaymentProjectionResponse {
  data: PaymentProjectionItem[];
  total: number;
  page: number;
  limit: number;
}

// Tipos para la proyección semanal
export interface WeeklyProjectionData {
  week: number;
  dateRange: string;
  invoiceNumber: string | null;
  projected: number;
  real: number;
  variation: number;
  variationPercentage: number;
  status: "positive" | "negative" | "neutral";
}

export interface WeeklyProjectionSummary {
  totalProjected: number;
  totalReal: number;
  totalVariation: number;
  totalVariationPercentage: number;
}

export interface WeeklyProjectionTableProps {
  data?: WeeklyProjectionData[];
  isLoading?: boolean;
  onWeekSelect?: (week: number) => void;
}
