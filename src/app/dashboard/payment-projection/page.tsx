"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { ChartSpline } from "lucide-react";
import { Suspense } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import DebtorsList from "./components/debtors-list";
import ReportsCards from "./components/reports-cards";
import WeeklyProjectionTable from "./components/weekly-projection-table";
import { usePaymentProjectionStore } from "./store";

const PaymentProjectionContent = () => {
  const { debtorId } = usePaymentProjectionStore();
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
        <div className="flex items-start justify-between gap-5 h-screen">
          <div className="w-[540px]">
            <DebtorsList />
          </div>
          <div className="w-[calc(100%-560px)] h-screen">
            {debtorId ? (
              <WeeklyProjectionTable />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Proyección detalle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-full min-h-[540px]">
                    <span className="text-sm text-gray-500">
                      Para ver la proyección de pagos, seleccione un deudor en
                      la lista de la izquierda.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
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
