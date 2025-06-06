import React from "react";
import TitleSection from "@/app/dashboard/components/title-section";

import { FileCog } from "lucide-react";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import Language from "@/components/ui/language";

const CreateDebtorPage = () => {
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Creación de deudores"
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<FileCog color="white" />}
          subDescription="Configuración de la cartera"
        />
        <h1>Crear deudor</h1>
      </Main>
    </>
  );
};

export default CreateDebtorPage;
