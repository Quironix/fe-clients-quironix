"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { Coins } from "lucide-react";
import Image from "next/image";

import { useRouter } from "next/navigation";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";

const PaymentPlansPage = () => {
  const router = useRouter();
  const dataDummy = [
    {
      id: "12345678",
      requestNumber: "12345678",
      debtor: "Nombre Deudor",
      status: "Aprobado",
      totalDebt: 999999999,
      installments: 12,
      installmentAmount: 999999999,
      startDate: "2025-04-12",
      startTime: "19:30",
      endDate: "2025-04-12",
      endTime: "19:30",
      comment: "Lorem ipsum is dolor sit amet...",
      approver: "Nombre Aprobador",
      statusColor: "green",
    },
    {
      id: "12345679",
      requestNumber: "12345679",
      debtor: "Nombre Deudor",
      status: "Con observaciones",
      totalDebt: 999999999,
      installments: 12,
      installmentAmount: 999999999,
      startDate: "2025-04-12",
      startTime: "19:30",
      endDate: "2025-04-12",
      endTime: "19:30",
      comment: "Lorem ipsum is dolor sit amet...",
      approver: "Nombre Aprobador",
      statusColor: "purple",
    },
    {
      id: "12345680",
      requestNumber: "12345680",
      debtor: "Nombre Deudor",
      status: "Denegado",
      totalDebt: 999999999,
      installments: 12,
      installmentAmount: 999999999,
      startDate: "2025-04-12",
      startTime: "19:30",
      endDate: "2025-04-12",
      endTime: "19:30",
      comment: "Lorem ipsum is dolor sit amet...",
      approver: "Nombre Aprobador",
      statusColor: "red",
    },
    {
      id: "12345681",
      requestNumber: "12345681",
      debtor: "Nombre Deudor",
      status: "En revisión",
      totalDebt: 999999999,
      installments: 12,
      installmentAmount: 999999999,
      startDate: "2025-04-12",
      startTime: "19:30",
      endDate: "2025-04-12",
      endTime: "19:30",
      comment: "Lorem ipsum is dolor sit amet...",
      approver: "Nombre Aprobador",
      statusColor: "blue",
    },
    {
      id: "12345682",
      requestNumber: "12345682",
      debtor: "Nombre Deudor",
      status: "Aprobado",
      totalDebt: 999999999,
      installments: 12,
      installmentAmount: 999999999,
      startDate: "2025-04-12",
      startTime: "19:30",
      endDate: "2025-04-12",
      endTime: "19:30",
      comment: "Lorem ipsum is dolor sit amet...",
      approver: "Nombre Aprobador",
      statusColor: "green",
    },
    {
      id: "12345683",
      requestNumber: "12345683",
      debtor: "Nombre Deudor",
      status: "En revisión",
      totalDebt: 999999999,
      installments: 12,
      installmentAmount: 999999999,
      startDate: "2025-04-12",
      startTime: "19:30",
      endDate: "2025-04-12",
      endTime: "19:30",
      comment: "Lorem ipsum is dolor sit amet...",
      approver: "Nombre Aprobador",
      statusColor: "blue",
    },
  ];

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Planes de pago"
          description="En esta sección podrás crear planes de pago para tus deudores."
          icon={<Coins color="white" />}
          subDescription="Planes de pago"
        />
        <div className="flex items-center justify-center gap-5 p-3 border border-gray-200 rounded-md h-[325px]">
          <div className="flex-shrink-0">
            <Image
              src="/img/payment-plans.svg"
              alt="Deudores"
              className="h-full object-cover rounded-md bg-slate-100 p-4 min-w-[300px]"
              width={300}
              height={300}
            />
          </div>

          <div className="w-full h-full border border-gray-200 rounded-md p-5 flex flex-col items-start justify-center gap-6">
            <span>
              Aquí podrás gestionar y organizar los pagos de tus deudores de
              manera sencilla y eficiente. Crea tu primer plan de pago para
              comenzar a llevar un mejor control de tus finanzas.
            </span>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-600/80 w-sm"
              onClick={() => {
                router.push("/dashboard/payment-plans/create");
              }}
            >
              Crear plan de pago
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-5 mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Planes de pago</CardTitle>
            </CardHeader>
            <CardContent>
              <span>hola</span>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  );
};

export default PaymentPlansPage;
