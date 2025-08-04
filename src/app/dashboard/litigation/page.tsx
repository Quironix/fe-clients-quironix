"use client";

import { useState } from "react";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";

import Language from "@/components/ui/language";
import Image from "next/image";

import CreateLitigation from "./components/create-litigation";
import ListLitigation from "./components/list-litigation";

import { FileCog } from "lucide-react";
import NormalizeEntry from "./components/modals/normalize-entry";
import NormalizeLitigation from "./components/normalize-litigation";

const Litigation = () => {
  const [openCreateForm, setOpenCreateForm] = useState(false);
  const [openNormalizeForm, setOpenNormalizeForm] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  return (
    <>
      <Header fixed>
        <Language />
      </Header>

      <Main>
        <TitleSection
          title="Compensación de pagos"
          icon={<FileCog color="white" />}
          subDescription="Compensación de pagos"
        />

        <div className="flex justify-between items-start gap-5 p-3 border border-gray-200 rounded-md h-[320px]">
          <div className="w-[25%] h-full">
            <Image
              src="/img/image-litigation.svg"
              alt="Deudores"
              className="w-full h-full object-cover rounded-md"
              width={100}
              height={100}
            />
          </div>

          <div className="w-[37.5%] h-full">
            <CreateLitigation />
          </div>

          <div className="w-[37.5%] h-full">
            <NormalizeLitigation
              onOpenForm={() => setOpenNormalizeForm(true)}
            />
          </div>
        </div>

        <div className="mt-5 border border-gray-200 rounded-md p-3">
          <ListLitigation />
        </div>

        {openNormalizeForm && (
          <NormalizeEntry onClose={() => setOpenNormalizeForm(false)} />
        )}
      </Main>
    </>
  );
};

export default Litigation;
