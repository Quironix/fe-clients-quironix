"use client";

import { useProfileContext } from "@/context/ProfileContext";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import BulkData from "../../../components/bulk-data";
import CreateManual from "../../../components/create-manual";
import { bulkData } from "../services";

import { usePaymentStore } from "../store";
import { BulkUploadResponse } from "../types";

const PaymentUploadSection = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session, profile } = useProfileContext();
  const { setBulkUploadErrors } = usePaymentStore();
  const router = useRouter();
  const tUpload = useTranslations("transactions.payments.upload");
  const tCommon = useTranslations("common.upload");

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
      toast.error(tCommon("selectValidFile"));
      return;
    }

    if (!session?.token || !profile?.client?.id) {
      toast.error(tCommon("authError"));
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
        toast.success(tUpload("successBulk", { count: response.validCount }));
        // Refrescar la lista de pagos
        await fetch;
      } else {
        // Almacenar errores en el store
        setBulkUploadErrors(response);
        toast.warning(tUpload("warningBulk", { valid: response.validCount, invalid: response.invalidCount }));

        // Redirigir a la página de errores incompletos
        router.push("/dashboard/transactions/payments/incomplete");
      }
    } catch (error: any) {
      console.error("Error al cargar archivo:", error);
      toast.error(
        JSON.parse(error.message).message ||
          tUpload("errorBulk")
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
      <div className="w-[25%] h-full">
        <Image
          src="/img/debtors-image.svg"
          alt="Pagos"
          className="w-full h-full object-cover rounded-md"
          width={100}
          height={100}
        />
      </div>
      <div className="w-[37.5%] h-full">
        <CreateManual
          title={
            <>
              Subir <span className="text-orange-500">un pago</span> por carga{" "}
              <span className="text-orange-500">manual</span>
            </>
          }
          description="Completa el formulario con los datos del pagos que quieres agregar. Esta opción es ideal si vas a cargar un único registro y no cuestas con un archivo para importar."
          buttonText="Crear pago"
          buttonLink="/dashboard/transactions/payments/create"
        />
      </div>
      <div className="w-[37.5%] h-full">
        <BulkData
          title={
            <>
              Subir <span className="text-orange-500">varios pagos</span> por
              carga masiva
            </>
          }
          urlFile={`${process.env.NEXT_PUBLIC_URL_FILE_PAYMENTS}`}
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
            `¡Éxito! ${result.validCount} documentos de pagos procesados correctamente`
          }
          customErrorMessage={(result) =>
            `Error: ${result.message || "No se pudieron procesar los documentos DTE"}`
          }
        />
      </div>
    </div>
  );
};

export default PaymentUploadSection;
