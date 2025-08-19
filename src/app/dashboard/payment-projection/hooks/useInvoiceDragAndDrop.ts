import { useCallback, useState } from "react";
import {
  DragAndDropState,
  Invoice,
  WeekColumn,
} from "../types/invoice-projection";

export const useInvoiceDragAndDrop = (
  weeks: WeekColumn[],
  setWeeks: (weeks: WeekColumn[]) => void
) => {
  const [dragState, setDragState] = useState<DragAndDropState>({
    draggedInvoice: null,
    draggedOverWeek: null,
    isDragging: false,
  });

  const handleDragStart = useCallback(
    (e: React.DragEvent, invoice: Invoice) => {
      setDragState((prev) => ({
        ...prev,
        draggedInvoice: invoice,
        isDragging: true,
      }));
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent, week: number) => {
    e.preventDefault();
    setDragState((prev) => ({
      ...prev,
      draggedOverWeek: week,
    }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragState((prev) => ({
      ...prev,
      draggedOverWeek: null,
    }));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetWeek: number) => {
      e.preventDefault();

      if (!dragState.draggedInvoice) return;

      setWeeks((prevWeeks) => {
        const newWeeks = [...prevWeeks];

        // Remover la factura de la semana original
        const sourceWeek = newWeeks.find(
          (w) => w.week === dragState.draggedInvoice!.week
        );
        if (sourceWeek) {
          sourceWeek.invoices = sourceWeek.invoices.filter(
            (inv) => inv.id !== dragState.draggedInvoice!.id
          );
          sourceWeek.count = sourceWeek.invoices.length;
          sourceWeek.estimated = sourceWeek.invoices.reduce(
            (sum, inv) => sum + inv.documentBalance,
            0
          );
        }

        // Agregar la factura a la semana objetivo
        const targetWeekData = newWeeks.find((w) => w.week === targetWeek);
        if (targetWeekData) {
          const updatedInvoice = {
            ...dragState.draggedInvoice,
            week: targetWeek,
          };
          targetWeekData.invoices.push(updatedInvoice);
          targetWeekData.count = targetWeekData.invoices.length;
          targetWeekData.estimated = targetWeekData.invoices.reduce(
            (sum, inv) => sum + inv.documentBalance,
            0
          );
        }

        return newWeeks;
      });

      setDragState({
        draggedInvoice: null,
        draggedOverWeek: null,
        isDragging: false,
      });
    },
    [dragState.draggedInvoice, setWeeks]
  );

  const handleDragEnd = useCallback(() => {
    setDragState({
      draggedInvoice: null,
      draggedOverWeek: null,
      isDragging: false,
    });
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
};
