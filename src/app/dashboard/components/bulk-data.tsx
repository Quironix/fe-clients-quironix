import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, FileDown, FileUp } from "lucide-react";

interface UploadResult {
  success: boolean;
  validCount?: number;
  invalidCount?: number;
  message?: string;
  errors?: string[];
}

interface BulkDataProps {
  title: React.ReactNode;
  urlFile?: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  isUploading: boolean;
  handleUploadClick: () => void;
  uploadResult: UploadResult | null;
  // Nuevas props para personalización
  downloadText?: string;
  uploadText?: string;
  uploadingText?: string;
  instructionText?: React.ReactNode;
  acceptedFileTypes?: string;
  showDownloadButton?: boolean;
  customSuccessMessage?: (result: UploadResult) => string;
  customErrorMessage?: (result: UploadResult) => string;
}

const BulkData = ({
  title,
  urlFile,
  fileInputRef,
  handleFileUpload,
  isUploading,
  handleUploadClick,
  uploadResult,
  downloadText = "Descargar estructura",
  uploadText = "Subir archivo",
  uploadingText = "Subiendo archivo...",
  instructionText = 'Una vez que hayas completado el documento, selecciona "Subir archivo" para importarlo al sistema.',
  acceptedFileTypes = ".csv",
  showDownloadButton = true,
  customSuccessMessage,
  customErrorMessage,
}: BulkDataProps) => {
  const renderUploadResult = () => {
    if (!uploadResult) return null;

    if (uploadResult.success) {
      const successMessage = customSuccessMessage
        ? customSuccessMessage(uploadResult)
        : `¡Éxito! ${uploadResult.validCount || 0} registros cargados correctamente`;

      return (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700">{successMessage}</span>
        </div>
      );
    } else {
      const errorMessage = customErrorMessage
        ? customErrorMessage(uploadResult)
        : uploadResult.message || "Error al procesar el archivo";

      return (
        <div className="flex flex-col gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-red-700 font-medium">
              {errorMessage}
            </span>
          </div>
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="ml-7">
              <ul className="text-xs text-red-600 list-disc list-inside">
                {uploadResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {uploadResult.invalidCount && uploadResult.invalidCount > 0 && (
            <span className="text-xs text-red-600 ml-7">
              {uploadResult.invalidCount} registros con errores
            </span>
          )}
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full min-h-full border border-gray-200 rounded-md p-3 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
        {title}
      </h2>

      <div className="flex flex-col items-center justify-center w-full space-y-4">
        {showDownloadButton && urlFile && (
          <>
            <span className="text-sm text-gray-500 text-center">
              Descarga la estructura del archivo para completarlo con los datos
              de los deudores que quieres cargar.
            </span>
            <Button
              className="border-2 border-orange-500 bg-white text-black hover:bg-orange-500 hover:text-white"
              onClick={() => {
                window.open(`${urlFile}`, "_blank");
              }}
            >
              <FileDown className="text-orange-500" /> {downloadText}
            </Button>
          </>
        )}
        <span className="border-t border-gray-200 w-full max-w-2/3" />
        <span className="text-sm text-gray-500 text-center">
          {instructionText}
        </span>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileUpload}
          className="hidden"
        />

        <Button
          className="bg-[#1249C7] text-white hover:bg-[#1249C7]/90 w-60"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <FileUp /> {isUploading ? uploadingText : uploadText}
        </Button>

        {/* {renderUploadResult()} */}
      </div>
    </div>
  );
};

export default BulkData;
