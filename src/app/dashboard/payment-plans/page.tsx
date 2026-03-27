"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import { Archive, CheckCircle, Coins, Eye, Trash2 } from "lucide-react";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("paymentPlans");
  const tCommon = useTranslations("common.buttons");
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
      id: t("columnLabels.id"),
      debtor_id: t("columnLabels.debtor"),
      status: t("columnLabels.status"),
      total_debt: t("columnLabels.totalDebt"),
      number_of_installments: t("columnLabels.installments"),
      installment_amount: t("columnLabels.installmentAmount"),
      payment_frequency: t("columnLabels.frequency"),
      plan_start_date: t("columnLabels.startDate"),
      payment_end_date: t("columnLabels.endDate"),
      annual_interest_rate: t("columnLabels.interestRate"),
      created_at: t("columnLabels.createdAt"),
      actions: t("columnLabels.actions"),
    }),
    [t]
  );

  const bulkActions = useMemo(
    () => [
      {
        label: tCommon("viewDetails"),
        onClick: (selectedRows: PaymentPlan[]) => {
          console.log("Ver detalles de planes seleccionados:", selectedRows);
        },
        variant: "outline" as const,
        icon: <Eye className="h-4 w-4" />,
      },
      {
        label: tCommon("approve"),
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
            toast.success(t("toast.approveSuccess"));
            refetch();
          } catch (error) {
            toast.error(t("toast.approveError"));
          }
        },
        variant: "default" as const,
        icon: <CheckCircle className="h-4 w-4" />,
      },
      {
        label: tCommon("archive"),
        onClick: (selectedRows: PaymentPlanResponse[]) => {
          console.log("Archivar planes seleccionados:", selectedRows);
        },
        variant: "secondary" as const,
        icon: <Archive className="h-4 w-4" />,
      },
      {
        label: tCommon("delete"),
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
            toast.success(t("toast.deleteBulkSuccess"));
            refetch();
          } catch (error) {
            toast.error(t("toast.deleteBulkError"));
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
      toast.error(t("toast.columnConfigError"));
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
      toast.success(t("toast.deleteSuccess"));
      refetch();
    } catch (error) {
      toast.error(t("toast.deleteError"));
    }
  };

  const columns = useMemo(() => createColumns(handleOpenPaymentPlanDetail, t), [t]);

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<Coins color="white" />}
          subDescription={t("subDescription")}
        />
        <div className="flex items-center justify-center gap-5 p-3 border border-gray-200 rounded-md h-[325px] mb-5">
          <div className="shrink-0">
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
              {t("introText")}
            </span>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-600/80 w-xs"
              onClick={() => {
                router.push("/dashboard/payment-plans/create");
              }}
            >
              {t("createPlan")}
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
              searchPlaceholder={t("searchPlaceholder")}
              enableColumnFilter={true}
              initialColumnVisibility={columnVisibility}
              initialColumnConfiguration={columnConfiguration}
              columnLabels={columnLabels}
              enableRowSelection={false}
              initialRowSelection={isHydrated ? rowSelection : {}}
              onRowSelectionChange={handleRowSelectionChange}
              bulkActions={bulkActions}
              emptyMessage={t("emptyMessage")}
              className="rounded-lg"
              title={t("title")}
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
              title={t("detailTitle")}
              description={
                <div className="flex justify-between items-center bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Nº {selectedPaymentPlan?.requestId}
                  </span>
                  <div className="flex gap-2">
                    {selectedPaymentPlan?.status === "APPROVED" && (
                      <span className="text-xs font-semibold border border-green-600 px-4 py-1 text-green-600 rounded-full bg-green-50">
                        {t("status.approved")}
                      </span>
                    )}
                    {selectedPaymentPlan?.status === "PENDING" && (
                      <span className="text-xs font-semibold border border-blue-600 px-4 py-1 text-blue-600 rounded-full bg-blue-50">
                        {t("status.pending")}
                      </span>
                    )}
                    {selectedPaymentPlan?.status === "REJECTED" && (
                      <span className="text-xs font-semibold border border-red-600 px-4 py-1 text-red-600 rounded-full bg-red-50">
                        {t("status.rejected")}
                      </span>
                    )}
                    {selectedPaymentPlan?.status === "OBJECTED" && (
                      <span className="text-xs font-semibold border border-purple-600 px-4 py-1 text-purple-600 rounded-full bg-purple-50">
                        {t("status.objected")}
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
