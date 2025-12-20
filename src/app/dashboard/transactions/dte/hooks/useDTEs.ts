import { getDTEs } from "@/app/dashboard/transactions/dte/services";
import {
  DEFAULT_PAGINATION_PARAMS,
} from "@/app/dashboard/debtors/types/pagination";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface UseDTEsParams {
  accessToken: string;
  clientId: string;
  initialPage?: number;
  initialLimit?: number;
}

interface UseDTEsReturn {
  data: any;
  dtes: any[];
  pagination: any;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  handlePaginationChange: (page: number, limit: number) => void;
  handleSearchChange: (search: string) => void;
  currentPage: number;
  currentLimit: number;
  invalidateDTEs: () => void;
}

const DTES_QUERY_KEY = "dtes";

export const useDTEs = ({
  accessToken,
  clientId,
  initialPage = DEFAULT_PAGINATION_PARAMS.page,
  initialLimit = DEFAULT_PAGINATION_PARAMS.limit,
}: UseDTEsParams): UseDTEsReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);
  const [searchTerm, setSearchTerm] = useState("");

  const queryFn = useCallback(
    () => getDTEs(accessToken, clientId, { page: currentPage, limit: currentLimit, search: searchTerm }),
    [accessToken, clientId, currentPage, currentLimit, searchTerm]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [`${DTES_QUERY_KEY}-${clientId}`, currentPage, currentLimit, searchTerm],
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

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  }, []);

  const queryClient = useQueryClient();
  const invalidateDTEs = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [`${DTES_QUERY_KEY}-${clientId}`],
    });
  }, [queryClient, clientId]);

  return {
    data,
    dtes: data?.data || [],
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
    handleSearchChange,
    currentPage,
    currentLimit,
    invalidateDTEs,
  };
};

export const useInvalidateDTEs = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (clientId?: string) => {
      if (clientId) {
        queryClient.invalidateQueries({
          queryKey: [`${DTES_QUERY_KEY}-${clientId}`],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [DTES_QUERY_KEY],
        });
      }
    },
    [queryClient]
  );
};