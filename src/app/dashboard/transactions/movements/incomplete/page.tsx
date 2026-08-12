"use client";

import Language from "@/components/ui/language";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "../../../components/header";
import { Main } from "../../../components/main";
import AlertIncomplete from "../../../debtors/components/alert-incomplete";
import { useGetErrorMessage } from "../../hooks/use-get-error-message";
import BulkMovements from "../components/bulk-movements";
import { useMovementStore } from "../store";

const IncompletePage = () => {
  const { bulkUploadErrors, clearBulkUploadErrors } = useMovementStore();
  const { getErrorMessage } = useGetErrorMessage();
  const t = useTranslations("bulkUpload");
  const router = useRouter();

  const handleGoBack = () => {
    clearBulkUploadErrors();
    router.push("/dashboard/debtors");
  };

  useEffect(() => {
    if (!bulkUploadErrors) {
      router.push("/dashboard/debtors");
    }
  }, [bulkUploadErrors, router]);

  if (!bulkUploadErrors) {
    return null;
  }

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <section className="space-y-4">
          <AlertIncomplete />

          <div className="flex justify-between items-start gap-5 p-3 border border-gray-200 rounded-md h-[320px]">
            <div className="w-[30%] h-full">
              <Image
                src="/img/debtors-image.svg"
                alt="Deudores"
                className="w-full h-full object-cover rounded-md"
                width={100}
                height={100}
              />
            </div>
            <div className="w-[70%] h-full">
              <BulkMovements />
            </div>
          </div>

          <div className="bg-white shadow-md rounded-md p-4">
            <span className="text-lg font-semibold text-black mb-2">
              {t("title")}
            </span>

            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bulkUploadErrors.validCount}
                </div>
                <div className="text-sm text-gray-600">{t("valid")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {bulkUploadErrors.invalidCount}
                </div>
                <div className="text-sm text-gray-600">{t("withErrors")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {bulkUploadErrors.totalCount}
                </div>
                <div className="text-sm text-gray-600">{t("total")}</div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("row")}</TableHead>
                    <TableHead>{t("column")}</TableHead>
                    <TableHead>{t("value")}</TableHead>
                    <TableHead>{t("error")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkUploadErrors.errors.map((error: { row: number; column: string; value: string; message: string }, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{error.row}</TableCell>
                      <TableCell className="font-medium">
                        {error.column}
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-500 italic">
                          {error.value || t("empty")}
                        </span>
                      </TableCell>
                      <TableCell>{getErrorMessage(error.message)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </Main>
    </>
  );
};

export default IncompletePage;
