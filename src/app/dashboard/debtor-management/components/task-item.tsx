"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DialogConfirm from "../../components/dialog-confirm";

interface TaskItemProps {
  debtorId: string; // UUID del deudor
  code: string; // debtor_code para mostrar
  name: string;
  incidents: number;
  incidentsLabel: string;
  debt: string;
  debtLabel: string;
  status: string;
  statusBgColor: string;
  statusTextColor: string;
  highlighted?: boolean;
  borderColor?: string;
}

export const TaskItem = ({
  debtorId,
  code,
  name,
  incidents,
  incidentsLabel,
  debt,
  debtLabel,
  status,
  statusBgColor,
  statusTextColor,
  highlighted = false,
  borderColor = "border-gray-200",
}: TaskItemProps) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navigateToDebtor = () => {
    router.push(`/dashboard/debtor-management/${debtorId}`);
  };

  const handleClick = () => {
    if (highlighted) {
      // Si está destacado, navegar directamente
      navigateToDebtor();
    } else {
      // Si no está destacado, mostrar el diálogo de confirmación
      setIsDialogOpen(true);
    }
  };

  const handleCancel = () => {
    // Cuando confirman "Continuar", navegar al deudor
    navigateToDebtor();
    setIsDialogOpen(false);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center justify-between px-5 py-2 last:border-b-0 hover:bg-gray-100 transition-colors bg-white shadow-lg mb-2 cursor-pointer",
          highlighted && `border-l-4 ${borderColor} bg-gray-50/50`,
          !highlighted && ` opacity-50`,
        )}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex flex-col min-w-[100px]">
            <span
              className={cn(
                "text-sm font-semibold",
                highlighted ? "text-gray-900" : "text-gray-500",
              )}
            >
              {code}
            </span>
            <span className="text-xs text-gray-600">{name}</span>
          </div>

          <div className="h-10 w-px bg-gray-200" />

          <div className="flex flex-col min-w-[80px]">
            <span className="text-lg font-bold text-red-500">{incidents}</span>
            <span className="text-[10px] text-gray-600 -mt-1">
              {incidentsLabel}
            </span>
          </div>

          <div className="h-10 w-px bg-gray-200" />

          <div className="flex flex-col min-w-[100px]">
            <span className="text-sm font-semibold text-gray-900">{debt}</span>
            <span className="text-[10px] text-gray-600 -mt-1">{debtLabel}</span>
          </div>
        </div>

        <div className="ml-4">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap",
              statusBgColor,
              statusTextColor,
            )}
          >
            {status}
          </span>
        </div>
      </div>

      <DialogConfirm
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        title="Estás tomando una tarea fuera de orden"
        description="Tu lista tiene un orden definido para ayudarte a avanzar de forma más rápida y organizada.  La primera tarea es la prioritaria y siempre debe tomarse primero. ¿Quieres continuar igualmente?"
        confirmButtonText="Volver"
        cancelButtonText="Continuar"
        onCancel={handleCancel}
        type="warning"
      />
    </>
  );
};
