"use client";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import DialogForm from "../../components/dialog-form";
import DisputeForm from "./dispute-form";

interface CreateLitigationProps {
  onRefetch?: () => void;
}

const CreateLitigation = ({ onRefetch }: CreateLitigationProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full h-full min-h-full border border-gray-200 rounded-md p-3 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
        <span className="text-orange-500">Crear</span> litigio
      </h2>
      <div className="flex flex-col items-center justify-center w-full">
        <span className="text-sm text-gray-500 mb-5">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maxime,
          ipsa. Numquam non ab accusantium tenetur nobis aperiam quaerat quos
          natus beatae unde! Quo vitae sapiente ad voluptatum, porro adipisci
          ab.
        </span>
        <DialogForm
          trigger={
            <Button
              className="bg-blue-700 text-white w-64"
              onClick={() => setOpen(true)}
            >
              Crear
            </Button>
          }
          title="Ingreso de litigio"
          description="Completa los campos obligatorios para ingresar un litigio."
          open={open}
          onOpenChange={setOpen}
        >
          <DisputeForm
            handleClose={() => setOpen(false)}
            onRefetch={onRefetch}
          />
        </DialogForm>
      </div>
    </div>
  );
};

export default CreateLitigation;
