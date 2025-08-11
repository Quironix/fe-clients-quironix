"use client";

import { RowSelectionState } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { getPaymentPlans } from "../services";
import {
  PaginationParams,
  PaymentPlanResponse,
  PaymentPlanStatus,
} from "../types";

export interface PaymentPlansFilters {
  search?: string;
  status?: PaymentPlanStatus | "ALL";
  dateFrom?: string;
  dateTo?: string;
  debtor_id?: string;
}

const adaptApiResponseToPaymentPlans = (
  apiData: any
): PaymentPlanResponse[] => {
  if (!apiData?.data) return [];
  return Array.isArray(apiData.data) ? apiData.data : [];
};

export function usePaymentPlans(
  accessToken?: string,
  clientId?: string,
  useMockData: boolean = false
) {
  const [data, setData] = useState<PaymentPlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerSideLoading, setIsServerSideLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [filters, setFilters] = useState<PaymentPlansFilters>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar datos de localStorage después de la hidratación
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("paymentPlansSelection");
      if (saved) {
        try {
          const parsedSelection = JSON.parse(saved);
          setRowSelection(parsedSelection);
        } catch (error) {
          console.error("Error parsing localStorage selection:", error);
        }
      }
      setIsHydrated(true);
    }
  }, []);

  const fetchPaymentPlans = useCallback(
    async (
      page: number = 1,
      limit: number = 15,
      searchFilters: PaymentPlansFilters = {}
    ) => {
      setIsServerSideLoading(true);

      try {
        if (accessToken && clientId) {
          const params: PaginationParams = {
            page,
            limit,
            search: searchFilters.search,
          };

          const apiResponse = await getPaymentPlans(
            accessToken,
            clientId,
            params
          );

          if (apiResponse.success && apiResponse.data) {
            const adaptedData = adaptApiResponseToPaymentPlans(apiResponse);

            const total = apiResponse.pagination?.total || adaptedData.length;
            const totalPages =
              apiResponse.pagination?.totalPages || Math.ceil(total / limit);

            const newPagination = {
              page,
              limit,
              total,
              totalPages,
              hasNext: page < totalPages,
              hasPrevious: page > 1,
            };

            setData(adaptedData);
            setPagination(newPagination);
          } else {
            setData([]);
            setPagination({
              page: 1,
              limit,
              total: 0,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching payment plans:", error);
        setData([]);
        setPagination({
          page: 1,
          limit,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        });
      } finally {
        setIsServerSideLoading(false);
      }
    },
    [accessToken, clientId, useMockData]
  );

  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      fetchPaymentPlans(page, pageSize, filters);
    },
    [fetchPaymentPlans, filters]
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      if (search === filters.search) return;

      const newFilters = { ...filters, search };
      setFilters(newFilters);
      fetchPaymentPlans(1, pagination.limit, newFilters);
    },
    [fetchPaymentPlans, filters, pagination.limit]
  );

  const handleFilterChange = useCallback(
    (newFilters: PaymentPlansFilters) => {
      setFilters(newFilters);
      fetchPaymentPlans(1, pagination.limit, newFilters);
    },
    [fetchPaymentPlans, pagination.limit]
  );

  const refetch = useCallback(() => {
    clearRowSelection();
    fetchPaymentPlans(pagination.page, pagination.limit, filters);
  }, [fetchPaymentPlans, pagination.page, pagination.limit, filters]);

  const handleRowSelectionChange = useCallback(
    (updater: any) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      localStorage.setItem(
        "paymentPlansSelection",
        JSON.stringify(newSelection)
      );
    },
    [rowSelection]
  );

  const getSelectedRows = useCallback(() => {
    return data.filter((_, index) => rowSelection[index]);
  }, [data, rowSelection]);

  const clearRowSelection = useCallback(() => {
    setRowSelection({});
    if (typeof window !== "undefined") {
      localStorage.removeItem("paymentPlansSelection");
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchPaymentPlans().finally(() => setIsLoading(false));
  }, [fetchPaymentPlans]);

  return {
    data,
    isLoading,
    isServerSideLoading,
    pagination,
    filters,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    refetch,
    rowSelection,
    handleRowSelectionChange,
    getSelectedRows,
    clearRowSelection,
    isHydrated,
  };
}
