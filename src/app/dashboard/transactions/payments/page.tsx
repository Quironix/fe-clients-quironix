"use client";

import TitleSection from "@/app/dashboard/components/title-section";

import { FileStack } from "lucide-react";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { useEffect } from "react";
import { DataTable } from "../../components/data-table";
import LoaderTable from "../../components/loader-table";
import { columns } from "./components/columns";
import PaymentUploadSection from "./components/payments-upload-section";
import { usePaymentStore } from "./store";
import { Payments } from "./types";

const PaymentPage = () => {
  const { session, profile } = useProfileContext();
  const { payments, loading, fetchPayments } = usePaymentStore();

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchPayments(session.token, profile.client.id, "", "");
    }
  }, [session?.token, profile?.client?.id]);

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Carga de pagos"
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<FileStack color="white" />}
          subDescription="Transacciones"
        />
        <PaymentUploadSection />
        <div className="mt-5 border border-gray-200 rounded-md p-3">
          <DataTable
            columns={columns}
            data={payments as Payments[]}
            isLoading={loading}
            loadingComponent={<LoaderTable cols={7} />}
            emptyMessage="No se encontraron pagos"
            pageSize={15}
            pageSizeOptions={[15, 20, 25, 30, 40, 50]}
          />
        </div>
      </Main>
    </>
  );
};

export default PaymentPage;
