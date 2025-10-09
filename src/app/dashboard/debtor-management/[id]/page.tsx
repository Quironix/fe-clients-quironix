"use client";

import Language from "@/components/ui/language";
import { ArrowLeft, PhoneCall } from "lucide-react";
import { Suspense } from "react";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DebtorContacts } from "../components/debtor-contacts";

interface PageProps {
  params: {
    id: string;
  };
}

const Content = ({ params }: PageProps) => {
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Riesgo/Crédito"
          description="Visualización de deudores con compromiso no cumplido"
          icon={<PhoneCall color="white" />}
          subDescription="Gestión de deudores"
        />
        <div className="flex justify-between items-center mb-5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/dashboard/debtor-management"
                    className="text-blue-600"
                  >
                    Gestion de deudores
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <span className="font-bold"> Gestión de deudores</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button variant="ghost">
            <div className="flex gap-1 justify-start items-center text-blue-700">
              <ArrowLeft /> Volver a tareas
            </div>
          </Button>
        </div>

        <DebtorContacts
          mainContact={{
            name: "Paulina Bracho",
            phone: "+56 9 1234 5690",
          }}
          additionalContacts={[{}, {}, {}, {}]}
          callSchedule="14:00 - 17:00"
        />

        <div className="bg-white p-5 rounded-md shadow-xl h-screen mt-5">
          <h2 className="text-xl font-bold mb-4">Detalle del Deudor</h2>
          {/* Aquí puedes agregar el contenido específico del deudor */}
        </div>
      </Main>
    </>
  );
};

const Page = ({ params }: PageProps) => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Content params={params} />
    </Suspense>
  );
};

export default Page;
