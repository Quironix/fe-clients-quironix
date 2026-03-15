"use client";
import Language from "@/components/ui/language";
import Loader from "@/components/Loader";
import { useProfileContext } from "@/context/ProfileContext";
import { Cog } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Header from "../../../components/header";
import { Main } from "../../../components/main";
import TitleSection from "../../../components/title-section";
import { CollectorForm } from "../../components/collector-form";
import { getById } from "../../services";
import type { CollectorResponse } from "../../services/types";

const PageEditCollector = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const t = useTranslations("collectors.editPage");
  const params = useParams();
  const collectorId = params.id as string;

  const [collector, setCollector] = useState<CollectorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollector = async () => {
      if (!session?.token || !profile?.client_id || !collectorId) {
        return;
      }

      try {
        setIsLoading(true);
        const data = await getById(session.token, collectorId, profile.client_id);
        setCollector(data);
      } catch (error) {
        console.error("Error fetching collector:", error);
        toast.error(t("loadError"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollector();
  }, [session?.token, profile?.client_id, collectorId]);

  if (isLoading) {
    return (
      <>
        <Header fixed>
          <Language />
        </Header>
        <Main>
          <div className="flex justify-center items-center h-96">
            <Loader />
          </div>
        </Main>
      </>
    );
  }

  if (!collector) {
    return (
      <>
        <Header fixed>
          <Language />
        </Header>
        <Main>
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-500">{t("notFound")}</p>
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<Cog color="white" />}
          subDescription={t("subDescription")}
        />
        <CollectorForm
          mode="edit"
          initialData={collector}
          accessToken={session.token}
          clientId={profile.client_id}
        />
      </Main>
    </>
  );
};

export default PageEditCollector;
