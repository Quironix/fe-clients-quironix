"use client";

import { useProfileContext } from "@/context/ProfileContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { updateLitigationTableProfile } from "../services";
import { Litigation, LitigationItem } from "../types";

import { Card, CardContent } from "@/components/ui/card";
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
      invoice_number: "N° Factura",
      debtor_name: "Deudor",
      dispute_entry: "Ingreso de litigio",
      client_code: "Días de disputa",
      dispute_amount: "Monto de litigio",
      invoice_balance: "Saldo factura",
      approver: "Aprobador",
      reason: "Motivo",
      sub_reason: "Submotivo",
      actions: "Acción",
    }),
    []
  );

  const bulkActions = useMemo(
    () => [
      {
        label: "Ver detalles",
        onClick: async (selectedRows: Litigation[]) => {
          if (selectedRows.length > 0) {
            // setSelectedLitigation(selectedRows[0]);
            // setShowDetailModal(true);
          } else {
            toast.warning("Selecciona al menos un litigio para ver detalles.");
          }
        },
        variant: "outline" as const,
        icon: <Eye className="h-4 w-4" />,
      },
      {
        label: "Editar factura",
        onClick: async (selectedRows: Litigation[]) => {
          console.log("Editar factura:", selectedRows);
          toast("Función de edición aún no implementada");
        },
        variant: "secondary" as const,
        icon: <Archive className="h-4 w-4" />,
      },
      {
        label: "Normalizar",
        onClick: async (selectedRows: Litigation[]) => {
          try {
            // Aquí va endpoint para normalizar
            console.log("Normalizar factura:", selectedRows);
            toast.success("Litigios normalizados correctamente");
            await refetch();
            clearRowSelection();
          } catch (err) {
            console.error("Error normalizando:", err);
            toast.error("Ocurrió un error al normalizar");
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
      toast.error("Ocurrió un error al guardar la configuración de columnas.");
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
          searchPlaceholder="Buscar"
          enableColumnFilter
          columnLabels={columnLabels}
          onRowSelectionChange={handleRowSelectionChange}
          bulkActions={bulkActions}
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
          initialColumnConfiguration={columnConfiguration}
        />
      </CardContent>
    </Card>
  );
};

export default ListLitigation;
