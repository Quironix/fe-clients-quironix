"use client";

import { useCallback, useEffect, useState } from "react";
import { getPaymentNetting } from "../services";
import {
  BankMovementStatusEnum,
  PaymentNetting,
  PaymentNettingFilters,
} from "../types";
// Adaptador para transformar respuesta del servicio al formato esperado
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

// Mapear status del API al formato local

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

  // Fetch de datos con servicio real o mock
  const fetchPaymentNettings = useCallback(
    async (
      page: number = 1,
      limit: number = 15,
      searchFilters: PaymentNettingFilters = {}
    ) => {
      setIsServerSideLoading(true);

      try {
        // Usar servicio real
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

            // Calcular paginación desde la respuesta del API
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
            console.error(
              "Error fetching payment nettings:",
              apiResponse.message
            );
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
        console.error("Error in fetchPaymentNettings:", error);
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

  // Manejar cambio de paginación
  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      fetchPaymentNettings(page, pageSize, filters);
    },
    [fetchPaymentNettings, filters]
  );

  // Manejar cambio de búsqueda
  const handleSearchChange = useCallback(
    (search: string) => {
      if (search === filters.search) return; // Evitar llamadas duplicadas

      const newFilters = { ...filters, search };
      setFilters(newFilters);
      fetchPaymentNettings(1, pagination.limit, newFilters);
    },
    [fetchPaymentNettings, filters, pagination.limit]
  );

  // Memoizar refetch para evitar re-renders innecesarios
  const refetch = useCallback(() => {
    fetchPaymentNettings(pagination.page, pagination.limit, filters);
  }, [fetchPaymentNettings, pagination.page, pagination.limit, filters]);

  // Cargar datos iniciales
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
    refetch,
  };
}
