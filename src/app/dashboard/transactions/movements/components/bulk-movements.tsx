"use client";

import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { FileDown, FileUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { BulkUploadResponse } from "../../../debtors/types";
import { bulkMovements } from "../services";
import { useMovementStore } from "../store";

const BulkDebtors = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResponse | null>(
    null
  );
  const [showErrors, setShowErrors] = useState(false);
  const { session, profile } = useProfileContext();
  const { getAllMovements, setBulkUploadErrors } = useMovementStore();
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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea un archivo CSV
    if (
      !file.name.toLowerCase().endsWith(".csv") &&
      !file.name.toLowerCase().endsWith(".xlsx")
    ) {
      toast.error("Por favor selecciona un archivo CSV o XLSX válido");
      return;
    }

    if (!session?.token || !profile?.client?.id) {
      toast.error("Error de autenticación. Por favor inicia sesión nuevamente");
      return;
    }

    setIsUploading(true);
    setUploadResult(null);
    setShowErrors(false);

    try {
      const response: BulkUploadResponse = await bulkMovements(
        session.token,
        profile.client.id,
        file
      );

      setUploadResult(response);

      if (response.invalidCount === 0) {
        toast.success(
          `Archivo cargado exitosamente. ${response.validCount} deudores procesados correctamente.`
        );
        // Refrescar la lista de deudores
        await getAllMovements(session.token, profile.client.id);
      } else {
        // Almacenar errores en el store
        setBulkUploadErrors(response);
        toast.warning(
          `Carga completada con errores. ${response.validCount} válidos, ${response.invalidCount} con errores.`
        );

        // Redirigir a la página de errores incompletos
        router.push("/dashboard/transactions/movements/incomplete");
      }
    } catch (error: any) {
      console.error("Error al cargar archivo:", error);
      toast.error(
        JSON.parse(error.message).message ||
          "Error al cargar el archivo. Por favor intenta nuevamente."
      );
    } finally {
      setIsUploading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloseErrors = () => {
    setShowErrors(false);
    setUploadResult(null);
  };

  return (
    <div className="w-full h-full min-h-full border border-gray-200 rounded-md p-3 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
        Subir <span className="text-orange-500">varias cartolas</span> por carga
        masiva
      </h2>

      <div className="flex flex-col items-center justify-center w-full space-y-4">
        <span className="text-sm text-gray-500 text-left">
          Descarga la estructura del archivo para completarlo con los datos de
          las cartolas que quieres cargar.
        </span>
        <Button
          className="border-2 border-orange-500 bg-white text-orange-500 hover:bg-orange-500 hover:text-white"
          onClick={() => {
            window.open(
              `${process.env.NEXT_PUBLIC_URL_FILE_MOVEMENTS}`,
              "_blank"
            );
          }}
        >
          <FileDown /> Descargar estructura
        </Button>

        <span className="text-sm text-gray-500">
          Una vez que hayas completado el documento, selecciona "Subir archivo"
          para importarlo al sistema.
        </span>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileUpload}
          className="hidden"
        />

        <Button
          className="bg-[#1249C7] text-white hover:bg-[#1249C7]/90 w-60"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Subiendo archivo
            </>
          ) : (
            <>
              <FileUp />
              Subir archivo
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BulkDebtors;
