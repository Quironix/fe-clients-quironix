"use client";

import Language from "@/components/ui/language";
import { PhoneCall } from "lucide-react";
import { Suspense } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import IndicatorsDebtor from "./components/indicators-debtors";
import { TaskFilters } from "./components/task-filters";
import { TasksList } from "./components/tasks-list";

const Content = () => {
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Gestión de deudores"
          description="Visualización de tareas asignadas"
          icon={<PhoneCall color="white" />}
          subDescription="Gestión de deudores"
        />
        <div className="flex gap-5">
          <div className="w-[240px]">
            <IndicatorsDebtor />
          </div>
          <div className="flex-1 bg-white p-5 rounded-md shadow-xl">
            <TaskFilters />
            <TasksList />
          </div>
        </div>
      </Main>
    </>
  );
};

const DebtorManagementPage = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Content />
    </Suspense>
  );
};

export default DebtorManagementPage;
