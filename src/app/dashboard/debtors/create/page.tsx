import React from "react";
import TitleSection from "../../components/title-section";

import { FileCog, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import Header from "../../components/header";
import { Main } from "../../components/main";
import Image from "next/image";
import CreateManualDebtor from "../components/create-manual-debtor";
import BulkDebtors from "../components/bulk-debtors";
import ListDebtors from "../components/list-debtors";
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
