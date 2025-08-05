"use client";

import { RowSelectionState } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { getPaymentPlans } from "../services";
import {
  BankMovementStatusEnum,
  PaymentPlans,
  PaymentPlansFilters,
} from "../types";

const adaptApiResponseToPaymentPlans = (apiData: any): PaymentPlans[] => {
  if (!apiData?.data) return [];
  return apiData.data.map((item: any) => ({
    id: item.id,
    date: item?.created_at
      ? new Date(item.created_at).toISOString().split("T")[0]
      : "",
    amount: parseFloat(item.amount) || 0,
    bank: item.bank_information?.bank || "",
    account_number: item.bank_information?.account_number || "",
    status: mapApiStatusToLocal(item.status),
    code: "-",
    description: item.description || "",
    comment: item.comment || "",
  }));
};

const mapApiStatusToLocal = (apiStatus: string): BankMovementStatusEnum => {
  const statusMap: Record<string, BankMovementStatusEnum> = {
    APPROVED: BankMovementStatusEnum.APPROVED,
    WITH_OBSERVATIONS: BankMovementStatusEnum.WITH_OBSERVATIONS,
    REJECTED: BankMovementStatusEnum.REJECTED,
    IN_REVIEW: BankMovementStatusEnum.IN_REVIEW,
  };

  const normalizedStatus = apiStatus?.toUpperCase();
  return statusMap[normalizedStatus] || BankMovementStatusEnum.IN_REVIEW;
};


export function usePaymentPlans(
  accessToken?: string,
  clientId?: string,
  useMockData: boolean = false
) {
  const [data, setData] = useState<PaymentPlans[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("paymentPlanselection");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const fetchPaymentPlans = useCallback(
    async (
      page: number = 1,
      limit: number = 15,
      searchFilters: PaymentPlansFilters = {}
    ) => {
      setIsServerSideLoading(true);
      try {
        if (accessToken && clientId) {
          const apiResponse = await getPaymentPlans({
            accessToken,
            clientId,
            page,
            limit,
            status: searchFilters.status || "ALL",
          });

          const total = apiResponse.pagination?.total || 0;
          const totalPages = Math.ceil(total / limit);

          const adaptedData = adaptApiResponseToPaymentPlans(apiResponse);

          setData(adaptedData);
          setPagination({
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
          });
        }
      } catch (error) {
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
    [accessToken, clientId]
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
    fetchPaymentPlans(pagination.page, pagination.limit, filters);
  }, [fetchPaymentPlans, pagination.page, pagination.limit, filters]);

  const handleRowSelectionChange = useCallback(
    (updater: any) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      localStorage.setItem("paymentPlanselection", JSON.stringify(newSelection));
    },
    [rowSelection]
  );

  const getSelectedRows = useCallback(() => {
    return data.filter((_, index) => rowSelection[index]);
  }, [data, rowSelection]);

  const clearRowSelection = useCallback(() => {
    setRowSelection({});
    localStorage.removeItem("paymentPlanselection");
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
  };
}
