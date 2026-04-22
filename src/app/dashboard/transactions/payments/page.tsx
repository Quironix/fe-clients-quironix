"use client";

import TitleSection from "@/app/dashboard/components/title-section";
import { useTranslations } from "next-intl";
import { FileDown, FileStack } from "lucide-react";
import { useState } from "react";
import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { DataTable } from "../../components/data-table";
import LoaderTable from "../../components/loader-table";
import { columns } from "./components/columns";
import PaymentUploadSection from "./components/payments-upload-section";
import { usePayments } from "./hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Payments } from "./types";
import { ExportExcelModal } from "@/components/ui/export-excel-modal";

const PaymentPage = () => {
  const t = useTranslations("transactions.payments");
  const { session, profile } = useProfileContext();
  const [exportOpen, setExportOpen] = useState(false);

  // Usar el nuevo hook usePayments con paginación del servidor
  const {
    payments,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    handlePaginationChange,
    currentPage,
    currentLimit,
  } = usePayments({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    initialPage: 1,
    initialLimit: 15,
  });

  // Manejo de errores
  if (isError) {
    return (
      <>
        <Header fixed>
          <Language />
        </Header>
        <Main>
          <TitleSection
            title={t("title")}
            description={t("description")}
            icon={<FileStack color="white" />}
            subDescription={t("subDescription")}
          />
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600 font-medium mb-2">
                  {t("errorLoading")}
                </p>
                <p className="text-red-500 text-sm mb-4">
                  {error?.message || t("unknownError")}
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  {t("retry")}
                </Button>
              </div>
            </div>
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<FileStack color="white" />}
          subDescription={t("subDescription")}
        />
        <PaymentUploadSection />
        <div className="mt-5 border border-gray-200 rounded-md p-3">
          <div className="flex justify-end mb-3">
            <Button variant="outline" onClick={() => setExportOpen(true)}>
              <FileDown className="h-4 w-4 mr-2 text-orange-400" />
              Exportar
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={payments as Payments[]}
            // Configuración para paginación del servidor (requerida)
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            isServerSideLoading={isLoading}
            // Configuración de carga
            loadingComponent={<LoaderTable cols={7} />}
            emptyMessage={t("emptyMessage")}
            // Configuración de paginación
            pageSize={currentLimit}
            pageSizeOptions={[15, 20, 25, 30, 40, 50]}
          />
        </div>
        <ExportExcelModal
          open={exportOpen}
          onOpenChange={setExportOpen}
          schema="PAYMENTS"
          accessToken={session?.token || ""}
          clientId={profile?.client?.id || ""}
        />
      </Main>
    </>
  );
};

export default PaymentPage;
