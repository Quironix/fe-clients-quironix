"use client";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChartSpline } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { getAllDebtors } from "../../services";
import { usePaymentProjectionStore } from "../../store";
import DetailDebtorProjection from "./components/detail-debtor-projection";
import ListInvoicesProjection from "./components/list-invoices-projection";

const PageDetailDebtor = () => {
  const router = useRouter();
  const { debtorCode } = useParams();
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { periodMonth } = usePaymentProjectionStore();

  const { data: debtor, refetch } = useQuery({
    queryKey: ["debtor", debtorCode],
    queryFn: () =>
      getAllDebtors(
        session?.token,
        profile?.client_id,
        debtorCode as string,
        periodMonth as string,
        1,
        10
      ),
    enabled:
      !!debtorCode && !!periodMonth && !!session?.token && !!profile?.client_id,
  });

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Ingreso de proyección de pagos"
          description="Organiza y monitorea tu plan de pagos de 5 semanas"
          icon={<ChartSpline color="white" />}
          subDescription="Proyección de pagos"
        />
        <Card>
          <CardContent>
            <div className="space-y-5">
              <DetailDebtorProjection debtor={debtor?.data?.data[0]} />

              <div className="flex items-center justify-start gap-2">
                <Button
                  className="bg-blue-900 text-white"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="text-white" />
                  Volver
                </Button>
                <span className="text-sm font-bold">Proyección semanal</span>
                <span className="text-sm">|</span>
                <span className="text-sm">Periodo {periodMonth}</span>
              </div>

              <ListInvoicesProjection
                debtor={debtor?.data?.data[0]}
                periodMonth={periodMonth}
                handleRefetch={refetch}
              />
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  );
};

export default PageDetailDebtor;
