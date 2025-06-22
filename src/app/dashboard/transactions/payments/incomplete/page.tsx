"use client";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import AlertIncomplete from "@/app/dashboard/debtors/components/alert-incomplete";
import Language from "@/components/ui/language";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGetErrorMessage } from "../../hooks/use-get-error-message";
import PaymentsUploadSection from "../components/payments-upload-section";
import { usePaymentStore } from "../store";

const IncompletePage = () => {
  const { bulkUploadErrors, clearBulkUploadErrors } = usePaymentStore();
  const { getErrorMessage } = useGetErrorMessage();
  const router = useRouter();

  // Si no hay errores, redirigir de vuelta
  useEffect(() => {
    if (!bulkUploadErrors) {
      router.push("/dashboard/payments");
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

          <PaymentsUploadSection />

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
