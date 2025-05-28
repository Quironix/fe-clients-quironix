"use client";
import React from "react";
import { Main } from "../components/main";
import { Button } from "@/components/ui/button";
import TitleSection from "../components/title-section";
import { FileText, LayoutDashboard } from "lucide-react";
import Header from "../components/header";
import CardItem from "./components/card-item";
import IntegrationsImage from "@/public/img/integrations.svg";

const IntegrationsPage = () => {
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
          title="Onboarding"
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<FileText color="white" />}
          subDescription="Integraciones"
        />
        <div className="flex flex-col gap-4">
          <CardItem
            image="/img/integrations.svg"
            buttonText="Integrar APIs con ERP"
            onButtonClick={() => {
              console.log("hola");
            }}
            title="Integraciones"
            description="Integra la plataforma con tu sistema ERP mediante API"
          />
          <CardItem
            image="/img/settings.svg"
            buttonText="Integrar APIs con ERP"
            onButtonClick={() => {
              console.log("hola");
            }}
            title="Configuraciones"
            description="Configura los DTEs según tus necesidades"
          />
        </div>
      </Main>
    </>
  );
};

export default IntegrationsPage;
