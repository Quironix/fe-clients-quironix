"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { ChartSpline, PhoneCall } from "lucide-react";
import { Suspense } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";

const Content = () => {
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Template"
          description="lorem"
          icon={<PhoneCall color="white" />}
          subDescription="Subdescription"
        />
      </Main>
    </>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Content />
    </Suspense>
  );
};

export default Page;
