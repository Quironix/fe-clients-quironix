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

const CreateDebtorPage = () => {
  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            size="icon"
            className="bg-orange-500 text-white rounded-full hover:bg-orange-400 cursor-pointer"
          >
            ES
          </Button>
        </div>
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
