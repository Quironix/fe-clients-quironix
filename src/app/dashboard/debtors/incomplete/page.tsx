"use client";

import React, { useEffect } from "react";
import AlertIncomplete from "../components/alert-incomplete";
import { FileCog, ArrowLeft, AlertTriangle } from "lucide-react";
import TitleSection from "../../components/title-section";
import { Main } from "../../components/main";
import Header from "../../components/header";
import Language from "@/components/ui/language";
import Image from "next/image";
import CreateManualDebtor from "../components/create-manual-debtor";
import BulkDebtors from "../components/bulk-debtors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebtorsStore } from "../store";
import { useRouter } from "next/navigation";

const IncompletePage = () => {
  const { bulkUploadErrors, clearBulkUploadErrors } = useDebtorsStore();
  const router = useRouter();

  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: { [key: string]: string } = {
      IS_REQUIRED: "Campo requerido",
      INVALID_FORMAT: "Formato inválido",
      INVALID_EMAIL: "Email inválido",
      INVALID_PHONE: "Teléfono inválido",
      DUPLICATE_VALUE: "Valor duplicado",
      INVALID_LENGTH: "Longitud inválida",
    };
    return errorMessages[errorCode] || errorCode;
  };

  const handleGoBack = () => {
    clearBulkUploadErrors();
    router.push("/dashboard/debtors");
  };

  // Si no hay errores, redirigir de vuelta
  useEffect(() => {
    if (!bulkUploadErrors) {
      router.push("/dashboard/debtors");
    }
  }, [bulkUploadErrors, router]);

  if (!bulkUploadErrors) {
    return null; // O un loading spinner
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
              <BulkDebtors />
            </div>
          </div>

          <div className="bg-white shadow-md rounded-md p-4">
            <span className="text-lg font-semibold text-black mb-2">
              Carga masiva defectuosa
            </span>

            {/* Resumen estadístico */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bulkUploadErrors.validCount}
                </div>
                <div className="text-sm text-gray-600">Válidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {bulkUploadErrors.invalidCount}
                </div>
                <div className="text-sm text-gray-600">Con errores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {bulkUploadErrors.totalCount}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fila</TableHead>
                    <TableHead>Columna</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkUploadErrors.errors.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell>{error.row}</TableCell>
                      <TableCell className="font-medium">
                        {error.column}
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-500 italic">
                          {error.value || "Vacío"}
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
