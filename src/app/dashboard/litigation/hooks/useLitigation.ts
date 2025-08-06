"use client";

import { RowSelectionState } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { getLitigations } from "../services";
import { Litigation, LitigationFilters } from "../types";

const adaptApiResponseToLitigation = (apiData: any): Litigation[] => {
  if (!apiData?.data || !Array.isArray(apiData.data)) return [];
  return apiData.data;
};

export function useLitigation(accessToken?: string, clientId?: string) {
  const [data, setData] = useState<Litigation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isServerSideLoading, setIsServerSideLoading] =
    useState<boolean>(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [filters, setFilters] = useState<LitigationFilters>({});

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("paymentNettingSelection");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const fetchLitigations = useCallback(
    async (
      page: number = 1,
      limit: number = 15,
      searchFilters: LitigationFilters = {}
    ) => {
      setIsServerSideLoading(true);

      try {
        if (!accessToken || !clientId) return;

        const apiResponse = await getLitigations({
          accessToken,
          clientId,
          page,
          limit,
          motivo: searchFilters.motivo,
          status: searchFilters.status,
        });

        const adaptedData = adaptApiResponseToLitigation(apiResponse);
        const total = apiResponse?.total || 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        setData(adaptedData);
        setPagination({
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        });
      } catch (error) {
        console.error("Error al obtener litigios:", error);
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
      fetchLitigations(page, pageSize, filters);
    },
    [fetchLitigations, filters]
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      if (search === filters.search) return;

      const newFilters = { ...filters, search };
      setFilters(newFilters);
      fetchLitigations(1, pagination.limit, newFilters);
    },
    [fetchLitigations, filters, pagination.limit]
  );

  const handleFilterChange = useCallback(
    (newFilters: LitigationFilters) => {
      setFilters(newFilters);
      fetchLitigations(1, pagination.limit, newFilters);
    },
    [fetchLitigations, pagination.limit]
  );

  const refetch = useCallback(() => {
    fetchLitigations(pagination.page, pagination.limit, filters);
  }, [fetchLitigations, pagination.page, pagination.limit, filters]);

  const handleRowSelectionChange = useCallback(
    (
      updater:
        | RowSelectionState
        | ((prev: RowSelectionState) => RowSelectionState)
    ) => {
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
    localStorage.removeItem("paymentNettingSelection");
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchLitigations().finally(() => setIsLoading(false));
  }, [fetchLitigations]);

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
