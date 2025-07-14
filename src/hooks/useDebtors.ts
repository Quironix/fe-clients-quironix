import { getDebtors } from "@/app/dashboard/debtors/services";
import {
  DEFAULT_PAGINATION_PARAMS,
  PaginationParams,
} from "@/app/dashboard/debtors/types/pagination";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { usePaginatedQuery } from "./usePaginatedQuery";

interface UseDebtorsParams {
  accessToken: string;
  clientId: string;
  initialPage?: number;
  initialLimit?: number;
}

interface UseDebtorsReturn {
  data: any;
  debtors: any[];
  pagination: any;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  // Funciones para manejar cambios
  handlePaginationChange: (page: number, limit: number) => void;
  handleSearchChange: (search: string) => void;
  // Estados actuales
  currentPage: number;
  currentLimit: number;
  currentSearch: string;
  // Funciones adicionales
  invalidateDebtors: () => void;
}

// Clave base para las queries de deudores
const DEBTORS_QUERY_KEY = "debtors";

export const useDebtors = ({
  accessToken,
  clientId,
  initialPage = DEFAULT_PAGINATION_PARAMS.page,
  initialLimit = DEFAULT_PAGINATION_PARAMS.limit,
}: UseDebtorsParams): UseDebtorsReturn => {
  // Query function que incluye clientId en la clave
  const queryFn = useCallback(
    (params: PaginationParams) => getDebtors(accessToken, clientId, params),
    [accessToken, clientId]
  );

  // Usar el hook genérico
  const {
    data,
    items: debtors,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    handlePaginationChange,
    handleSearchChange,
    currentPage,
    currentLimit,
    currentSearch,
    invalidateQuery,
  } = usePaginatedQuery({
    queryKey: `${DEBTORS_QUERY_KEY}-${clientId}`,
    queryFn,
    enabled: !!accessToken && !!clientId,
    initialPage,
    initialLimit,
    staleTime: 30 * 1000, // 30 segundos para búsquedas más responsivas
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2, // Menos reintentos para mejor UX
    enablePrefetch: true,
  });

  return {
    data,
    debtors,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    handlePaginationChange,
    handleSearchChange,
    currentPage,
    currentLimit,
    currentSearch,
    invalidateDebtors: invalidateQuery,
  };
};

// Hook para invalidar cache de deudores
export const useInvalidateDebtors = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (clientId?: string) => {
      if (clientId) {
        queryClient.invalidateQueries({
          queryKey: [`${DEBTORS_QUERY_KEY}-${clientId}`],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [DEBTORS_QUERY_KEY],
        });
      }
    },
    [queryClient]
  );
};
