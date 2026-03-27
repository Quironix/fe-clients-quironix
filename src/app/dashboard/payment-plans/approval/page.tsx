"use client";

import { Button } from "@/components/ui/button";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import { Coins, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import { usePaymentPlans } from "../hooks/usePaymentPlans";
import { PaymentPlan } from "../types";
import { createColumns } from "./components/columns";
import FilterInputs, { FilterInputsRef } from "./components/filter";

const PageApproval = () => {
  const t = useTranslations("paymentPlans");
  const tCommon = useTranslations("common.buttons");
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const [quickFilters, setQuickFilters] = useState<string>("PENDING");
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
  } = usePaymentPlans(session?.token, profile?.client_id, false, {
    status: "PENDING",
  });
  const filterInputsRef = useRef<FilterInputsRef>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const [columnConfiguration, setColumnConfiguration] = useState<
    Array<{ name: string; is_visible: boolean }>
  >([
    { name: "id", is_visible: true },
    { name: "debtor_id", is_visible: false },
    { name: "status", is_visible: true },
    { name: "total_debt", is_visible: true },
    { name: "number_of_installments", is_visible: true },
    { name: "installment_amount", is_visible: true },
    { name: "payment_frequency", is_visible: true },
    { name: "plan_start_date", is_visible: false },
    { name: "payment_end_date", is_visible: true },
    { name: "annual_interest_rate", is_visible: false },
    { name: "created_at", is_visible: false },
    { name: "debt_concept", is_visible: false },
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

  const columns = useMemo(
    () => createColumns(undefined, undefined, undefined, t),
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
    ],
    [session?.token, profile?.client_id, refetch]
  );

  // Sincronizar quickFilters con el estado actual del filtro
  useEffect(() => {
    if (filters.status) {
      setQuickFilters(filters.status);
    }
  }, [filters.status]);

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("approval.title")}
          description={t("description")}
          icon={<Coins color="white" />}
          subDescription={t("subDescription")}
        />
        <div className="flex items-start justify-start gap-5 p-3 border border-gray-200 rounded-md h-full w-full overflow-hidden">
          <div
            className="shrink-0"
            style={{ minWidth: 300, maxWidth: 300, width: 300, height: "100%" }}
          >
            <Image
              src="/img/approval.svg"
              alt="Deudores"
              className="h-full object-cover rounded-md bg-slate-100 p-4"
              width={300}
              height={300}
              style={{
                minWidth: 300,
                maxWidth: 300,
                width: 300,
                height: "100%",
              }}
            />
          </div>

          <div className="h-full border border-gray-200 rounded-md p-5 flex flex-col items-start justify-center gap-6 flex-1 min-w-0 overflow-hidden">
            <div className="w-full h-full overflow-auto">
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
                className="rounded-lg w-full"
                title={t("approval.requests")}
                handleSuccessButton={() => {}}
                ctaNode={
                  <div className="flex items-center gap-2">
                    <Button
                      variant={
                        quickFilters === "PENDING" ? "default" : "outline"
                      }
                      onClick={() => {
                        setQuickFilters("PENDING");
                        handleFilterChange({ ...filters, status: "PENDING" });
                      }}
                    >
                      {t("approval.pending")}
                    </Button>
                    <Button
                      variant={
                        quickFilters === "OTHERS" ? "default" : "outline"
                      }
                      onClick={() => {
                        setQuickFilters("OTHERS");
                        handleFilterChange({
                          ...filters,
                          status: "OTHERS",
                        });
                      }}
                    >
                      {t("approval.reviewed")}
                    </Button>
                  </div>
                }
                filterInputs={
                  <FilterInputs
                    ref={filterInputsRef}
                    onFilterChange={handleFilterChange}
                    initialFilters={filters}
                  />
                }
                isApplyingFilters={isApplyingFilters}
              />
            </div>
          </div>
        </div>
      </Main>
    </>
  );
};

export default PageApproval;
