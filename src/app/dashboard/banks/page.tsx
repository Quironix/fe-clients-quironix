import React from "react";
import Header from "../components/header";
import { Button } from "@/components/ui/button";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { FileText } from "lucide-react";

const BanksPage = () => {
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
