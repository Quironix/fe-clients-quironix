"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { RowSelectionState, VisibilityState } from "@tanstack/react-table";
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
import { usePaymentPlans } from "./hooks/usePaymentPlans";
import Image from "next/image";
import { updateReconciliationTableProfile } from "./services";

export default function PaymentPlans() {
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
  } = usePaymentPlans(session?.token, profile?.client_id, false);
  const filterInputsRef = useRef<FilterInputsRef>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const [columnConfiguration, setColumnConfiguration] = useState<
  Array<{ name: string; is_visible: boolean }>
>([
  { name: "id", is_visible: true },
  { name: "debtor", is_visible: true },
  { name: "status", is_visible: true },
  { name: "account_number", is_visible: true },
  { name: "code", is_visible: true },
  { name: "date", is_visible: true },
  { name: "inicio_pago", is_visible: true },
  { name: "termino_pago", is_visible: true },
  { name: "comment", is_visible: true },
  { name: "approver", is_visible: true },
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
      id: "Request No.",
      debtor: "Debtor",
      status: "Status",
      account_number: "Total Debt",
      code: "Installments No.",
      date: "Installment Amount",
      inicio_pago: "Start of Payment", 
      comment: "Comment",
      termino_pago: "End of Payment", 
      approver: "Approver",
      actions: "Action",
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

  const handleCreateClick = () => {
    router.push("/dashboard/payment-plans/create-payments-plans");
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection 
          icon={<FileCheck2 color="white" />}
          subDescription="Planes de pagos"
              />
              
              <div className="flex items-center gap-2  py-4 px-3 border border-gray-200 rounded-md h-[320px] bg-white my-6">
          <div className="w-[50%] h-full">
            <Image
              src="/img/image-planes-de-pago.svg"
              alt="Deudores"
              className="w-full h-full object-cover rounded-lg"
              width={100}
              height={100}
            />
          </div>

          <div className="flex flex-col justify-center w-full border rounded-lg p-5 h-full">
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad soluta, quae eos perspiciatis et aperiam delectus natus explicabo nulla obcaecati rem necessitatibus impedit. Eligendi maxime inventore ad provident aut et.</p>
            
              <div>
                    <Button className="mt-4 px-10 bg-[#1249C7] text-white hover:bg-[#1249C7]/90"  onClick={handleCreateClick}>Crear plan de pago</Button>
              </div> 
          </div>

        
        </div>
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
              enableRowSelection={true}
              initialRowSelection={rowSelection}
              onRowSelectionChange={handleRowSelectionChange}
              bulkActions={bulkActions}
              emptyMessage="No se encontraron conciliaciones"
              className="rounded-lg"
              title="Solicitudes de planes de pago"
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
