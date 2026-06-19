"use client";

import { INVOICE_TYPES } from "@/app/dashboard/data";
import { parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useProfileContext } from "@/context/ProfileContext";
import { formatNumber } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useInvoiceDragAndDrop } from "../../../hooks/useInvoiceDragAndDrop";
import { WeekColumn, Invoice } from "../../../types/invoice-projection";
import { DailyProjection, InvoiceData, WeeklyProjection } from "../../../services";

interface DebtorProjection {
  debtor_id?: string;
  debtor_code?: string;
  weekly_projections?: WeeklyProjection[];
}

interface ListInvoicesProjectionProps {
  debtor?: DebtorProjection;
  periodMonth?: string;
  handleRefetch?: () => void;
  onDropSuccess?: () => void;
}

const ListInvoicesProjection = ({
  debtor,
  periodMonth,
  onDropSuccess,
}: ListInvoicesProjectionProps) => {
  const t = useTranslations("paymentProjection.settings");
  const tRoot = useTranslations("paymentProjection");
  const { data: session } = useSession();
  const { profile } = useProfileContext();

  const transformDebtorData = (debtorData: DebtorProjection | undefined): WeekColumn[] => {
    if (!debtorData?.weekly_projections) {
      return [];
    }

    return debtorData.weekly_projections.map((weekProjection) => {
      const allInvoices: Invoice[] = [];
      weekProjection.daily_projections.forEach((dailyProjection: DailyProjection) => {
        if (
          dailyProjection.invoices_data &&
          dailyProjection.invoices_data.length > 0
        ) {
          dailyProjection.invoices_data.forEach((invoiceData: InvoiceData) => {
            const currentPhase =
              invoiceData.phases.find((p) => p.is_current)?.phase ??
              invoiceData.phases[0]?.phase ??
              1;
            allInvoices.push({
              id: invoiceData.invoice_id,
              invoice_number: invoiceData.invoice_number,
              phase: String(currentPhase),
              invoiceNumber: invoiceData.invoice_number,
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

      const startDate = parseISO(weekProjection.week_start);
      const endDate = parseISO(weekProjection.week_end);
      const dateRange = `${startDate.getDate().toString().padStart(2, "0")}/${(startDate.getMonth() + 1).toString().padStart(2, "0")} - ${endDate.getDate().toString().padStart(2, "0")}/${(endDate.getMonth() + 1).toString().padStart(2, "0")}`;

      return {
        week: weekProjection.week_number,
        title: weekProjection.week_number,
        dateRange: dateRange,
        estimated: weekProjection.total_weekly_estimated || 0,
        collected: weekProjection.total_weekly_collected || 0,
        count: allInvoices.length,
        invoices: allInvoices,
        startDate,
        endDate,
      };
    });
  };

  const [weeks, setWeeks] = useState<WeekColumn[]>(() => {
    return transformDebtorData(debtor);
  });

  useEffect(() => {
    if (debtor) {
      setWeeks(transformDebtorData(debtor));
    }
  }, [debtor]);

  const {
    dragState,
    loadingWeeks,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useInvoiceDragAndDrop(
    weeks,
    setWeeks,
    session?.token as string,
    profile?.client_id as string,
    debtor?.debtor_id,
    debtor,
    onDropSuccess
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
        {weeks
          .sort((a, b) => a.week - b.week)
          .map((week) => (
            <div
              key={`week-${week.week}-${week.dateRange}`}
              className={`relative bg-white rounded-lg border-2 transition-colors ${
                dragState.draggedOverWeek === week.week
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200"
              }`}
              onDragOver={(e) => handleDragOver(e, week.week)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, week.week)}
            >
              {loadingWeeks.has(week.week) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[2px]">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
                </div>
              )}
              <div className="p-2 bg-blue-100 rounded-t-lg space-y-2  border-b-2 border-blue-700">
                <div className="flex items-center justify-between mb-0 pb-1">
                  <span className=" text-sm font-semibold text-gray-900">
                    {tRoot("week", { number: week.title })}
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
                    <span className="text-gray-600">{t("estimated")}</span>
                    <span className="font-medium text-blue-600">
                      {formatNumber(week.estimated)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("collected")}</span>
                    <span className="font-medium text-blue-600">
                      {formatNumber(week.collected)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2 max-h-96 overflow-y-auto">
                {week.invoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {t("noInvoices")}
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
                              {t("invoiceNumber", { number: invoice.invoice_number })}
                            </div>
                            <div className="text-gray-600">
                              {t("phase", { phase: invoice.phase })}
                            </div>
                            <div className="text-gray-600">
                              {t("dueDate", { date: invoice.dueDate })}
                            </div>
                            <div className="bg-blue-50 p-2 rounded text-center flex flex-col items-start justify-between">
                              <span className="text-blue-800 font-medium">
                                {t("documentBalance")}
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
