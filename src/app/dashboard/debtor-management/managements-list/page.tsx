"use client";

import { useProfileContext } from "@/context/ProfileContext";
import { PhoneCall } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import SelectClient from "@/app/dashboard/components/select-client";
import DebtorsTable from "./components/debtors-table";

const ManagementsListPage = () => {
  const t = useTranslations("debtorManagement.managementsList");
  const { profile } = useProfileContext();
  const isFactoring = profile?.client?.type === "FACTORING";
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  return (
    <>
      <Main>
        <TitleSection
          title={t("pageTitle")}
          description={t("pageDescription")}
          icon={<PhoneCall color="white" />}
          subDescription={t("pageSubDescription")}
        />

        <div className="flex items-center justify-center gap-5 p-3 border border-gray-200 rounded-md h-[325px] mb-5">
          <div className="shrink-0">
            <Image
              src="/img/payment-projection.svg"
              alt="Historial de gestiones"
              className="h-full object-cover rounded-md bg-slate-100 p-4 min-w-[300px]"
              width={300}
              height={300}
            />
          </div>

          <div className="w-full h-full border border-gray-200 rounded-md p-5 flex flex-col items-start justify-start gap-6">
            <span className="text-lg font-bold">{t("tableTitle")}</span>
            {isFactoring ? (
              <SelectClient
                field={{
                  value: selectedCompanyId,
                  onChange: (val: string | null) => setSelectedCompanyId(val),
                }}
                title={t("selectCompanyLabel")}
                singleClient={true}
              />
            ) : (
              <p className="text-sm text-gray-600">{t("pageDescription")}</p>
            )}
          </div>
        </div>

        <DebtorsTable selectedCompanyId={selectedCompanyId} />
      </Main>
    </>
  );
};

export default ManagementsListPage;
