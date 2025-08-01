"use client";

import { useCallback, useEffect, useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import { getLitigations } from "../services";
import {
  Litigation,
  LitigationFilters,
  LitigationMovementStatusEnum,
} from "../types";

const mapApiStatusToLocal = (
  apiStatus: string
): LitigationMovementStatusEnum => {
  const statusMap: Record<string, LitigationMovementStatusEnum> = {
    PENDING: LitigationMovementStatusEnum.PENDING,
    PROCESSED: LitigationMovementStatusEnum.PROCESSED,
    REJECTED: LitigationMovementStatusEnum.REJECTED,
    ELIMINATED: LitigationMovementStatusEnum.ELIMINATED,
    COMPENSATED: LitigationMovementStatusEnum.COMPENSATED,
    REJECTED_DUPLICATE: LitigationMovementStatusEnum.REJECTED_DUPLICATE,
    ELIMINATED_NEGATIVE_AMOUNT:
      LitigationMovementStatusEnum.ELIMINATED_NEGATIVE_AMOUNT,
    ELIMINATED_NO_TRACKING: LitigationMovementStatusEnum.ELIMINATED_NO_TRACKING,
    MAINTAINED: LitigationMovementStatusEnum.MAINTAINED,
  };
  return statusMap[apiStatus?.toUpperCase()] ?? LitigationMovementStatusEnum.PENDING;
};

const adaptApiResponseToLitigation = (apiData: any): Litigation[] => {
  if (!apiData?.data || !Array.isArray(apiData.data)) return [];

  return apiData.data.map((item: any): Litigation => ({
    invoice_number: item.invoice_number ?? item.number ?? "-",
    number: item.number ?? "-",
    debtor_id: item.debtor_id ?? "-",
    company_id: item.company_id ?? null,
    name: item?.debtor?.name ?? item?.name ?? "Nombre no disponible",
    date: item.created_at
      ? new Date(item.created_at).toISOString().split("T")[0]
      : "",
    disputeDays: item?.dispute_days
      ? `${item.dispute_days} días`
      : "30 días",

    approver: item?.approver ?? "Nombre Apellido",
    reason: item?.reason ?? "Sin motivo",
    subreason: item?.subreason ?? "Sin submotivo",

    amount: parseFloat(item.amount ?? "0") || 0,
    invoiceAmount: parseFloat(item.invoice_amount ?? "0") || 0,
    litigationAmount: parseFloat(item.litigation_amount ?? "0") || 0,

    bank_information: {
      bank: item?.bank_information?.bank ?? "",
      account_number: item?.bank_information?.account_number ?? "",
    },

    status: mapApiStatusToLocal(item.status),
    code: "-",
    description: item.description ?? "",
    comment: item.comment ?? "",
    id: "",
    invoice_id: "",
    litigation_amount: 0,
    motivo: "",
    submotivo: "",
    contact: "",
    normalization_reason: "",
    normalization_by_contact: "",
    created_by: "",
    creator: {
      id: "",
      first_name: "",
      last_name: "",
      client_id: "",
      type: "",
      email: "",
      phone_number: "",
      created_at: "",
      updated_at: ""
    },
    approved_by: "",
    debtor: {
      id: "",
      name: "",
      client_id: "",
      channel: "",
      debtor_code: "",
      addresses: [],
      payment_method: "",
      dni_id: "",
      currency: "",
      email: "",
      phone: "",
      communication_channel: "",
      contacts: [],
      category: "",
      economic_activities: [],
      sales_person: undefined,
      attention_days_hours: [],
      executive_id: "",
      created_at: "",
      updated_at: "",
      company_id: "",
      company: undefined,
      comments: []
    }
  }));
};


export function useLitigation(
  accessToken?: string,
  clientId?: string
) {
  const [data, setData] = useState<Litigation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isServerSideLoading, setIsServerSideLoading] = useState<boolean>(false);
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

        const apiResponse = await getLitigations(
          accessToken,
          clientId,
        );
         console.log('apiResponse', apiResponse.data)
        const adaptedData = adaptApiResponseToLitigation(apiResponse);
        console.log('adaptedData', adaptedData)
        const total = apiResponse?.pagination?.total || 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        setData(apiResponse.data);
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
    (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      localStorage.setItem("paymentNettingSelection", JSON.stringify(newSelection));
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
