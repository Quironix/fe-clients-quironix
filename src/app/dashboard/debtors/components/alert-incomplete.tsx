import { FileX } from "lucide-react";
import React from "react";

const AlertIncomplete = () => {
  return (
    <div className="bg-[#FFDDDD] text-black flex justify-start items-center gap-2 p-2 rounded-md border-2 border-[#D72D0F]">
      <div className="flex justify-center items-center px-1">
        <FileX className="w-5 h-5 text-red-500" />
      </div>
      <div className="flex flex-col">
        <span className="text-black text-sm font-bold">
          La carga masiva se ha realizado de manera incompleta
        </span>
        <span className="text-black text-sm">
          Revisa el detalle de los errores detectados, corrígelo en la plantilla
          descargada y vuelve a subirlo
        </span>
      </div>
    </div>
  );
};

export default AlertIncomplete;
