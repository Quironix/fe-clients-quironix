"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import { Archive, CheckCircle, Coins, Eye, Trash2 } from "lucide-react";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DataTableDynamicColumns } from "../components/data-table-dynamic-columns";
import DialogForm from "../components/dialog-form";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { createColumns } from "./components/columns";
import FilterInputs, { FilterInputsRef } from "./components/filter";
import PendingModal from "./components/pending-modal";
import { usePaymentPlans } from "./hooks/usePaymentPlans";
import { approvePaymentPlan, deletePaymentPlan } from "./services";
import { PaymentPlan, PaymentPlanResponse } from "./types";

const PaymentPlansPage = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] =
    useState<PaymentPlanResponse | null>(null);
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
  } = usePaymentPlans(session?.token, profile?.client_id, false);
  const filterInputsRef = useRef<FilterInputsRef>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const [columnConfiguration, setColumnConfiguration] = useState<
    Array<{ name: string; is_visible: boolean }>
  >([
    { name: "id", is_visible: true },
    { name: "debtor_id", is_visible: true },
    { name: "status", is_visible: true },
    { name: "total_debt", is_visible: true },
    { name: "number_of_installments", is_visible: true },
    { name: "installment_amount", is_visible: true },
    { name: "payment_frequency", is_visible: true },
    { name: "plan_start_date", is_visible: true },
    { name: "payment_end_date", is_visible: true },
    { name: "annual_interest_rate", is_visible: false },
    { name: "created_at", is_visible: false },
    { name: "debt_concept", is_visible: true },
    { name: "actions", is_visible: true },
  ]);

  const columnVisibility = useMemo(() => {
    const visibility: VisibilityState = {};
    columnConfiguration.forEach((col) => {
      visibility[col.name] = col.is_visible;
    });
    return visibility;
  }, [columnConfiguration]);

  const columnLabels = useMemo(
    () => ({
      id: "ID",
      debtor_id: "Deudor",
      status: "Estado",
      total_debt: "Deuda Total",
      number_of_installments: "Cuotas",
      installment_amount: "Monto Cuota",
      payment_frequency: "Frecuencia",
      plan_start_date: "Fecha Inicio",
      payment_end_date: "Fecha Fin",
      annual_interest_rate: "Tasa Interés",
      created_at: "Fecha Creación",
      actions: "Acciones",
    }),
    []
  );

  const bulkActions = useMemo(
    () => [
      {
        label: "Ver detalles",
        onClick: (selectedRows: PaymentPlan[]) => {
          console.log("Ver detalles de planes seleccionados:", selectedRows);
        },
        variant: "outline" as const,
        icon: <Eye className="h-4 w-4" />,
      },
      {
        label: "Aprobar planes",
        onClick: async (selectedRows: PaymentPlan[]) => {
          if (!session?.token || !profile?.client_id) return;

          try {
            for (const plan of selectedRows) {
              await approvePaymentPlan(
                session.token,
                profile.client_id,
                plan.id
              );
            }
            toast.success("Planes aprobados correctamente");
            refetch();
          } catch (error) {
            toast.error("Error al aprobar los planes");
          }
        },
        variant: "default" as const,
        icon: <CheckCircle className="h-4 w-4" />,
      },
      {
        label: "Archivar",
        onClick: (selectedRows: PaymentPlanResponse[]) => {
          console.log("Archivar planes seleccionados:", selectedRows);
        },
        variant: "secondary" as const,
        icon: <Archive className="h-4 w-4" />,
      },
      {
        label: "Eliminar",
        onClick: async (selectedRows: PaymentPlanResponse[]) => {
          if (!session?.token || !profile?.client_id) return;

          try {
            for (const plan of selectedRows) {
              await deletePaymentPlan(
                session.token,
                profile.client_id,
                plan.id
              );
            }
            toast.success("Planes eliminados correctamente");
            refetch();
          } catch (error) {
            toast.error("Error al eliminar los planes");
          }
        },
        variant: "destructive" as const,
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
    [session?.token, profile?.client_id, refetch]
  );

  const handleUpdateColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    setIsApplyingFilters(true);
    try {
      const configToSave = config || columnConfiguration;
      setColumnConfiguration(configToSave);

      if (filterInputsRef.current) {
        const currentFilters = filterInputsRef.current.getCurrentFilters();
        await handleFilterChange(currentFilters);
      }
    } catch (error) {
      console.error("Error al actualizar configuración de columnas:", error);
      toast.error("Error al guardar la configuración de columnas");
    } finally {
      setIsApplyingFilters(false);
    }
  };

  const handleOpenPaymentPlanDetail = (paymentPlan: PaymentPlanResponse) => {
    setSelectedPaymentPlan(paymentPlan);
    setOpenDetailModal(true);
  };

  const handleEditPaymentPlan = (paymentPlan: PaymentPlanResponse) => {
    router.push(`/dashboard/payment-plans/create/${paymentPlan.id}`);
  };

  const handleDeletePaymentPlan = async (paymentPlan: PaymentPlanResponse) => {
    if (!session?.token || !profile?.client_id) return;

    try {
      await deletePaymentPlan(session.token, profile.client_id, paymentPlan.id);
      toast.success("Plan de pago eliminado correctamente");
      refetch();
    } catch (error) {
      toast.error("Error al eliminar el plan de pago");
    }
  };

  const columns = useMemo(
    () =>
      createColumns(
        handleOpenPaymentPlanDetail,
        handleEditPaymentPlan,
        handleDeletePaymentPlan
      ),
    []
  );

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Planes de pago"
          description="En esta sección podrás crear y gestionar planes de pago para tus deudores."
          icon={<Coins color="white" />}
          subDescription="Planes de pago"
        />
        <div className="flex items-center justify-center gap-5 p-3 border border-gray-200 rounded-md h-[325px]">
          <div className="flex-shrink-0">
            <Image
              src="/img/payment-plans.svg"
              alt="Deudores"
              className="h-full object-cover rounded-md bg-slate-100 p-4 min-w-[300px]"
              width={300}
              height={300}
            />
          </div>

          <div className="w-full h-full border border-gray-200 rounded-md p-5 flex flex-col items-start justify-center gap-6">
            <span>
              Aquí podrás gestionar y organizar los pagos de tus deudores de
              manera sencilla y eficiente. Crea tu primer plan de pago para
              comenzar a llevar un mejor control de tus finanzas.
            </span>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-600/80 w-sm"
              onClick={() => {
                router.push("/dashboard/payment-plans/create");
              }}
            >
              Crear plan de pago
            </Button>
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
              searchPlaceholder="Buscar planes de pago..."
              enableColumnFilter={true}
              initialColumnVisibility={columnVisibility}
              initialColumnConfiguration={columnConfiguration}
              columnLabels={columnLabels}
              enableRowSelection={true}
              initialRowSelection={isHydrated ? rowSelection : {}}
              onRowSelectionChange={handleRowSelectionChange}
              bulkActions={bulkActions}
              emptyMessage="No se encontraron planes de pago"
              className="rounded-lg"
              title="Planes de pago"
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
            <DialogForm
              open={openDetailModal}
              onOpenChange={setOpenDetailModal}
              title="Detalle del plan de pago"
              description={
                <div className="flex justify-between items-center bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Nº {selectedPaymentPlan?.requestId}
                  </span>
                  <div className="flex gap-2">
                    {selectedPaymentPlan?.status === "APPROVED" && (
                      <span className="text-xs font-semibold border border-green-600 px-4 py-1 text-green-600 rounded-full bg-green-50">
                        Aprobado
                      </span>
                    )}
                    {selectedPaymentPlan?.status === "PENDING" && (
                      <span className="text-xs font-semibold border border-blue-600 px-4 py-1 text-blue-600 rounded-full bg-blue-50">
                        En revisión
                      </span>
                    )}
                    {selectedPaymentPlan?.status === "REJECTED" && (
                      <span className="text-xs font-semibold border border-red-600 px-4 py-1 text-red-600 rounded-full bg-red-50">
                        Denegado
                      </span>
                    )}
                    {selectedPaymentPlan?.status === "OBJECTED" && (
                      <span className="text-xs font-semibold border border-purple-600 px-4 py-1 text-purple-600 rounded-full bg-purple-50">
                        Con observaciones
                      </span>
                    )}
                  </div>
                </div>
              }
            >
              <PendingModal detailPaymentPlan={selectedPaymentPlan} />
            </DialogForm>
          </CardContent>
        </Card>
      </Main>
    </>
  );
};

export default PaymentPlansPage;
