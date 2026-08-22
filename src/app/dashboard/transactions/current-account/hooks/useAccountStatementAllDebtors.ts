import { getAccountStatementAllDebtors } from "@/app/dashboard/transactions/current-account/services";
import { AccountStatementStatus } from "@/app/dashboard/transactions/current-account/services/types";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

interface UseAccountStatementAllDebtorsParams {
  accessToken: string;
  clientId: string;
  initialPage?: number;
  initialLimit?: number;
}

const ACCOUNT_STATEMENT_ALL_DEBTORS_QUERY_KEY = "account-statement-all-debtors";

export const useAccountStatementAllDebtors = ({
  accessToken,
  clientId,
  initialPage = 1,
  initialLimit = 15,
}: UseAccountStatementAllDebtorsParams) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<AccountStatementStatus>("open");

  const queryFn = useCallback(
    () =>
      getAccountStatementAllDebtors(accessToken, clientId, {
        page: currentPage,
        limit: currentLimit,
        search: searchTerm,
        status,
      }),
    [accessToken, clientId, currentPage, currentLimit, searchTerm, status]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      `${ACCOUNT_STATEMENT_ALL_DEBTORS_QUERY_KEY}-${clientId}`,
      currentPage,
      currentLimit,
      searchTerm,
      status,
    ],
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

  const handleStatusChange = useCallback((next: AccountStatementStatus) => {
    setStatus(next);
    setCurrentPage(1);
  }, []);

  return {
    rows: data?.data || [],
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
    status,
    handleStatusChange,
    currentPage,
    currentLimit,
  };
};
