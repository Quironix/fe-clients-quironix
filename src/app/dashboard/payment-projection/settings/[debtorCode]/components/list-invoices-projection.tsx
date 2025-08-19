"use client";

import { INVOICE_TYPES } from "@/app/dashboard/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useInvoiceDragAndDrop } from "../../../hooks/useInvoiceDragAndDrop";
import { WeekColumn } from "../../../types/invoice-projection";

interface ListInvoicesProjectionProps {
  debtor?: any;
  periodMonth?: string;
}

const ListInvoicesProjection = ({
  debtor,
  periodMonth,
}: ListInvoicesProjectionProps) => {
  // Función para transformar los datos del debtor al formato esperado
  const transformDebtorData = (debtorData: any): WeekColumn[] => {
    if (!debtorData?.weekly_projections) {
      return [];
    }

    return debtorData.weekly_projections.map((weekProjection: any) => {
      // Extraer todas las facturas de todos los días de la semana
      const allInvoices: any[] = [];
      weekProjection.daily_projections.forEach((dailyProjection: any) => {
        if (
          dailyProjection.invoices_data &&
          dailyProjection.invoices_data.length > 0
        ) {
          dailyProjection.invoices_data.forEach((invoiceData: any) => {
            allInvoices.push({
              id: invoiceData.invoice_id,
              invoice_number: invoiceData.invoice_number, // Usar los últimos 8 caracteres como número
              phase: 1, // TODO: CAMBIAR
              document_type: invoiceData.document_type,
              dueDate: new Date(invoiceData.due_date).toLocaleDateString(
                "es-ES"
              ),
              documentBalance: invoiceData.estimated_amount,
              week: weekProjection.week_number,
            });
          });
        }
      });

      // Formatear el rango de fechas
      const startDate = new Date(weekProjection.week_start);
      const endDate = new Date(weekProjection.week_end);
      const dateRange = `${startDate.getDate().toString().padStart(2, "0")}/${(startDate.getMonth() + 1).toString().padStart(2, "0")} - ${endDate.getDate().toString().padStart(2, "0")}/${(endDate.getMonth() + 1).toString().padStart(2, "0")}`;

      return {
        week: weekProjection.week_number,
        title: `Semana ${weekProjection.week_number}`,
        dateRange: dateRange,
        estimated: weekProjection.total_weekly_estimated || 0,
        collected: weekProjection.total_weekly_collected || 0,
        count: allInvoices.length,
        invoices: allInvoices,
      };
    });
  };

  const [weeks, setWeeks] = useState<WeekColumn[]>(() => {
    return transformDebtorData(debtor);
  });

  // Actualizar los datos cuando cambie el debtor
  useEffect(() => {
    if (debtor) {
      setWeeks(transformDebtorData(debtor));
    }
  }, [debtor]);

  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useInvoiceDragAndDrop(weeks, setWeeks);

  return (
    <div className="space-y-6">
      {/* Columnas de semanas con scroll */}
      <div className="grid grid-cols-5 gap-4">
        {weeks.map((week) => (
          <div
            key={week.week}
            className={`bg-white rounded-lg border-2 transition-colors ${
              dragState.draggedOverWeek === week.week
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200"
            }`}
            onDragOver={(e) => handleDragOver(e, week.week)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, week.week)}
          >
            {/* Header de la columna */}
            <div className="p-2 bg-blue-100 rounded-t-lg space-y-2  border-b-2 border-blue-700">
              <div className="flex items-center justify-between mb-0 pb-1">
                <span className=" text-sm font-semibold text-gray-900">
                  {week.title}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-white text-gray-800 rounded-full"
                >
                  {week.count}
                </Badge>
              </div>
              <div className="text-xs text-gray-600">{week.dateRange}</div>
              <div className="space-y-1 text-xs bg-white p-3 rounded-md">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimado:</span>
                  <span className="font-medium text-blue-600">
                    {formatNumber(week.estimated)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recaudado:</span>
                  <span className="font-medium text-blue-600">
                    {formatNumber(week.collected)}
                  </span>
                </div>
              </div>
            </div>

            {/* Área de scroll para las facturas */}
            <div className="p-2 max-h-96 overflow-y-auto">
              {week.invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Sin facturas
                </div>
              ) : (
                <div className="space-y-2">
                  {week.invoices.map((invoice) => (
                    <Card
                      key={invoice.id}
                      className={`cursor-move hover:shadow-md transition-shadow p-2 ${
                        dragState.draggedInvoice?.id === invoice.id
                          ? "opacity-50"
                          : ""
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, invoice)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardContent className="p-1">
                        <div className="flex items-start justify-end mb-2">
                          <span className="text-[10px] truncate max-w-[80px] bg-pink-200 text-pink-600 rounded-full px-2 font-bold">
                            {
                              INVOICE_TYPES.find((t) =>
                                t.types.find(
                                  (t) => t.value === invoice.document_type
                                )
                              )?.types.find(
                                (t) => t.value === invoice.document_type
                              )?.label
                            }
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="font-medium">
                            N° {invoice.invoice_number}
                          </div>
                          <div className="text-gray-600">
                            Fase: {invoice.phase}
                          </div>
                          <div className="text-gray-600">
                            Vencimiento: {invoice.dueDate}
                          </div>
                          <div className="bg-blue-50 p-2 rounded text-center flex flex-col items-start justify-between">
                            <span className="text-blue-800 font-medium">
                              Saldo Documento:
                            </span>
                            <span className="text-blue-800 font-bold">
                              {formatNumber(invoice.documentBalance)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListInvoicesProjection;
