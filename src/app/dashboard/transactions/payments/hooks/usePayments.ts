import { getPayments } from "../services";
import {
  DEFAULT_PAGINATION_PARAMS,
} from "@/app/dashboard/debtors/types/pagination";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface UsePaymentsParams {
  accessToken: string;
  clientId: string;
  initialPage?: number;
  initialLimit?: number;
  startDate?: string;
  endDate?: string;
}

interface UsePaymentsReturn {
  data: any;
  payments: any[];
  pagination: any;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  handlePaginationChange: (page: number, limit: number) => void;
  currentPage: number;
  currentLimit: number;
  invalidatePayments: () => void;
}

const PAYMENTS_QUERY_KEY = "payments";

export const usePayments = ({
  accessToken,
  clientId,
  initialPage = DEFAULT_PAGINATION_PARAMS.page,
  initialLimit = DEFAULT_PAGINATION_PARAMS.limit,
  startDate = "",
  endDate = "",
}: UsePaymentsParams): UsePaymentsReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);

  const queryFn = useCallback(
    () => getPayments(accessToken, clientId, { 
      page: currentPage, 
      limit: currentLimit,
      startDate,
      endDate
    }),
    [accessToken, clientId, currentPage, currentLimit, startDate, endDate]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [`${PAYMENTS_QUERY_KEY}-${clientId}`, currentPage, currentLimit, startDate, endDate],
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
  const invalidatePayments = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [`${PAYMENTS_QUERY_KEY}-${clientId}`],
    });
  }, [queryClient, clientId]);

  return {
    data,
    payments: data?.data || [],
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
    invalidatePayments,
  };
};

export const useInvalidatePayments = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (clientId?: string) => {
      if (clientId) {
        queryClient.invalidateQueries({
          queryKey: [`${PAYMENTS_QUERY_KEY}-${clientId}`],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [PAYMENTS_QUERY_KEY],
        });
      }
    },
    [queryClient]
  );
};