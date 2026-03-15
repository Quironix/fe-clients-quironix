"use client";

import React from "react";
import TitleSection from "@/app/dashboard/components/title-section";

import { FileCog } from "lucide-react";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import Language from "@/components/ui/language";
import { useTranslations } from "next-intl";

const CreateDebtorPage = () => {
  const t = useTranslations("debtors");
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("create.title")}
          description={t("description")}
          icon={<FileCog color="white" />}
          subDescription={t("subDescription")}
        />
        <h1>{t("create.createDebtor")}</h1>
      </Main>
    </>
  );
};

export default CreateDebtorPage;
