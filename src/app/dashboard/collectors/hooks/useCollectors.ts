"use client";

import { RowSelectionState } from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAll } from "../services";
import { CollectorResponse } from "../services/types";

export interface CollectorsFilters {
  search?: string;
  channel?: "EMAIL" | "WHATSAPP" | "SMS";
  status?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const adaptApiResponseToCollectors = (apiData: any): CollectorResponse[] => {
  if (!apiData) return [];
  if (Array.isArray(apiData)) return apiData;
  if (apiData?.data && Array.isArray(apiData.data)) return apiData.data;
  if (apiData?.collectors && Array.isArray(apiData.collectors)) return apiData.collectors;
  return [];
};

export function useCollectors(
  accessToken?: string,
  clientId?: string,
  initialFilters: CollectorsFilters = {}
) {
  const [data, setData] = useState<CollectorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerSideLoading, setIsServerSideLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [filters, setFilters] = useState<CollectorsFilters>(initialFilters);
  const initialFiltersRef = useRef(initialFilters);
  const hasInitialized = useRef(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("collectorsSelection");
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

  const fetchCollectors = useCallback(
    async (
      page: number = 1,
      limit: number = 15,
      searchFilters: CollectorsFilters = {}
    ) => {
      setIsServerSideLoading(true);

      try {
        if (accessToken && clientId) {
          const apiResponse = await getAll(accessToken, clientId);
          console.log("API Response:", apiResponse);

          const adaptedData = adaptApiResponseToCollectors(apiResponse);
          console.log("Adapted Data:", adaptedData);

          let filteredData = adaptedData;

          if (searchFilters.search) {
            const searchLower = searchFilters.search.toLowerCase();
            filteredData = filteredData.filter(
              (collector) =>
                collector.name.toLowerCase().includes(searchLower) ||
                collector.description.toLowerCase().includes(searchLower)
            );
          }

          if (searchFilters.channel) {
            filteredData = filteredData.filter(
              (collector) => collector.channel === searchFilters.channel
            );
          }

          if (searchFilters.status !== undefined) {
            filteredData = filteredData.filter(
              (collector) => collector.status === searchFilters.status
            );
          }

          const total = filteredData.length;
          const totalPages = Math.ceil(total / limit);
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedData = filteredData.slice(startIndex, endIndex);

          const newPagination = {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
          };

          console.log("Setting paginated data:", paginatedData);
          console.log("Setting pagination:", newPagination);

          setData(paginatedData);
          setPagination(newPagination);
        }
      } catch (error) {
        console.error("Error fetching collectors:", error);
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
      fetchCollectors(page, pageSize, filters);
    },
    [fetchCollectors, filters]
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      if (search === filters.search) return;

      const newFilters = { ...filters, search };
      setFilters(newFilters);
      fetchCollectors(1, pagination.limit, newFilters);
    },
    [fetchCollectors, filters, pagination.limit]
  );

  const handleFilterChange = useCallback(
    (newFilters: CollectorsFilters) => {
      setFilters(newFilters);
      fetchCollectors(1, pagination.limit, newFilters);
    },
    [fetchCollectors, pagination.limit]
  );

  const refetch = useCallback(() => {
    clearRowSelection();
    fetchCollectors(pagination.page, pagination.limit, filters);
  }, [fetchCollectors, pagination.page, pagination.limit, filters]);

  const handleRowSelectionChange = useCallback(
    (updater: any) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      if (typeof window !== "undefined") {
        localStorage.setItem("collectorsSelection", JSON.stringify(newSelection));
      }
    },
    [rowSelection]
  );

  const getSelectedRows = useCallback(() => {
    return data.filter((_, index) => rowSelection[index]);
  }, [data, rowSelection]);

  const clearRowSelection = useCallback(() => {
    setRowSelection({});
    if (typeof window !== "undefined") {
      localStorage.removeItem("collectorsSelection");
    }
  }, []);

  useEffect(() => {
    if (accessToken && clientId && !hasInitialized.current) {
      hasInitialized.current = true;
      setIsLoading(true);
      fetchCollectors(1, 15, initialFiltersRef.current).finally(() =>
        setIsLoading(false)
      );
    }
  }, [accessToken, clientId, fetchCollectors]);

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
