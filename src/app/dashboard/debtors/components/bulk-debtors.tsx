import { Button } from "@/components/ui/button";
import { FileDown, FileUp } from "lucide-react";
import React from "react";

const BulkDebtors = () => {
  return (
    <div className="w-full h-full min-h-full border border-gray-200 rounded-md p-3 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
        Subir <span className="text-orange-500">varios deudores</span> por carga
        masiva
      </h2>
      <div className="flex flex-col items-center justify-center w-full space-y-4">
        <span className="text-sm text-gray-500">
          Descarga la estructura del archivo para completarlo con los datos de
          los deudores que quieres cargar.
        </span>
        <Button className="border-2 border-orange-500 bg-white text-orange-500 hover:bg-orange-500 hover:text-white">
          <FileDown /> Descargar estructura
        </Button>
        <span className="text-sm text-gray-500">
          Una vez que hayas completado el documento, selecciona “Subir archivo”
          para importarlo al sistema.
        </span>

        <Button className="bg-[#1249C7] text-white hover:bg-[#1249C7]/90 w-60">
          <FileUp /> Subir archivo
        </Button>
      </div>
    </div>
  );
};

export default BulkDebtors;
