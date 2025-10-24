"use client";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { Cog } from "lucide-react";
import { useSession } from "next-auth/react";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import { CollectorForm } from "../components/collector-form";

const PageCreateCollector = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();

  if (!session?.token || !profile?.client_id) {
    return null;
  }

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Crear collectors"
          description="Aquí puedes crear un collectors."
          icon={<Cog color="white" />}
          subDescription="Collectors"
        />
        <CollectorForm
          mode="create"
          accessToken={session.token}
          clientId={profile.client_id}
        />
      </Main>
    </>
  );
};

export default PageCreateCollector;
