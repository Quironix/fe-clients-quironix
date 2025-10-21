"use client";

import Language from "@/components/ui/language";
import { PhoneCall } from "lucide-react";
import { Suspense, useState } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import IndicatorsDebtor from "./components/indicators-debtors";
import { TaskFilters } from "./components/task-filters";
import { TasksList } from "./components/tasks-list";
import { QuadrantType } from "./services/types";

const Content = () => {
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantType>(null);

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
        <div className="flex gap-5 w-full overflow-x-auto">
          <div className="w-[240px] flex-shrink-0">
            <IndicatorsDebtor />
          </div>
          <div className="flex-1 rounded-md shadow-xl min-w-0">
            <TaskFilters
              selectedQuadrant={selectedQuadrant}
              onQuadrantChange={setSelectedQuadrant}
            />
            <TasksList selectedQuadrant={selectedQuadrant} />
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
