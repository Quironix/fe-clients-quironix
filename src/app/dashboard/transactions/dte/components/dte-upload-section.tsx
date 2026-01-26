"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfileContext } from "@/context/ProfileContext";
import { Copy } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import BulkData from "../../../components/bulk-data";
import CreateManual from "../../../components/create-manual";
import { bulkData } from "../services";
import { useDTEStore } from "../store";
import { BulkUploadResponse } from "../types";

interface DTEUploadSectionProps {}

const DTEUploadSection = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session, profile } = useProfileContext();
  const { setBulkUploadErrors } = useDTEStore();
  const router = useRouter();

  const clientId = profile?.client?.id || "";
  const dteEmail = `reception_dte+${clientId}@quironix.com`;

  const handleCopyDteEmail = () => {
    if (!clientId) {
      toast.error("No se pudo obtener el ID del cliente");
      return;
    }
    navigator.clipboard.writeText(dteEmail);
    toast.success("Email copiado al portapapeles");
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

    try {
      const response: BulkUploadResponse = await bulkData(
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
        await fetch;
      } else {
        // Almacenar errores en el store
        setBulkUploadErrors(response);
        toast.warning(
          `Carga completada con errores. ${response.validCount} válidos, ${response.invalidCount} con errores.`
        );

        // Redirigir a la página de errores incompletos
        router.push("/dashboard/transactions/dte/incomplete");
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

  return (
    <div className="flex justify-between items-start gap-5 p-3 border border-gray-200 rounded-md h-[320px]">
      <div className="w-[20%] h-full">
        <Image
          src="/img/debtors-image.svg"
          alt="Deudores"
          className="w-full h-full object-cover rounded-md"
          width={100}
          height={100}
        />
      </div>
      <div className="w-[22%] h-full">
        <CreateManual
          title={
            <>
              Subir <span className="text-orange-500">un DTE</span> por carga{" "}
              <span className="text-orange-500">manual</span>
            </>
          }
          description="Completa el formulario con los datos del DTE que quieres agregar. Esta opción es ideal si vas a cargar un único registro y no cuestas con un archivo para importar."
          buttonText="Crear DTE"
          buttonLink="/dashboard/transactions/dte/create"
        />
      </div>
      <div className="w-[26%] h-full">
        <div className="w-full h-full border border-gray-200 rounded-md p-3 space-y-4">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
            Recepción <span className="text-orange-500">automática</span> de DTE
          </h2>
          <div className="flex flex-col w-full">
            <span className="text-sm text-gray-500">
              Configura este correo en tu sistema de facturación. Al recibir tus DTEs en esta dirección, los procesaremos automáticamente, los cargaremos al sistema y almacenaremos el PDF asociado.
            </span>
            <div className="flex items-center gap-2 mt-4">
              <Input
                value={dteEmail}
                disabled
                className="bg-gray-50 text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyDteEmail}
                title="Copiar email"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[32%] h-full">
        <BulkData
          title={
            <>
              Subir <span className="text-orange-500">varios DTE</span> por
              carga masiva
            </>
          }
          urlFile={`${process.env.NEXT_PUBLIC_URL_FILE_DTE}`}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          isUploading={isUploading}
          handleUploadClick={handleUploadClick}
          uploadResult={uploadResult}
          downloadText="Descargar estructura"
          uploadText="Subir archivo"
          uploadingText="Procesando documentos..."
          instructionText={
            <>
              Una vez que hayas completado el documento, selecciona{" "}
              <b>"Subir archivo"</b> para importarlo al sistema.
            </>
          }
          customSuccessMessage={(result) =>
            `¡Éxito! ${result.validCount} documentos DTE procesados correctamente`
          }
          customErrorMessage={(result) =>
            `Error: ${result.message || "No se pudieron procesar los documentos DTE"}`
          }
        />
      </div>
    </div>
  );
};

export default DTEUploadSection;
