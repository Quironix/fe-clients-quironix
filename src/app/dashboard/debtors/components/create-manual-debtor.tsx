"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

const CreateManualDebtor = () => {
  const router = useRouter();
  return (
    <div className="w-full h-full min-h-full border border-gray-200 rounded-md p-3 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
        Crear <span className="text-orange-500">deudor</span> de forma{" "}
        <span className="text-orange-500">manual</span>
      </h2>
      <div className="flex flex-col items-center justify-center w-full">
        <span className="text-sm text-gray-500">
          Completa el formulario con los datos del deudor que quieres agregar.
          Esta opción es ideal si vas a cargar un único registro y no cuestas
          con un archivo para importar.
        </span>
        <Button
          className="mt-4 px-10 bg-[#1249C7] text-white hover:bg-[#1249C7]/90"
          onClick={() => router.push("/dashboard/debtors/create")}
        >
          Carga manual
        </Button>
      </div>
    </div>
  );
};

export default CreateManualDebtor;
