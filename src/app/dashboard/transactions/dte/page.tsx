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
import DTEUploadSection from "./components/dte-upload-section";
import { useDTEStore } from "./store";
// import BulkDebtors from "./components/bulk-debtors";
// import CreateManualDebtor from "./components/create-manual-debtor";
// import ListDebtors from "./components/list-debtors";

const PageDTE = () => {
  const { dtes, loading, fetchDTE } = useDTEStore();
  const { session, profile } = useProfileContext();

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchDTE(session.token, profile.client.id);
    }
  }, [session?.token, profile?.client?.id]);

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Carga de DTE"
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<FileStack color="white" />}
          subDescription="Transacciones"
        />
        <DTEUploadSection />
        <div className="mt-5 border border-gray-200 rounded-md p-3">
          <DataTable
            columns={columns}
            data={dtes as any}
            isLoading={loading}
            loadingComponent={<LoaderTable cols={7} />}
            emptyMessage="No se encontraron movimientos"
            pageSize={15}
            pageSizeOptions={[15, 20, 25, 30, 40, 50]}
          />
        </div>
      </Main>
    </>
  );
};

export default PageDTE;
