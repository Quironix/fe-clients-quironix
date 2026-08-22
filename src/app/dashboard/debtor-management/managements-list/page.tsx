"use client";

import { Button } from "@/components/ui/button";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { PhoneCall, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import DebtorsTable from "./components/debtors-table";

const ManagementsListPage = () => {
  const t = useTranslations("debtorManagement.managementsList");
  const { profile } = useProfileContext();
  const isFactoring = profile?.client?.type === "FACTORING";
  const router = useRouter();

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("pageTitle")}
          description={t("pageDescription")}
          icon={<PhoneCall color="white" />}
          subDescription={t("pageSubDescription")}
        />

        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/transactions/current-account")}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {t("viewAllDebtorsCurrentAccount")}
          </Button>
        </div>

        <DebtorsTable isFactoring={isFactoring} />
      </Main>
    </>
  );
};

export default ManagementsListPage;
