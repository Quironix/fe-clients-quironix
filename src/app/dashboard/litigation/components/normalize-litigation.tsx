"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DialogForm from "../../components/dialog-form";
import NormalizeForm from "./normalize-form";

const NormalizeLitigation = ({ onOpenForm }: { onOpenForm: () => void }) => {
  const [openForm, setOpenForm] = useState(false);
  const router = useRouter();
  return (
    <div className="w-full h-full min-h-full border border-gray-200 rounded-md p-3 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
        <span className="text-orange-500">Normalizar</span> litigio
      </h2>
      <div className="flex flex-col items-center justify-center w-full">
        <span className="text-sm text-gray-500 mb-5">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maxime,
          ipsa. Numquam non ab accusantium tenetur nobis aperiam quaerat quos
          natus beatae unde! Quo vitae sapiente ad voluptatum, porro adipisci
          ab.
        </span>
        {/* <Button
          className="mt-4 px-10 bg-[#1249C7] text-white hover:bg-[#1249C7]/90"
          onClick={onOpenForm}
        >
          Normalizar
        </Button> */}

        <DialogForm
          trigger={
            <Button className="bg-blue-700 text-white w-64">Normalizar</Button>
          }
          title="Normailizar litigio"
          description="Completa los campos obligatorios para normalizar un litigio."
        >
          <NormalizeForm />
        </DialogForm>
      </div>
    </div>
  );
};

export default NormalizeLitigation;
