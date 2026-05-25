"use client";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import Language from "@/components/ui/language";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { ManagementHistoryContent } from "../../components/management-history-content";

const Content = () => {
  const params = useParams();
  const debtorId = params?.id as string;

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <ManagementHistoryContent debtorId={debtorId} showBreadcrumb={true} />
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
