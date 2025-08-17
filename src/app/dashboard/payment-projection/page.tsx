"use client";

import Language from "@/components/ui/language";
import { ChartSpline } from "lucide-react";
import { Suspense } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import DebtorsList from "./components/debtors-list";
import ReportsCards from "./components/reports-cards";
import WeeklyProjectionTable from "./components/weekly-projection-table";

const PaymentProjectionContent = () => {
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Proyección de pagos"
          description="Visualización de proyecciones de pago por períodos de 5 semanas"
          icon={<ChartSpline color="white" />}
          subDescription="Proyección de pagos"
        />

        <ReportsCards />
        <div className="flex items-start justify-between gap-5">
          <div className="w-[540px]">
            <DebtorsList />
          </div>
          <div className="w-[calc(100%-560px)] h-full">
            <WeeklyProjectionTable />
          </div>
        </div>
      </Main>
    </>
  );
};

const PaymentProjectionPage = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PaymentProjectionContent />
    </Suspense>
  );
};

export default PaymentProjectionPage;
