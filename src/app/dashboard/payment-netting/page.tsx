"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import { Archive, Eye, FileCheck2, Trash2 } from "lucide-react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DataTableDynamicColumns } from "../components/data-table-dynamic-columns";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { columns } from "./components/columns";
import FilterInputs, { FilterInputsRef } from "./components/filter";
import { usePaymentNetting } from "./hooks/usePaymentNetting";
import { updateReconciliationTableProfile } from "./services";

export default function PaymentNettingPage() {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const router = useRouter();
  const {
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
  } = usePaymentNetting(session?.token, profile?.client_id, false);
  const filterInputsRef = useRef<FilterInputsRef>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const [columnConfiguration, setColumnConfiguration] = useState<
    Array<{ name: string; is_visible: boolean }>
  >([
    { name: "id", is_visible: false },
    { name: "status", is_visible: true },
    { name: "amount", is_visible: true },
    { name: "bank", is_visible: true },
    { name: "account_number", is_visible: true },
    { name: "code", is_visible: true },
    { name: "description", is_visible: true },
    { name: "comment", is_visible: true },
    { name: "date", is_visible: true },
    { name: "actions", is_visible: true },
  ]);

  const columnVisibility = useMemo(() => {
    const visibility: VisibilityState = {};
    columnConfiguration.forEach((col) => {
      visibility[col.name] = col.is_visible;
    });
    return visibility;
  }, [columnConfiguration]);

  useEffect(() => {
    if (profile?.profile?.reconciliation_table?.length > 0) {
      const savedConfig = profile.profile.reconciliation_table;
      if (Array.isArray(savedConfig)) {
        setColumnConfiguration(savedConfig);
      }
    }
  }, [profile?.profile]);
  const columnLabels = useMemo(
    () => ({
      id: "ID",
      status: "Estado",
      amount: "Importe",
      bank: "Banco",
      account_number: "Nº de cuenta",
      code: "Código",
      description: "Descripción",
      comment: "Comentario",
      actions: "Acciones",
    }),
    []
  );

  const bulkActions = useMemo(
    () => [
      {
        label: "Ver detalles",
        onClick: (selectedRows: any[]) => {
          console.log("Ver detalles de elementos seleccionados:", selectedRows);
        },
        variant: "outline" as const,
        icon: <Eye className="h-4 w-4" />,
      },
      {
        label: "Archivar",
        onClick: (selectedRows: any[]) => {
          console.log("Archivar elementos seleccionados:", selectedRows);
        },
        variant: "secondary" as const,
        icon: <Archive className="h-4 w-4" />,
      },
      {
        label: "Eliminar",
        onClick: (selectedRows: any[]) => {
          console.log("Eliminar elementos seleccionados:", selectedRows);
        },
        variant: "destructive" as const,
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
    []
  );

  const handleUpdateColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    setIsApplyingFilters(true);
    try {
      const configToSave = config || columnConfiguration;

      const response = await updateReconciliationTableProfile({
        accessToken: session?.token,
        clientId: profile?.client_id,
        userId: profile?.id,
        reconciliationTable: configToSave,
      });

      if (response.success) {
        if (config) {
          setColumnConfiguration(config);
        }

        const storedProfile = localStorage.getItem("profile");
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile?.profile) {
            parsedProfile.profile.reconciliation_table = configToSave;
            localStorage.setItem("profile", JSON.stringify(parsedProfile));
          }
        }

        if (filterInputsRef.current) {
          const currentFilters = filterInputsRef.current.getCurrentFilters();
          await handleFilterChange(currentFilters);
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error al actualizar configuración de columnas:", error);
      toast.error("Error al guardar la configuración de columnas");
    } finally {
      setIsApplyingFilters(false);
    }
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Compensación de pagos"
          description="En esta sección podrás realizar la compensación de pagos entre tus clientes y proveedores."
          icon={<FileCheck2 color="white" />}
          subDescription="Compensación de pagos"
        />

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
              enableGlobalFilter={true}
              searchPlaceholder="Buscar"
              enableColumnFilter={true}
              initialColumnVisibility={columnVisibility}
              initialColumnConfiguration={columnConfiguration}
              columnLabels={columnLabels}
              ctaNode={
                <>
                  <Button
                    className="bg-orange-400 text-white hover:bg-orange-400/90"
                    onClick={() => {
                      console.log("Asignar deudor");
                    }}
                  >
                    Asignar deudor
                  </Button>
                  <Button
                    className="bg-orange-400 text-white hover:bg-orange-400/90"
                    onClick={() => {
                      router.push(
                        "/dashboard/payment-netting/generate-payment"
                      );
                    }}
                  >
                    Generar pago
                  </Button>
                </>
              }
              enableRowSelection={true}
              initialRowSelection={isHydrated ? rowSelection : {}}
              onRowSelectionChange={handleRowSelectionChange}
              bulkActions={bulkActions}
              emptyMessage="No se encontraron conciliaciones"
              className="rounded-lg"
              title="Historial de pagos"
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
      </Main>
    </>
  );
}
