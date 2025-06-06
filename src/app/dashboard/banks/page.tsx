import React from "react";
import Header from "../components/header";
import { Button } from "@/components/ui/button";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { FileText } from "lucide-react";
import Language from "@/components/ui/language";

const BanksPage = () => {
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Bancos y cuentas"
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<FileText color="white" />}
          subDescription="Integraciones"
        />
        <div className="flex flex-col gap-4"></div>
      </Main>
    </>
  );
};

export default BanksPage;
