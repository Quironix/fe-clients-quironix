"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { ChartSpline, PhoneCall } from "lucide-react";
import { Suspense } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import IndicatorsDebtor from "./components/indicators-debtors";

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
        <div className="flex gap-5 h-screen">
          <div className="w-1/4">
            <IndicatorsDebtor />
          </div>
          <div className="flex-1 bg-white p-5 rounded-md shadow-xl">list</div>
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
