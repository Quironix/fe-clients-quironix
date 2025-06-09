"use client";

import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { CheckCircle, FileDown, FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { bulkDebtors } from "../services";
import { useDebtorsStore } from "../store";
import { BulkUploadResponse } from "../types";

const BulkDebtors = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResponse | null>(
    null
  );
  const [showErrors, setShowErrors] = useState(false);
  const { session, profile } = useProfileContext();
  const { fetchDebtors, setBulkUploadErrors } = useDebtorsStore();
  const router = useRouter();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea un archivo CSV
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Por favor selecciona un archivo CSV válido");
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
      const response: BulkUploadResponse = await bulkDebtors(
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
        await fetchDebtors(session.token, profile.client.id);
      } else {
        // Almacenar errores en el store
        setBulkUploadErrors(response);
        toast.warning(
          `Carga completada con errores. ${response.validCount} válidos, ${response.invalidCount} con errores.`
        );

        // Redirigir a la página de errores incompletos
        router.push("/dashboard/debtors/incomplete");
      }
    } catch (error: any) {
      console.error("Error al cargar archivo:", error);
      toast.error(
        error?.message ||
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

  return (
    <div className="w-full h-full min-h-full border border-gray-200 rounded-md p-3 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
        Subir <span className="text-orange-500">varios deudores</span> por carga
        masiva
      </h2>

      <div className="flex flex-col items-center justify-center w-full space-y-4">
        <span className="text-sm text-gray-500 text-left">
          Descarga la estructura del archivo para completarlo con los datos de
          los deudores que quieres cargar.
        </span>
        <Button
          className="border-2 border-orange-500 bg-white text-orange-500 hover:bg-orange-500 hover:text-white"
          onClick={() => {
            window.open(
              `https://storage.googleapis.com/dbt-latam.firebasestorage.app/debtors-csv.csv`,
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
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        <Button
          className="bg-[#1249C7] text-white hover:bg-[#1249C7]/90 w-60"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <FileUp /> {isUploading ? "Subiendo archivo..." : "Subir archivo"}
        </Button>

        {uploadResult && uploadResult.invalidCount === 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-700">
              ¡Éxito! {uploadResult.validCount} deudores cargados correctamente
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkDebtors;
