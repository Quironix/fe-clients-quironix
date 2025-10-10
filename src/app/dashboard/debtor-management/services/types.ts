import { PaginationInfo, PaginationParams } from "../../debtors/types/pagination";

// Tipos de cuadrantes disponibles
export type QuadrantType =
  | "BROKEN_COMMITMENTS"
  | "CRITICAL_DEBTORS"
  | "CASH_GENERATION"
  | "DEFICIENT_TECHNICAL_FILE"
  | "LITIGATION"
  | "UNCLASSIFIED"
  | null;

// Información básica del deudor
export interface Debtor {
  id: string;
  name: string;
  email: string | null;
  debtor_code: string;
}

// Item de cuadrante (tarea)
export interface QuadrantItem {
  debtorId: string;
  quadrant: string | null;
  quadrantName: string;
  debtor: Debtor;
}

// Datos de respuesta agrupados por cuadrante
export interface CollectorQuadrantsData {
  broken_commitments: QuadrantItem[];
  critical_debtors: QuadrantItem[];
  cash_generation: QuadrantItem[];
  deficient_technical_file: QuadrantItem[];
  litigation: QuadrantItem[];
  unclassified: QuadrantItem[];
}

// Respuesta completa del endpoint
export interface CollectorQuadrantsResponse {
  data: CollectorQuadrantsData;
  pagination: PaginationInfo;
}

// Parámetros para la petición
export interface CollectorQuadrantsParams extends PaginationParams {
  quadrant?: QuadrantType;
}
