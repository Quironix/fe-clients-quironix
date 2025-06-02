import React from "react";
import TitleSection from "@/app/dashboard/components/title-section";

import { FileCog, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import Image from "next/image";
import CreateManualDebtor from "./components/create-manual-debtor";
import BulkDebtors from "./components/bulk-debtors";
import ListDebtors from "./components/list-debtors";

const DebtorsPage = () => {
  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            size="icon"
            className="bg-orange-500 text-white rounded-full hover:bg-orange-400 cursor-pointer"
          >
            ES
          </Button>
        </div>
      </Header>
      <Main>
        <TitleSection
          title="Deudores"
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<FileCog color="white" />}
          subDescription="Configuración de la cartera"
        />
        <div className="flex justify-between items-start gap-5 p-3 border border-gray-200 rounded-md h-[320px]">
          <div className="w-[25%] h-full">
            <Image
              src="/img/debtors-image.svg"
              alt="Deudores"
              className="w-full h-full object-cover rounded-md"
              width={100}
              height={100}
            />
          </div>
          <div className="w-[37.5%] h-full">
            <CreateManualDebtor />
          </div>
          <div className="w-[37.5%] h-full">
            <BulkDebtors />
          </div>
        </div>
        <div className="mt-5 border border-gray-200 rounded-md p-3">
          <ListDebtors />
        </div>
      </Main>
    </>
  );
};

export default DebtorsPage;
