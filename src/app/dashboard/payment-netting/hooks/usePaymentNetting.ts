"use client";

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
  };
  return statusMap[apiStatus?.toUpperCase()] || "pending";
};

export function usePaymentNetting(
  accessToken?: string,
  clientId?: string,
  useMockData: boolean = false
) {
  const [data, setData] = useState<PaymentNetting[]>([]);
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
  const [filters, setFilters] = useState<PaymentNettingFilters>({});

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
  };
}
