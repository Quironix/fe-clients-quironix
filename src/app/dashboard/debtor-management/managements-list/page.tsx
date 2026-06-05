"use client";

import { useProfileContext } from "@/context/ProfileContext";
import { PhoneCall } from "lucide-react";
import { useTranslations } from "next-intl";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import DebtorsTable from "./components/debtors-table";

const ManagementsListPage = () => {
  const t = useTranslations("debtorManagement.managementsList");
  const { profile } = useProfileContext();
  const isFactoring = profile?.client?.type === "FACTORING";

  return (
    <Main>
      <TitleSection
        title={t("pageTitle")}
        description={t("pageDescription")}
        icon={<PhoneCall color="white" />}
        subDescription={t("pageSubDescription")}
      />

      <DebtorsTable isFactoring={isFactoring} />
    </Main>
  );
};

export default ManagementsListPage;
