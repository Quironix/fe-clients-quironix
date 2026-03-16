"use client";

import Language from "@/components/ui/language";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import ProfileForm from "./components/profile-form";

const ProfileContent = () => {
  const t = useTranslations("profile");

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<User color="white" />}
          subDescription={t("subDescription")}
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="w-full h-full">
            <Card className="h-full p-6 max-w-2xl">
              <ProfileForm />
            </Card>
          </div>
        </div>
      </Main>
    </>
  );
};

const ProfilePage = () => {
  return (
    <Suspense fallback={<div></div>}>
      <ProfileContent />
    </Suspense>
  );
};

export default ProfilePage;
