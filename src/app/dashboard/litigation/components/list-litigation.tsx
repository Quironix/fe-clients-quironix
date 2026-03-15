"use client";

import { useProfileContext } from "@/context/ProfileContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { updateLitigationTableProfile } from "../services";
import { Litigation, LitigationItem } from "../types";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Archive, Eye, Trash2 } from "lucide-react";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import { getColumns } from "./columns";
import FilterInputs, { FilterInputsRef } from "./filter";

interface ListLitigationProps {
  litigationHook: ReturnType<
    typeof import("../hooks/useLitigation").useLitigation
  >;
}

const ListLitigation = ({ litigationHook }: ListLitigationProps) => {
  const t = useTranslations("litigation");
  const { session, profile } = useProfileContext();

  const {
    data,
    isLoading,
    isServerSideLoading,
    pagination,
    filters,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    handleRowSelectionChange,
    clearRowSelection,
    refetch,
  } = litigationHook;

  const filterInputsRef = useRef<FilterInputsRef>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const [columnConfiguration, setColumnConfiguration] = useState<
    Array<{ name: string; is_visible: boolean }>
  >(
    profile?.profile?.litigations_table || [
      { name: "id", is_visible: false },
      { name: "invoice_id", is_visible: false },
      { name: "debtor_id", is_visible: true },
      { name: "litigation_amount", is_visible: true },
      { name: "description", is_visible: true },
      { name: "motivo", is_visible: true },
      { name: "contact", is_visible: true },
      { name: "submotivo", is_visible: true },
      { name: "initial_comment", is_visible: true },
    ]
  );

  useEffect(() => {
    const savedConfig = profile?.profile?.litigations_table;
    if (Array.isArray(savedConfig)) {
      setColumnConfiguration(savedConfig);
    }
  }, [profile?.profile?.litigations_table]);

  const columnLabels = useMemo(
    () => ({
      invoice_number: t("columnLabels.invoiceNumber"),
      debtor_name: t("columnLabels.debtor"),
      dispute_entry: t("columnLabels.disputeEntry"),
      client_code: t("columnLabels.disputeDays"),
      dispute_amount: t("columnLabels.disputeAmount"),
      invoice_balance: t("columnLabels.invoiceBalance"),
      approver: t("columnLabels.approver"),
      reason: t("columnLabels.reason"),
      sub_reason: t("columnLabels.subReason"),
      actions: t("columnLabels.actions"),
    }),
    [t]
  );

  const bulkActions = useMemo(
    () => [
      {
        label: t("actions.viewDetails"),
        onClick: async (selectedRows: Litigation[]) => {
          if (selectedRows.length > 0) {
            // setSelectedLitigation(selectedRows[0]);
            // setShowDetailModal(true);
          } else {
            toast.warning(t("actions.selectAtLeast"));
          }
        },
        variant: "outline" as const,
        icon: <Eye className="h-4 w-4" />,
      },
      {
        label: t("actions.editInvoice"),
        onClick: async (selectedRows: Litigation[]) => {
          console.log("Editar factura:", selectedRows);
          toast(t("actions.editNotImplemented"));
        },
        variant: "secondary" as const,
        icon: <Archive className="h-4 w-4" />,
      },
      {
        label: t("actions.normalize"),
        onClick: async (selectedRows: Litigation[]) => {
          try {
            console.log("Normalizar factura:", selectedRows);
            toast.success(t("toast.normalizedSuccess"));
            await refetch();
            clearRowSelection();
          } catch (err) {
            console.error("Error normalizando:", err);
            toast.error(t("toast.normalizedError"));
          }
        },
        variant: "destructive" as const,
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
    [clearRowSelection, refetch]
  );

  const handleUpdateColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    setIsApplyingFilters(true);

    const configToSave = config || columnConfiguration;

    try {
      const response = await updateLitigationTableProfile({
        accessToken: session?.token,
        clientId: profile?.client_id,
        userId: profile?.id,
        litigationTable: configToSave,
      });

      if (response.success) {
        if (config) setColumnConfiguration(config);

        if (typeof window !== "undefined") {
          const storedProfile = localStorage.getItem("profile");
          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);
            if (parsedProfile?.profile) {
              parsedProfile.profile.litigations_table = configToSave;
              localStorage.setItem("profile", JSON.stringify(parsedProfile));
            }
          }
        }

        const currentFilters = filterInputsRef.current?.getCurrentFilters();
        if (currentFilters) {
          await handleFilterChange(currentFilters);
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error al actualizar columnas:", error);
      toast.error(t("toast.columnConfigError"));
    } finally {
      setIsApplyingFilters(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <DataTableDynamicColumns
          columns={getColumns(refetch)}
          data={data as unknown as LitigationItem[]}
          isLoading={isLoading}
          isServerSideLoading={isServerSideLoading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onSearchChange={handleSearchChange}
          enableGlobalFilter
          searchPlaceholder={t("searchPlaceholder")}
          enableColumnFilter
          columnLabels={columnLabels}
          onRowSelectionChange={handleRowSelectionChange}
          bulkActions={bulkActions}
          emptyMessage={t("emptyMessage")}
          className="rounded-lg"
          title={t("historyTitle")}
          handleSuccessButton={handleUpdateColumns}
          filterInputs={
            <FilterInputs
              ref={filterInputsRef}
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          }
          isApplyingFilters={isApplyingFilters}
          initialColumnConfiguration={columnConfiguration}
        />
      </CardContent>
    </Card>
  );
};

export default ListLitigation;
