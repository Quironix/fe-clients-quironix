"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import {
  Archive,
  ArrowLeftRight,
  Building2,
  Calendar,
  DollarSign,
  Eye,
  File,
  FileCheck2,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { format, parseISO } from "date-fns";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DataTableDynamicColumns } from "../components/data-table-dynamic-columns";
import DialogForm from "../components/dialog-form";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { createColumns } from "./components/columns";
import FilterInputs, { FilterInputsRef } from "./components/filter";
import FormAssignDebtor from "./components/form-assign-debtor";
import IconDescription from "./components/icon-description";
import ViewDetailsModal from "./components/view-details-modal";
import { usePaymentNetting } from "./hooks/usePaymentNetting";
import { reversePayment, updateReconciliationTableProfile } from "./services";

export default function PaymentNettingPage() {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
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

  const selectedPayments = useMemo(() => {
    if (!isHydrated) return [];
    return getSelectedRows();
  }, [getSelectedRows, isHydrated]);

  const isValidSelectionForPayment = useMemo(() => {
    if (selectedPayments.length === 0) return false;
    if (selectedPayments.length === 1)
      return !!selectedPayments[0]?.payment?.debtor;

    // Para múltiples selecciones, verificar que todos tengan el mismo debtor.id
    const firstDebtorId = selectedPayments[0]?.payment?.debtor?.id;
    if (!firstDebtorId) return false;

    return selectedPayments.every(
      (payment) => payment?.payment?.debtor?.id === firstDebtorId
    );
  }, [selectedPayments]);

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
      code: "Códigode deudor",
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

        if (typeof window !== "undefined") {
          const storedProfile = localStorage.getItem("profile");
          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);
            if (parsedProfile?.profile) {
              parsedProfile.profile.reconciliation_table = configToSave;
              localStorage.setItem("profile", JSON.stringify(parsedProfile));
            }
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

  const handleOpenTransactionDetail = (transaction: any) => {
    setSelectedTransaction(transaction);
    setOpenDetailModal(true);
  };

  const handleReversePayment = async (row: any) => {
    // const response = await getPaymentHistory({
    //   accessToken: session?.token,
    //   clientId: profile?.client_id,
    //   paymentId: row.payment.id,
    // });
    // console.log("Respuesta:", response);
    try {
      const response = await reversePayment({
        accessToken: session?.token,
        clientId: profile?.client_id,
        paymentId: row.payment.id,
      });

      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      refetch();
      window.location.reload();
    }
  };

  const columns = useMemo(
    () => createColumns(handleOpenTransactionDetail, handleReversePayment),
    [handleOpenTransactionDetail, handleReversePayment]
  );

  const handleResetFilters = () => {
    if (filterInputsRef.current) {
      filterInputsRef.current.resetFilters();
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
                  <DialogForm
                    title="Detalle del depósito"
                    description=""
                    open={openDialog}
                    onOpenChange={setOpenDialog}
                    onInteractOutside={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('[data-radix-popper-content-wrapper]') || target.closest('[role="listbox"]')) {
                        e.preventDefault();
                      }
                    }}
                    trigger={
                      <Button
                        disabled={selectedPayments.length === 0}
                        className="bg-orange-400 text-white hover:bg-orange-400/90"
                        onClick={() => setOpenDialog(true)}
                      >
                        Asignar deudor
                      </Button>
                    }
                  >
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                        <span className="font-medium">
                          {selectedPayments.length === 1
                            ? `MOV-${selectedPayments[0]?.id}`
                            : `${selectedPayments.length} movimientos seleccionados`}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-t border-gray-200 py-4">
                      <IconDescription
                        icon={<File className="w-4 h-4 text-gray-400" />}
                        description="Descripción"
                        value="Transferencia bancaria"
                      />
                      <IconDescription
                        icon={<Building2 className="w-4 h-4 text-gray-400" />}
                        description="Banco"
                        value={
                          selectedPayments.length === 1
                            ? selectedPayments[0]?.bank_information?.bank
                            : "Múltiples bancos"
                        }
                      />
                      <IconDescription
                        icon={<Calendar className="w-4 h-4 text-gray-400" />}
                        description="Fecha de depósito"
                        value={
                          selectedPayments.length === 1
                            ? selectedPayments[0]?.created_at
                              ? format(parseISO(selectedPayments[0].created_at), "dd/MM/yyyy")
                              : "N/A"
                            : "Múltiples fechas"
                        }
                      />
                      <IconDescription
                        icon={
                          <ArrowLeftRight className="w-4 h-4 text-gray-400" />
                        }
                        description="Transferencia"
                        value={`$ ${new Intl.NumberFormat("es-ES", {}).format(
                          selectedPayments.reduce(
                            (sum, payment) =>
                              sum + Number(payment?.amount || 0),
                            0
                          )
                        )}`}
                      />
                    </div>
                    <div>
                      <div className="bg-red-100 border border-red-500 p-4 rounded-lg flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <TriangleAlert className="w-4 h-4" />
                          <span className="font-bold">
                            Información no encontrada
                          </span>
                        </div>
                        <span>
                          No hemos logrado asociar este pago a un deudor
                          registrado. Por favor completa los datos requeridos
                          para poder avanzar con el proceso.
                        </span>
                      </div>
                    </div>
                    <FormAssignDebtor
                      selectedMovements={selectedPayments}
                      handleClose={() => {
                        setOpenDialog(false);
                        refetch();
                      }}
                    />
                  </DialogForm>

                  <Button
                    disabled={!isValidSelectionForPayment}
                    className="bg-orange-400 text-white hover:bg-orange-400/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      const debtorId = selectedPayments[0]?.payment?.debtor?.id;
                      const movementIds = selectedPayments.map(p => p.id).join(',');

                      if (debtorId && movementIds) {
                        router.push(
                          `/dashboard/payment-netting/generate-payment?debtorId=${debtorId}&movements=${movementIds}`
                        );
                      }
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
              onResetFilters={handleResetFilters}
            />
          </CardContent>
        </Card>

        {/* Modal para ver detalles */}
        <div className="opacity-0">
          <ViewDetailsModal
            row={selectedTransaction}
            open={openDetailModal}
            onOpenChange={setOpenDetailModal}
          />
        </div>
      </Main>
    </>
  );
}
