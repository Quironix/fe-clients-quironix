// Tipos para la paginación del servidor
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Respuesta paginada genérica
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Parámetros para peticiones paginadas
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Parámetros por defecto
export const DEFAULT_PAGINATION_PARAMS: Required<
  Omit<PaginationParams, "search">
> = {
  page: 1,
  limit: 15,
};
