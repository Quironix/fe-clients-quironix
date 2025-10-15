"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DialogConfirm from "../../components/dialog-confirm";
import { Popover } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          "flex items-center px-5 py-3 last:border-b-0 hover:bg-gray-100 transition-colors bg-white shadow-lg mb-2 cursor-pointer",
          highlighted && `border-l-4 ${borderColor} bg-gray-50/50`,
          !highlighted && ` opacity-50`,
        )}
      >
        {/* Código del deudor - ancho fijo */}
        <div className="flex flex-col w-[100px] flex-shrink-0">
          <span
            className={cn(
              "text-base font-bold",
              highlighted ? "text-gray-900" : "text-gray-500",
            )}
          >
            {code}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-gray-500 truncate">{name}</span>
            </TooltipTrigger>
            <TooltipContent>{name}</TooltipContent>
          </Tooltip>
        </div>

        {/* Separador */}
        <div className="h-10 w-px bg-gray-200 mx-4 flex-shrink-0" />

        {/* Incumplimientos - ancho fijo centrado */}
        <div className="flex flex-col items-center w-[120px] flex-shrink-0">
          <span className="text-2xl font-bold text-red-500">{incidents}</span>
          <span className="text-[10px] text-gray-500 -mt-1">
            {incidentsLabel}
          </span>
        </div>

        {/* Separador */}
        <div className="h-10 w-px bg-gray-200 mx-4 flex-shrink-0" />

        {/* Deuda vencida - ancho fijo centrado */}
        <div className="flex flex-col items-center w-[140px] flex-shrink-0">
          <span className="text-base font-semibold text-gray-900">{debt}</span>
          <span className="text-[10px] text-gray-500 -mt-1">{debtLabel}</span>
        </div>

        {/* Espacio flexible para empujar el status a la derecha */}
        <div className="flex-1" />

        {/* Status - alineado a la derecha */}
        <div className="flex-shrink-0">
          <span
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap",
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
