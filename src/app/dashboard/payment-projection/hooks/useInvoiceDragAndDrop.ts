import React, { useCallback, useState } from "react";
import { changeInvoices } from "../services";
import {
  DragAndDropState,
  Invoice,
  WeekColumn,
} from "../types/invoice-projection";
import { WeeklyProjection } from "../services";

interface DebtorWithProjections {
  weekly_projections?: WeeklyProjection[];
}

export const useInvoiceDragAndDrop = (
  weeks: WeekColumn[],
  setWeeks: React.Dispatch<React.SetStateAction<WeekColumn[]>>,
  accessToken?: string,
  clientId?: string,
  debtorCode?: string,
  debtor?: DebtorWithProjections,
  onDropSuccess?: () => void
) => {
  const [dragState, setDragState] = useState<DragAndDropState>({
    draggedInvoice: null,
    draggedOverWeek: null,
    isDragging: false,
  });
  const [loadingWeeks, setLoadingWeeks] = useState<Set<number>>(new Set());

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
    async (e: React.DragEvent, targetWeek: number) => {
      e.preventDefault();

      if (!dragState.draggedInvoice) return;

      const sourceWeek = dragState.draggedInvoice.week;
      const targetWeekData = debtor?.weekly_projections?.find(
        (wp) => wp.week_number === targetWeek
      );

      if (targetWeekData && accessToken && clientId && debtorCode) {
        const targetDate = targetWeekData.week_end;
        const moveData = [
          {
            targetDate: targetDate,
            invoices: [dragState.draggedInvoice.id],
          },
        ];

        const previousWeeks = weeks;
        setLoadingWeeks(new Set([sourceWeek, targetWeek]));

        try {
          const response = await changeInvoices(
            accessToken,
            clientId,
            debtorCode,
            moveData
          );

          setLoadingWeeks(new Set());

          if (!response.success) {
            setWeeks(previousWeeks);
            setDragState({
              draggedInvoice: null,
              draggedOverWeek: null,
              isDragging: false,
            });
            return;
          }

          onDropSuccess?.();
        } catch (error) {
          setLoadingWeeks(new Set());
          setWeeks(previousWeeks);
          setDragState({
            draggedInvoice: null,
            draggedOverWeek: null,
            isDragging: false,
          });
          return;
        }
      }

      setWeeks((prevWeeks: WeekColumn[]) => {
        const newWeeks = [...prevWeeks];

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

        const targetWeekColumn = newWeeks.find((w) => w.week === targetWeek);
        if (targetWeekColumn) {
          const updatedInvoice = {
            ...dragState.draggedInvoice,
            week: targetWeek,
          };
          targetWeekColumn.invoices.push(updatedInvoice as Invoice);
          targetWeekColumn.count = targetWeekColumn.invoices.length;
          targetWeekColumn.estimated = targetWeekColumn.invoices.reduce(
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
    [
      dragState.draggedInvoice,
      weeks,
      setWeeks,
      accessToken,
      clientId,
      debtorCode,
      debtor,
      onDropSuccess,
    ]
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
    loadingWeeks,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
};
