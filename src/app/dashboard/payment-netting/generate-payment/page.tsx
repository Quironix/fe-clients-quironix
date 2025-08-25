"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { FileCheck2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import { columns } from "../components/columns";
import ListAccountReceivable from "../components/list-account-receivable";
import ListCreditFavor from "../components/list-credit-favor";
import StepperPN from "../components/stepper";
import SummaryPaymentNetting from "../components/summary-payment-netting";
import { usePaymentNetting } from "../hooks/usePaymentNetting";
import { usePaymentNettingStore } from "../store";

const GeneratePayment = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const { resetSelected } = usePaymentNettingStore();
  const { getSelectedRows, isHydrated } = usePaymentNetting(
    session?.token,
    profile?.client_id,
    false
  );

  // Reset selections when entering this page
  useEffect(() => {
    resetSelected();
  }, [resetSelected]);

  const selectedPayments = useMemo(() => {
    if (!isHydrated) return [];
    return getSelectedRows();
  }, [getSelectedRows, isHydrated]);

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
              <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        Pagos seleccionados ({selectedPayments.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-6">
                    {selectedPayments.length > 0 ? (
                      <DataTableDynamicColumns
                        columns={columns}
                        data={selectedPayments}
                        isLoading={false}
                        isServerSideLoading={false}
                        onPaginationChange={() => {}}
                        onSearchChange={() => {}}
                        enableGlobalFilter={false}
                        searchPlaceholder="Buscar"
                        enableColumnFilter={false}
                        initialColumnVisibility={{ actions: false }}
                        initialColumnConfiguration={[]}
                        columnLabels={{}}
                        enableRowSelection={false}
                        initialRowSelection={{}}
                        onRowSelectionChange={() => {}}
                        bulkActions={[]}
                        emptyMessage="No hay pagos seleccionados"
                        className="rounded-lg"
                        title=""
                        handleSuccessButton={() => {}}
                        isApplyingFilters={false}
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No hay pagos seleccionados</p>
                        <p className="text-xs mt-2">
                          Regresa a la página anterior y selecciona los pagos
                          que deseas procesar
                        </p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          <StepperPN
            number={2}
            is_active={true}
            title="Compensación manual"
            description="Selecciona una tarjeta de la columna de “facturas pendientes” y otra de “pagos disponibles”. El sistema te guiará para realizar una compensación correcta."
          />
          <section className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="">
                <ListAccountReceivable />
              </div>
              <div className="">
                <ListCreditFavor />
              </div>
            </div>
            <div className="">
              <SummaryPaymentNetting selectedRows={selectedPayments} />
            </div>
          </section>
        </section>
      </Main>
    </>
  );
};

export default GeneratePayment;
