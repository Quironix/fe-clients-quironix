"use client";

import Language from "@/components/ui/language";
import { ArrowLeft, PhoneCall } from "lucide-react";
import { Suspense, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebtorsStore } from "../../debtors/store";
import { useProfileContext } from "@/context/ProfileContext";
import { SkeletonFormDebtor } from "@/components/ui/skeleton-form-debtor";

interface PageProps {
  params: {
    id: string;
  };
}

const Content = ({ params }: PageProps) => {
  const { profile, session } = useProfileContext();
  const { fetchDebtorById, dataDebtor, isFetchingDebtor, clearDataDebtor } = useDebtorsStore();

  useEffect(() => {
    if (params.id && profile?.client?.id && session?.token) {
      fetchDebtorById(session.token, profile.client.id, params.id);
    }

    // Limpiar datos al desmontar
    return () => {
      clearDataDebtor();
    };
  }, [params.id, profile?.client?.id, session?.token]);

  if (isFetchingDebtor) {
    return (
      <>
        <Header fixed>
          <Language />
        </Header>
        <Main>
          <TitleSection
            title="Gestión de deudores"
            description="Cargando información del deudor..."
            icon={<PhoneCall color="white" />}
            subDescription="Gestión de deudores"
          />
          <SkeletonFormDebtor />
        </Main>
      </>
    );
  }

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
                    Gestión de deudores
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <span className="font-bold">{dataDebtor?.name || "Cargando..."}</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/debtor-management">
              <div className="flex gap-1 justify-start items-center text-blue-700">
                <ArrowLeft /> Volver a tareas
              </div>
            </Link>
          </Button>
        </div>

        {dataDebtor?.contacts && dataDebtor.contacts.length > 0 && (
          <DebtorContacts
            mainContact={{
              name: dataDebtor.contacts[0]?.name || "Sin nombre",
              role: dataDebtor.contacts[0]?.role || "Sin rol",
              function: dataDebtor.contacts[0]?.function || "Sin función",
              email: dataDebtor.contacts[0]?.email || "Sin email",
              phone: dataDebtor.contacts[0]?.phone || "Sin teléfono",
              channel: (dataDebtor.contacts[0]?.channel as "email" | "phone" | "whatsapp") || "email",
            }}
            additionalContacts={dataDebtor.contacts.slice(1).map((contact: any) => ({
              name: contact.name || "Sin nombre",
              role: contact.role || "Sin rol",
              function: contact.function || "Sin función",
              email: contact.email || "Sin email",
              phone: contact.phone || "Sin teléfono",
              channel: (contact.channel as "email" | "phone" | "whatsapp") || "email",
            }))}
            callSchedule={dataDebtor.attention_days_hours || "No definido"}
          />
        )}

        <div className="bg-white p-5 rounded-md shadow-xl h-screen mt-5">
          <Tabs defaultValue="quironix-ia">
            <TabsList>
              <TabsTrigger value="quironix-ia">Quironix IA</TabsTrigger>
              <TabsTrigger value="key-reasons">Razones clave</TabsTrigger>
              <TabsTrigger value="add-management">Agregar gestión</TabsTrigger>
            </TabsList>
            <TabsContent value="quironix-ia">quironix-ia</TabsContent>
            <TabsContent value="key-reasons">key-reasons</TabsContent>
            <TabsContent value="add-management">add-management</TabsContent>
          </Tabs>
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
