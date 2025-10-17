"use client";

import Language from "@/components/ui/language";
import {
  ArrowLeft,
  CreditCard,
  File,
  FileX2,
  History,
  PhoneCall,
  Scale,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { use, useEffect } from "react";
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
import { KeyReasons } from "../components/key-reasons";
import PaymentCommitment from "../components/payment-commitment";
import CreditRisk from "../components/credit-risk";
import { CardCollapsible } from "@/app/dashboard/components/card-collapsible";
import ProtestedChecks from "../components/protested-checks";
import LastPaymentReceived from "../components/last-payment-received";
import LitigationsCard from "../components/litigations-card";
import LastManagements from "../components/last-managements";
import { DebtorChatbot } from "../components/debtor-chatbot";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Content = ({ params }: PageProps) => {
  // Unwrap params usando React.use()
  const { id } = use(params);

  const { profile, session } = useProfileContext();
  const {
    fetchDebtorById,
    dataDebtor,
    isFetchingDebtor,
    clearDataDebtor,
    fetchCollectionProfile,
    collectionProfile,
    isFetchingCollectionProfile,
    clearCollectionProfile,
  } = useDebtorsStore();

  useEffect(() => {
    if (id && profile?.client?.id && session?.token) {
      fetchDebtorById(session.token, profile.client.id, id);
      fetchCollectionProfile(session.token, profile.client.id, id);
    }

    // Limpiar datos al desmontar
    return () => {
      clearDataDebtor();
      clearCollectionProfile();
    };
  }, [id, profile?.client?.id, session?.token]);

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
                  <span className="font-bold">
                    {dataDebtor?.name || "Cargando..."}
                  </span>
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

        {dataDebtor?.contacts && dataDebtor.contacts.length > 0 ? (
          <DebtorContacts
            mainContact={{
              name: dataDebtor.contacts[0]?.name || "Sin nombre",
              role: dataDebtor.contacts[0]?.role || "Sin rol",
              function: dataDebtor.contacts[0]?.function || "Sin función",
              email: dataDebtor.contacts[0]?.email || "Sin email",
              phone: dataDebtor.contacts[0]?.phone || "Sin teléfono",
              channel:
                (dataDebtor.contacts[0]?.channel as
                  | "email"
                  | "phone"
                  | "whatsapp") || "email",
            }}
            additionalContacts={dataDebtor.contacts
              .slice(1)
              .map((contact: any) => ({
                name: contact.name || "Sin nombre",
                role: contact.role || "Sin rol",
                function: contact.function || "Sin función",
                email: contact.email || "Sin email",
                phone: contact.phone || "Sin teléfono",
                channel:
                  (contact.channel as "email" | "phone" | "whatsapp") ||
                  "email",
              }))}
            callSchedule={dataDebtor.attention_days_hours || "No definido"}
          />
        ) : (
          <DebtorContacts
            mainContact={{
              name: "Sin contacto principal",
              role: "N/A",
              function: "N/A",
              email: "N/A",
              phone: "N/A",
              channel: "email",
            }}
            additionalContacts={[]}
            callSchedule="No definido"
          />
        )}

        <div className="bg-white p-5 rounded-md shadow-xl mt-5  min-h-auto flex flex-col">
          <Tabs defaultValue="key-reasons" className="flex flex-col flex-1">
            <TabsList>
              <TabsTrigger value="key-reasons">Razones clave</TabsTrigger>
              <TabsTrigger value="add-management">Agregar gestión</TabsTrigger>
            </TabsList>
            <TabsContent value="key-reasons" className="flex-1">
              <div className="flex gap-5 h-full w-full">
                <div className="h-full w-full">
                  <DebtorChatbot debtorId={id} />
                </div>
                <div className="h-full w-2xl overflow-y-auto">
                  {isFetchingCollectionProfile ? (
                    <div className="bg-white p-6 rounded-md h-full flex items-center justify-center">
                      <span className="text-gray-500">
                        Cargando razones clave...
                      </span>
                    </div>
                  ) : collectionProfile ? (
                    <div className="flex flex-col gap-3">
                      <KeyReasons
                        callReasons={collectionProfile.call_reasons}
                      />

                      <CardCollapsible
                        icon={<ShieldCheck />}
                        title="Compromiso de pago"
                        defaultOpen={false}
                        destacado={true}
                      >
                        <PaymentCommitment
                          data={collectionProfile.payment_commitment}
                        />
                      </CardCollapsible>
                      <CardCollapsible
                        icon={<TriangleAlert />}
                        title="Riesgo crediticio"
                        defaultOpen={false}
                      >
                        <CreditRisk
                          data={collectionProfile.payment_commitment}
                        />
                      </CardCollapsible>
                      <CardCollapsible
                        icon={<FileX2 />}
                        title="Cheques protestos"
                        defaultOpen={false}
                      >
                        <ProtestedChecks
                          data={collectionProfile.protested_checks}
                        />
                      </CardCollapsible>
                      <CardCollapsible
                        icon={<CreditCard />}
                        title="Último pago recibido"
                        defaultOpen={false}
                      >
                        <LastPaymentReceived
                          data={collectionProfile.last_payment_received}
                        />
                      </CardCollapsible>
                      <CardCollapsible
                        icon={<Scale />}
                        title="Litigios"
                        defaultOpen={false}
                      >
                        <LitigationsCard data={collectionProfile.litigations} />
                      </CardCollapsible>
                      <CardCollapsible
                        icon={<History />}
                        title="Últimas gestiones"
                        defaultOpen={false}
                      >
                        <LastManagements data={collectionProfile.management} />
                      </CardCollapsible>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-md h-full flex items-center justify-center">
                      <span className="text-gray-500">
                        No hay datos disponibles
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="add-management" className="flex-1">
              add-management
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  );
};

const Page = ({ params }: PageProps) => {
  return <Content params={params} />;
};

export default Page;
