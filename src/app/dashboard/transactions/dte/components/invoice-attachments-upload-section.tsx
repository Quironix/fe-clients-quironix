"use client";

import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import {
  AlertCircle,
  CheckCircle,
  FileDown,
  FileSpreadsheet,
  FileUp,
  Paperclip,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { bulkUploadAttachments } from "../services";
import { BulkUploadAttachmentsResponse } from "../types";

const InvoiceAttachmentsUploadSection = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadAttachmentsResponse | null>(
    null
  );
  const csvInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const { session, profile } = useProfileContext();

  const handleCsvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setCsvFile(file);
  };

  const handlePdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setPdfFiles(files);
  };

  const handleCsvButtonClick = () => {
    csvInputRef.current?.click();
  };

  const handlePdfButtonClick = () => {
    pdfInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!csvFile || pdfFiles.length === 0) {
      toast.error("Sube el CSV índice y al menos un comprobante");
      return;
    }
    if (!session?.token || !profile?.client?.id) {
      toast.error("Error de autenticación");
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      const response: BulkUploadAttachmentsResponse =
        await bulkUploadAttachments(
          session.token,
          profile.client.id,
          csvFile,
          pdfFiles
        );

      setResult(response);

      if (response.invalidCount === 0) {
        toast.success(
          `¡Éxito! ${response.validCount} comprobantes cargados correctamente`
        );
      } else {
        toast.warning(
          `${response.validCount} comprobantes cargados, ${response.invalidCount} con errores`
        );
      }
    } catch (error: any) {
      console.error("Error al cargar comprobantes:", error);
      try {
        toast.error(JSON.parse(error.message).message);
      } catch {
        toast.error("Error al cargar los comprobantes");
      }
    } finally {
      setIsUploading(false);
      if (csvInputRef.current) csvInputRef.current.value = "";
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      setCsvFile(null);
      setPdfFiles([]);
    }
  };

  return (
    <div className="w-full h-full border border-gray-200 rounded-md p-3 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
        Subir <span className="text-orange-500">comprobantes</span> por carga
        masiva
      </h2>
      <div className="flex flex-col items-center justify-center w-full space-y-4">
        <span className="text-sm text-gray-500 text-center">
          Sube un CSV o Excel con las columnas <b>number</b>,{" "}
          <b>nombre_archivo</b>, <b>codigo_deudor</b> y{" "}
          <b>tipo_documento</b> junto con los PDF de los comprobantes
          referenciados.
        </span>

        <div className="flex w-full items-stretch gap-3">
          <Button
            variant="outline"
            className="border-2 border-orange-500 bg-white text-black hover:bg-orange-500 hover:text-white flex-1 justify-start"
            onClick={() => {
              window.open(`${process.env.NEXT_PUBLIC_URL_FILE_INVOICE_ATTACHMENTS}`, "_blank");
            }}
          >
            <FileDown className="text-orange-500" />
            Descargar estructura
          </Button>

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleCsvChange}
            className="hidden"
          />
          <Button
            variant="outline"
            className="border-2 border-orange-500 bg-white text-black hover:bg-orange-500 hover:text-white flex-1 justify-start"
            onClick={handleCsvButtonClick}
          >
            <FileSpreadsheet className="text-orange-500" />
            {csvFile ? csvFile.name : "Seleccionar CSV/Excel"}
          </Button>

          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={handlePdfChange}
            className="hidden"
          />
          <Button
            variant="outline"
            className="border-2 border-orange-500 bg-white text-black hover:bg-orange-500 hover:text-white flex-1 justify-start"
            onClick={handlePdfButtonClick}
          >
            <Paperclip className="text-orange-500" />
            {pdfFiles.length > 0
              ? `${pdfFiles.length} comprobante${pdfFiles.length > 1 ? "s" : ""} seleccionado${pdfFiles.length > 1 ? "s" : ""}`
              : "Seleccionar comprobantes"}
          </Button>
        </div>

        <Button
          className="bg-[#1249C7] text-white hover:bg-[#1249C7]/90 w-60"
          onClick={handleSubmit}
          disabled={isUploading}
        >
          <FileUp /> {isUploading ? "Procesando..." : "Procesar carga masiva"}
        </Button>

        {result && (
          <>
            {result.invalidCount === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md w-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700">
                  {result.validCount} comprobantes cargados correctamente
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-3 bg-red-50 border border-red-200 rounded-md w-full">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-700 font-medium">
                    {result.validCount} válidos, {result.invalidCount} con
                    errores
                  </span>
                </div>
                <ul className="text-xs text-red-600 list-disc list-inside ml-7">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceAttachmentsUploadSection;
