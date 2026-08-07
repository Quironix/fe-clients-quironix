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
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import { columns } from "../components/columns";
import ListAccountReceivable from "../components/list-account-receivable";
import ListCreditFavor from "../components/list-credit-favor";
import StepperPN from "../components/stepper";
import SummaryPaymentNetting from "../components/summary-payment-netting";
import { usePaymentNettingStore } from "../store";
import { getPaymentNetting } from "../services";

function GeneratePaymentContent() {
  const t = useTranslations("paymentNetting.generatePaymentPage");
  const tParent = useTranslations("paymentNetting");
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const { resetSelected } = usePaymentNettingStore();
  const searchParams = useSearchParams();
  const [selectedPayments, setSelectedPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const debtorId = searchParams.get("debtorId");
  const movementsParam = searchParams.get("movements");
  const movementIds = useMemo(() => {
    return movementsParam ? movementsParam.split(",") : [];
  }, [movementsParam]);

  useEffect(() => {
    resetSelected();
  }, [resetSelected]);

  useEffect(() => {
    const fetchPaymentsData = async () => {
      if (!session?.token || !profile?.client_id || movementIds.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getPaymentNetting({
          accessToken: session.token,
          clientId: profile.client_id,
          page: 1,
          limit: 100,
          status: "ALL",
        });

        if (response.data) {
          const filteredPayments = response.data.filter((payment: any) =>
            movementIds.includes(payment.id)
          );
          setSelectedPayments(filteredPayments);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentsData();
  }, [session?.token, profile?.client_id, movementIds]);

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={tParent("description")}
          icon={<FileCheck2 color="white" />}
          subDescription={tParent("subDescription")}
        />
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">{t("breadcrumbHome")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/payment-netting">
                {t("breadcrumbNetting")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold text-primary">
                {t("breadcrumbGenerate")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <section className="space-y-4">
          <StepperPN
            number={1}
            is_active={true}
            title={t("paymentSelection")}
            description={t("paymentSelectionDesc")}
          />

          <Card>
            <CardContent className="p-0 m-0">
              <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {t("selectedPayments", { count: selectedPayments.length })}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-6">
                    {selectedPayments.length > 0 ? (
                      <DataTableDynamicColumns
                        columns={columns}
                        data={selectedPayments}
                        isLoading={isLoading}
                        isServerSideLoading={isLoading}
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
                        emptyMessage={t("noPaymentsSelected")}
                        className="rounded-lg"
                        title=""
                        handleSuccessButton={() => {}}
                        isApplyingFilters={false}
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">{t("noPaymentsSelected")}</p>
                        <p className="text-xs mt-2">
                          {t("goBackAndSelect")}
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
            title={t("manualCompensation")}
            description={t("manualCompensationDesc")}
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
              <SummaryPaymentNetting selectedRows={selectedPayments} debtorId={debtorId} />
            </div>
          </section>
        </section>
      </Main>
    </>
  );
}

export default function GeneratePayment() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    }>
      <GeneratePaymentContent />
    </Suspense>
  );
}
