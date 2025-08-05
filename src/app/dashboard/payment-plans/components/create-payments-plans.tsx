"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { FileCheck2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import StepperPN from "../components/stepper";

const CreatePaymentsPlans = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
 


  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Generar pago"
          description="En esta sección podrás realizar la compensación de pagos entre tus clientes y proveedores."
          icon={<FileCheck2 color="white" />}
          subDescription="Compensación de pagos"
        />
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/payment-netting">
                Compensación de pagos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold text-primary">
                Generar pago
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <section className="space-y-4">
          <StepperPN
            number={1}
            is_active={true}
            title="Selección de pago"
            description="Selecciona la o las filas que necesitas compensar"
          />

          <Card>
            <CardContent className="p-0 m-0">
              
            </CardContent>
          </Card>
          <StepperPN
            number={2}
            is_active={false}
            title="Compensación manual"
            description="” y otra de “pagos disponibles”. El sistema te guiará para realizar una compensación correcta."
                  />
                   <StepperPN
            number={3}
            is_active={false}
            title="asdasda"
            description="” y otra de “pagos disponibles”. El sistema te guiará para realizar una compensación correcta."
          />
        </section>
      </Main>
    </>
  );
};

export default CreatePaymentsPlans;
