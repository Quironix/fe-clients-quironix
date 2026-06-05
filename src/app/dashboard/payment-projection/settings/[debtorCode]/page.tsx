"use client";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChartSpline } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getAllDebtors, getReportsByDebtor } from "../../services";
import { usePaymentProjectionStore } from "../../store";
import DetailDebtorProjection from "./components/detail-debtor-projection";
import ListInvoicesProjection from "./components/list-invoices-projection";

const PageDetailDebtor = () => {
  const t = useTranslations("paymentProjection.settings");
  const router = useRouter();
  const { debtorCode } = useParams();
  const searchParams = useSearchParams();
  const debtorCodeParam = searchParams.get("code");
  const periodParam = searchParams.get("period");
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { periodMonth: zustandPeriodMonth } = usePaymentProjectionStore();
  const queryClient = useQueryClient();

  const derivedPeriodMonth =
    zustandPeriodMonth ??
    (periodParam ? periodParam.replace("-", "/") : null);

  const {
    data: projection,
    refetch: refetchProjection,
    isLoading: isLoadingProjection,
    isError: isErrorProjection,
  } = useQuery({
    queryKey: ["debtor-projection", debtorCode, derivedPeriodMonth],
    queryFn: () =>
      getReportsByDebtor(
        session?.token as string,
        profile?.client_id as string,
        debtorCode as string,
        derivedPeriodMonth
      ),
    enabled: !!debtorCode && !!session?.token && !!profile?.client_id,
  });

  const {
    data: debtorInfo,
    refetch: refetchDebtorInfo,
    isLoading: isLoadingDebtorInfo,
    isError: isErrorDebtorInfo,
  } = useQuery({
    queryKey: ["debtor-info", debtorCodeParam, derivedPeriodMonth],
    queryFn: () =>
      getAllDebtors(
        session?.token as string,
        profile?.client_id as string,
        debtorCodeParam,
        derivedPeriodMonth,
        1,
        1
      ),
    enabled: !!debtorCodeParam && !!session?.token && !!profile?.client_id,
  });

  const isLoading = isLoadingProjection || isLoadingDebtorInfo;
  const isError = isErrorProjection || isErrorDebtorInfo;

  const handleRetry = () => {
    refetchProjection();
    refetchDebtorInfo();
  };

  const handleDropSuccess = () => {
    refetchProjection();
    queryClient.invalidateQueries({ queryKey: ["debtors"] });
  };

  const debtor = {
    ...projection?.data,
    name: debtorInfo?.data?.data?.[0]?.name,
    debtor_code: debtorInfo?.data?.data?.[0]?.debtor_code,
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("pageTitle")}
          description={t("pageDescription")}
          icon={<ChartSpline color="white" />}
          subDescription={t("pageTitle")}
        />

        {isLoading ? (
          <Card>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4 py-10">
                <span className="text-sm text-gray-600">
                  {t("errorLoading")}
                </span>
                <Button onClick={handleRetry}>{t("retry")}</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <div className="space-y-5">
                <DetailDebtorProjection debtor={debtor} />

                <div className="flex items-center justify-start gap-2">
                  <Button
                    className="bg-blue-900 text-white"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="text-white" />
                    {t("back")}
                  </Button>
                  <span className="text-sm font-bold">{t("weeklyProjection")}</span>
                  <span className="text-sm">|</span>
                  <span className="text-sm">{t("period", { month: derivedPeriodMonth })}</span>
                </div>

                <ListInvoicesProjection
                  debtor={debtor}
                  periodMonth={derivedPeriodMonth ?? undefined}
                  handleRefetch={refetchProjection}
                  onDropSuccess={handleDropSuccess}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  );
};

export default PageDetailDebtor;
