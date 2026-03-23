"use client";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import DataTableNormal from "../components/data-table-normal";
import Header from "../components/header";
import LoaderTable from "../components/loader-table";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { columns } from "./components/columns";
import CompaniesUploadSection from "./components/companies-upload-section";
import { useCompaniesStore } from "./store";

const CompaniesPage = () => {
  const t = useTranslations("companies");
  const { session, profile } = useProfileContext();
  const { companies, getCompanies, loading } = useCompaniesStore();

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      getCompanies(session.token, profile.client.id);
    }
  }, [profile?.client?.id, session?.token]);

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<Users color="white" />}
          subDescription={t("subDescription")}
        />
        <CompaniesUploadSection />
        <div className="mt-5 border border-gray-200 rounded-md p-3">
          <DataTableNormal
            columns={columns}
            data={companies}
            isLoading={loading}
            loadingComponent={<LoaderTable cols={6} />}
            emptyMessage={t("emptyMessage")}
            pageSize={15}
            pageSizeOptions={[15, 20, 25, 30, 40, 50]}
          />
        </div>
      </Main>
    </>
  );
};

export default CompaniesPage;
