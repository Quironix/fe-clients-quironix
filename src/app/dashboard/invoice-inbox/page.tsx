import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import Language from "@/components/ui/language";
import { IconMail } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { InvoiceInboxList } from "./components/invoice-inbox-list";

const InvoiceInboxPage = () => {
  const t = useTranslations("dashboard.invoice_inbox");

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<IconMail color="white" />}
          subDescription={t("title")}
        />
        <div className="mt-5 rounded-md border border-gray-200 p-4">
          <InvoiceInboxList />
        </div>
      </Main>
    </>
  );
};

export default InvoiceInboxPage;
