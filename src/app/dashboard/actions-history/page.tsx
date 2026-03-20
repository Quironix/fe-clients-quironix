"use client";
import Language from "@/components/ui/language";
import { useDashboard } from "@/stores/dashboard/dashboardStore";
import { History } from "lucide-react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
const ActionsHistoryPage = () => {
  const { defaultOpen } = useDashboard();
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Historial de acciones"
          description="Aquí puedes ver un resumen de las acciones que se han realizado en la plataforma."
          icon={<History color="white" />}
          subDescription="Usuarios"
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="w-full h-full">Pendiente segunda etapa...</div>
        </div>
      </Main>
    </>
  );
};

export default ActionsHistoryPage;
