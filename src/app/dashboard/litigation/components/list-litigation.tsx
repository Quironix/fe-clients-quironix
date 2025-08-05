"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useProfileContext } from "@/context/ProfileContext";
import { useLitigation } from "../hooks/useLitigation";
import { updateReconciliationTableProfile } from "../services";
import { Litigation } from "../types";

import { Card, CardContent } from "@/components/ui/card";
import { VisibilityState } from "@tanstack/react-table";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import FilterInputs, { FilterInputsRef } from "../../payment-netting/components/filter";
import { columns } from "./columns";

const ListLitigation = () => {
  const { session, profile } = useProfileContext();
  const [selectedLitigation, setSelectedLitigation] = useState<Litigation | null>(null);
  const [modalType, setModalType] = useState<"none" | "detail" | "edit" | "normalize">("none");

  const {
    data,
    isLoading,
    isServerSideLoading,
    pagination,
    filters,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    rowSelection,
    handleRowSelectionChange,
    getSelectedRows,
    clearRowSelection,
    refetch,
  } = useLitigation(session?.token, profile?.client_id);

  const filterInputsRef = useRef<FilterInputsRef>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const [columnConfiguration, setColumnConfiguration] = useState<
    Array<{ name: string; is_visible: boolean }>
  >([
    { name: "id", is_visible: false },
    { name: "invoice_number", is_visible: true },
    { name: "debtor_id", is_visible: true },
    { name: "dispute_days", is_visible: true },
    { name: "litigation_amount", is_visible: true },
    { name: "description", is_visible: true },
    { name: "motivo", is_visible: true },
    { name: "contact", is_visible: true },
    { name: "submotivo", is_visible: true },
    { name: "initial_comment", is_visible: true },
  ]);

  useEffect(() => {
    const savedConfig = profile?.profile?.reconciliation_table;
    if (Array.isArray(savedConfig)) {
      setColumnConfiguration(savedConfig);
    }
  }, [profile?.profile?.reconciliation_table]);

  const columnVisibility = useMemo<VisibilityState>(() => {
    return columnConfiguration.reduce((acc, col) => {
      acc[col.name] = col.is_visible;
      return acc;
    }, {} as VisibilityState);
  }, [columnConfiguration]);

  const handleUpdateColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    setIsApplyingFilters(true);

    const configToSave = config || columnConfiguration;

    try {
      const response = await updateReconciliationTableProfile({
        accessToken: session?.token,
        clientId: profile?.client_id,
        userId: profile?.id,
        reconciliationTable: configToSave,
      });

      if (response.success) {
        if (config) setColumnConfiguration(config);

        const storedProfile = localStorage.getItem("profile");
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile?.profile) {
            parsedProfile.profile.reconciliation_table = configToSave;
            localStorage.setItem("profile", JSON.stringify(parsedProfile));
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
      toast.error("Ocurrió un error al guardar la configuración de columnas.");
    } finally {
      setIsApplyingFilters(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <DataTableDynamicColumns
            columns={columns}
            data={data}
            isLoading={isLoading}
            isServerSideLoading={isServerSideLoading}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearchChange}
            enableGlobalFilter
            searchPlaceholder="Buscar"
            enableColumnFilter
       
            onRowSelectionChange={handleRowSelectionChange}
            emptyMessage="No se encontraron litigios"
            className="rounded-lg"
            title="Historial de litigios"
            handleSuccessButton={handleUpdateColumns}
            filterInputs={
              <FilterInputs
                ref={filterInputsRef}
                onFilterChange={handleFilterChange}
                initialFilters={filters}
              />
            }
            isApplyingFilters={isApplyingFilters}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ListLitigation;
