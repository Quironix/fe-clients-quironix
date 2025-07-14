import { getAll } from "../services";
import {
  DEFAULT_PAGINATION_PARAMS,
} from "@/app/dashboard/debtors/types/pagination";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface UseMovementsParams {
  accessToken: string;
  clientId: string;
  initialPage?: number;
  initialLimit?: number;
}

interface UseMovementsReturn {
  data: any;
  movements: any[];
  pagination: any;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  handlePaginationChange: (page: number, limit: number) => void;
  currentPage: number;
  currentLimit: number;
  invalidateMovements: () => void;
}

const MOVEMENTS_QUERY_KEY = "movements";

export const useMovements = ({
  accessToken,
  clientId,
  initialPage = DEFAULT_PAGINATION_PARAMS.page,
  initialLimit = DEFAULT_PAGINATION_PARAMS.limit,
}: UseMovementsParams): UseMovementsReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);

  const queryFn = useCallback(
    () => getAll(accessToken, clientId, { page: currentPage, limit: currentLimit }),
    [accessToken, clientId, currentPage, currentLimit]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [`${MOVEMENTS_QUERY_KEY}-${clientId}`, currentPage, currentLimit],
    queryFn,
    enabled: !!accessToken && !!clientId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const handlePaginationChange = useCallback((page: number, limit: number) => {
    setCurrentPage(page);
    setCurrentLimit(limit);
  }, []);

  const queryClient = useQueryClient();
  const invalidateMovements = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [`${MOVEMENTS_QUERY_KEY}-${clientId}`],
    });
  }, [queryClient, clientId]);

  return {
    data,
    movements: data?.data || [],
    pagination: data?.pagination || {
      page: currentPage,
      limit: currentLimit,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
    isLoading,
    isError,
    error,
    refetch,
    handlePaginationChange,
    currentPage,
    currentLimit,
    invalidateMovements,
  };
};

export const useInvalidateMovements = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (clientId?: string) => {
      if (clientId) {
        queryClient.invalidateQueries({
          queryKey: [`${MOVEMENTS_QUERY_KEY}-${clientId}`],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [MOVEMENTS_QUERY_KEY],
        });
      }
    },
    [queryClient]
  );
};