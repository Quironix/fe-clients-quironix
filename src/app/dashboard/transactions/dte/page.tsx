"use client";

import TitleSection from "@/app/dashboard/components/title-section";

import { FileStack } from "lucide-react";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import Language from "@/components/ui/language";
import DTEUploadSection from "./components/dte-upload-section";
// import BulkDebtors from "./components/bulk-debtors";
// import CreateManualDebtor from "./components/create-manual-debtor";
// import ListDebtors from "./components/list-debtors";

const pageDTE = () => {
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
          {/* <ListDataDTE /> */}
        </div>
      </Main>
    </>
  );
};

export default pageDTE;
