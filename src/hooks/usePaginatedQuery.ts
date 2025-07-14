import {
  DEFAULT_PAGINATION_PARAMS,
  PaginatedResponse,
  PaginationParams,
} from "@/app/dashboard/debtors/types/pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

interface UsePaginatedQueryParams<T> {
  queryKey: string;
  queryFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
  enabled?: boolean;
  initialPage?: number;
  initialLimit?: number;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  enablePrefetch?: boolean;
  searchDebounceMs?: number;
}

interface UsePaginatedQueryReturn<T> {
  data: PaginatedResponse<T> | undefined;
  items: T[];
  pagination: PaginatedResponse<T>["pagination"] | undefined;
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
  // Funciones auxiliares
  invalidateQuery: () => void;
  prefetchNextPage: () => void;
}

export const usePaginatedQuery = <T = any>({
  queryKey,
  queryFn,
  enabled = true,
  initialPage = DEFAULT_PAGINATION_PARAMS.page,
  initialLimit = DEFAULT_PAGINATION_PARAMS.limit,
  staleTime = 2 * 60 * 1000, // 2 minutos
  gcTime = 5 * 60 * 1000, // 5 minutos
  refetchOnWindowFocus = false,
  retry = 3,
  enablePrefetch = true,
  searchDebounceMs = 500,
}: UsePaginatedQueryParams<T>): UsePaginatedQueryReturn<T> => {
  const queryClient = useQueryClient();

  // Estados locales para paginación y búsqueda
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);
  const [currentSearch, setCurrentSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(currentSearch);
    }, searchDebounceMs);

    return () => clearTimeout(timer);
  }, [currentSearch, searchDebounceMs]);

  // Parámetros para la query
  const queryParams: PaginationParams = {
    page: currentPage,
    limit: currentLimit,
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  // Clave única para la query basada en los parámetros
  const fullQueryKey = [queryKey, queryParams];

  // Query principal
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: fullQueryKey,
    queryFn: () => queryFn(queryParams),
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    retry,
    placeholderData: (previousData) => previousData, // Mantener datos previos durante transiciones
  });

  // Funciones para manejar cambios de paginación
  const handlePaginationChange = useCallback((page: number, limit: number) => {
    setCurrentPage(page);
    setCurrentLimit(limit);
  }, []);

  // Función para manejar cambios de búsqueda
  const handleSearchChange = useCallback((search: string) => {
    setCurrentSearch(search);
    setCurrentPage(1); // Resetear a la primera página cuando se busca
  }, []);

  // Función para invalidar query
  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [queryKey],
    });
  }, [queryClient, queryKey]);

  // Prefetching de la siguiente página
  const prefetchNextPage = useCallback(() => {
    if (data?.pagination?.hasNext) {
      const nextPageParams = {
        ...queryParams,
        page: currentPage + 1,
      };

      queryClient.prefetchQuery({
        queryKey: [queryKey, nextPageParams],
        queryFn: () => queryFn(nextPageParams),
        staleTime,
      });
    }
  }, [
    data?.pagination?.hasNext,
    queryParams,
    currentPage,
    queryClient,
    queryKey,
    queryFn,
    staleTime,
  ]);

  // Prefetch automático de la siguiente página
  if (enablePrefetch && data?.pagination?.hasNext && !isLoading) {
    prefetchNextPage();
  }

  return {
    data,
    items: data?.data || [],
    pagination: data?.pagination,
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
    prefetchNextPage,
  };
};
