"use client";

import { RowSelectionState } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { getPaymentNetting } from "../services";
import {
  BankMovementStatusEnum,
  PaymentNetting,
  PaymentNettingFilters,
} from "../types";

const adaptApiResponseToPaymentNetting = (apiData: any): PaymentNetting[] => {
  if (!apiData?.data) return [];
  return apiData.data.map((item: any) => ({
    ...item,
    id: item.id,
    date: item?.created_at
      ? new Date(item.created_at).toISOString().split("T")[0]
      : "",
    amount: parseFloat(item.amount) || 0,
    bank: item.bank_information.bank || "",
    account_number: item.bank_information.account_number || "",
    status: mapApiStatusToLocal(item.status),
    code: "-",
    description: item.description || "",
    comment: item.comment || "",
  }));
};
const mapApiStatusToLocal = (apiStatus: string): BankMovementStatusEnum => {
  const statusMap: Record<string, BankMovementStatusEnum> = {
    PENDING: BankMovementStatusEnum.PENDING,
    PROCESSED: BankMovementStatusEnum.PROCESSED,
    REJECTED: BankMovementStatusEnum.REJECTED,
    ELIMINATED: BankMovementStatusEnum.ELIMINATED,
    COMPENSATED: BankMovementStatusEnum.COMPENSATED,
    REJECTED_DUPLICATE: BankMovementStatusEnum.REJECTED_DUPLICATE,
    ELIMINATED_NEGATIVE_AMOUNT:
      BankMovementStatusEnum.ELIMINATED_NEGATIVE_AMOUNT,
    ELIMINATED_NO_TRACKING: BankMovementStatusEnum.ELIMINATED_NO_TRACKING,
    MAINTAINED: BankMovementStatusEnum.MAINTAINED,
    PAYMENT_CREATED: BankMovementStatusEnum.PAYMENT_CREATED,
  };
  return statusMap[apiStatus?.toUpperCase()] || BankMovementStatusEnum.PENDING;
};

export function usePaymentNetting(
  accessToken?: string,
  clientId?: string,
  useMockData: boolean = false
) {
  const [data, setData] = useState<PaymentNetting[]>([]);
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
  const [filters, setFilters] = useState<PaymentNettingFilters>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar datos de localStorage después de la hidratación
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("paymentNettingSelection");
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

  const fetchPaymentNettings = useCallback(
    async (
      page: number = 1,
      limit: number = 15,
      searchFilters: PaymentNettingFilters = {}
    ) => {
      setIsServerSideLoading(true);

      try {
        if (accessToken && clientId) {
          const apiResponse = await getPaymentNetting({
            accessToken: accessToken || "",
            clientId: clientId || "",
            page,
            limit,
            status: searchFilters.status || "ALL",
            createdAtToFrom:
              searchFilters.dateFrom || searchFilters.createdAtFrom,
            createdAtTo: searchFilters.dateTo || searchFilters.createdAtTo,
          });

          if (apiResponse.data.length > 0) {
            const adaptedData = adaptApiResponseToPaymentNetting(apiResponse);

            const total = apiResponse.pagination?.total || 0;
            const totalPages = Math.ceil(total / limit);

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
      fetchPaymentNettings(page, pageSize, filters);
    },
    [fetchPaymentNettings, filters]
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      if (search === filters.search) return;

      const newFilters = { ...filters, search };
      setFilters(newFilters);
      fetchPaymentNettings(1, pagination.limit, newFilters);
    },
    [fetchPaymentNettings, filters, pagination.limit]
  );

  const handleFilterChange = useCallback(
    (newFilters: PaymentNettingFilters) => {
      setFilters(newFilters);
      fetchPaymentNettings(1, pagination.limit, newFilters);
    },
    [fetchPaymentNettings, pagination.limit]
  );

  const refetch = useCallback(() => {
    fetchPaymentNettings(pagination.page, pagination.limit, filters);
  }, [fetchPaymentNettings, pagination.page, pagination.limit, filters]);

  const handleRowSelectionChange = useCallback(
    (updater: any) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      localStorage.setItem(
        "paymentNettingSelection",
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
      localStorage.removeItem("paymentNettingSelection");
    }
    setIsHydrated(false);
    setRowSelection({});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchPaymentNettings().finally(() => setIsLoading(false));
  }, [fetchPaymentNettings]);

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
