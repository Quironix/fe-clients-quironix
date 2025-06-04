"use client";
import React from "react";
import Header from "../components/header";
import TopNav from "../components/topnav";
import { topNav } from "../data";
import { useDashboard } from "@/stores/dashboard/dashboardStore";
import { Main } from "../components/main";
import { Button } from "@/components/ui/button";
import TitleSection from "../components/title-section";
import {
  ChartArea,
  LayoutDashboard,
  Square,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Language from "@/components/ui/language";
const ActionsHistoryPage = () => {
  const { defaultOpen } = useDashboard();
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Usuarios y roles"
          description="Aquí puedes ver un resumen de las acciones que se han realizado en la plataforma."
          icon={<UsersIcon color="white" />}
          subDescription="Historial de acciones"
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="w-full h-full">Pendiente segunda etapa...</div>
        </div>
      </Main>
    </>
  );
};

export default ActionsHistoryPage;
