"use client";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect } from "react";
import CreateManual from "../components/create-manual";
import DataTableNormal from "../components/data-table-normal";
import Header from "../components/header";
import LoaderTable from "../components/loader-table";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { columns } from "./components/columns";
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
        <div className="flex justify-between items-start gap-5 p-3 border border-gray-200 rounded-md h-[320px] w-full">
          <div className="w-1/3 h-full">
            <Image
              src="/img/debtors-image.svg"
              alt="Deudores"
              className="w-full h-full object-cover rounded-md"
              width={100}
              height={100}
            />
          </div>
          <div className="w-2/3  h-full">
            <CreateManual
              title={t("createTitle")}
              description={t("createDescription")}
              buttonText={t("createButton")}
              buttonLink="/dashboard/companies/create"
            />
          </div>
          {/* <div className="w-[37.5%] h-full"><BulkDebtors /></div> */}
        </div>
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
