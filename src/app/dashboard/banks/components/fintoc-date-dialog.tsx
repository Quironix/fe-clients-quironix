"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, X } from "lucide-react";
import { useState } from "react";

interface FintocDateDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: (date?: string) => void;
  isLoading?: boolean;
}

const FintocDateDialog = ({
  isOpen,
  setIsOpen,
  onConfirm,
  isLoading = false,
}: FintocDateDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedDate(undefined);
    }
    setIsOpen(open);
  };

  const handleConfirm = () => {
    onConfirm(
      selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md gap-0">
        <div className="absolute right-4 top-4">
          <AlertDialogCancel className="p-0 m-0 h-auto w-auto border-none hover:bg-transparent">
            <X className="h-6 w-6 text-gray-500" />
          </AlertDialogCancel>
        </div>
        <div className="flex flex-col justify-center py-10">
          <AlertDialogHeader className="flex">
            <AlertDialogTitle className="font-extrabold">
              {"¿Desde cuándo traer los movimientos?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Selecciona una fecha para importar movimientos anteriores
              (máximo 30 días) o continúa sin seleccionar para usar la fecha
              actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={es}
            disabled={{
              before: subDays(new Date(), 30),
              after: new Date(),
            }}
            initialFocus
          />
        </div>

        <AlertDialogFooter className="flex gap-3 mt-6 border-t border-orange-500 pt-4">
          <AlertDialogCancel onClick={() => setSelectedDate(undefined)}>
            Cancelar
          </AlertDialogCancel>
          <Button
            className="bg-[#1249C7] hover:bg-[#1249C7]/90 h-10 rounded-sm"
            disabled={isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Continuar...
              </>
            ) : (
              "Continuar"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FintocDateDialog;
