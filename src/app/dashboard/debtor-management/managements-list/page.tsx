"use client";

import { useProfileContext } from "@/context/ProfileContext";
import { PhoneCall } from "lucide-react";
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
    <Main>
      <TitleSection
        title={t("pageTitle")}
        description={t("pageDescription")}
        icon={<PhoneCall color="white" />}
        subDescription={t("pageSubDescription")}
      />

      {isFactoring && (
        <div className="mb-5">
          <SelectClient
            field={{
              value: selectedCompanyId,
              onChange: (val: string | null) => setSelectedCompanyId(val),
            }}
            title={t("selectCompanyLabel")}
            singleClient={true}
          />
        </div>
      )}

      <DebtorsTable selectedCompanyId={selectedCompanyId} />
    </Main>
  );
};

export default ManagementsListPage;
