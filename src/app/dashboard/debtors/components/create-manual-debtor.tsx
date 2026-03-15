"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import { useTranslations } from "next-intl";

const CreateManualDebtor = () => {
  const router = useRouter();
  const t = useTranslations("debtors.createManual");
  return (
    <div className="w-full h-full min-h-full border border-gray-200 rounded-md p-3 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
        {t.rich("title", {
          debtor: (chunks) => <span className="text-orange-500">{t("debtor")}</span>,
          manual: (chunks) => <span className="text-orange-500">{t("manual")}</span>,
        })}
      </h2>
      <div className="flex flex-col items-center justify-center w-full">
        <span className="text-sm text-gray-500">
          {t("description")}
        </span>
        <Button
          className="mt-4 px-10 bg-[#1249C7] text-white hover:bg-[#1249C7]/90"
          onClick={() => router.push("/dashboard/debtors/create")}
        >
          {t("button")}
        </Button>
      </div>
    </div>
  );
};

export default CreateManualDebtor;
