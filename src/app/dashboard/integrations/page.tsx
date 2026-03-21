"use client";
import Language from "@/components/ui/language";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import ApiKeysSection from "./components/api-keys-section";

const IntegrationsPage = () => {
  const t = useTranslations("integrations");
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<FileText color="white" />}
          subDescription={t("subDescription")}
        />
        {/* <div className="flex flex-col gap-4">
          <CardItem
            image="/img/integrations.svg"
            buttonText={t("connectErp")}
            onButtonClick={() => {
              console.log("hola");
            }}
            title={t("integrationsTitle")}
            description={t("integrationsDescription")}
          />
          <CardItem
            image="/img/settings.svg"
            buttonText={t("connectErp")}
            onButtonClick={() => {
              console.log("hola");
            }}
            title={t("configurationsTitle")}
            description={t("configurationsDescription")}
          />
        </div> */}
        <ApiKeysSection />
      </Main>
    </>
  );
};

export default IntegrationsPage;
