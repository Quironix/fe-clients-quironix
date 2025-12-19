"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  DollarSign,
  History,
  Loader2,
  User2,
  FileText,
  TrendingUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import DialogForm from "../../../components/dialog-form";
import { getInvoiceHistory } from "../services";
import { DTE } from "../types";

interface InvoiceHistoryModalProps {
  invoice: DTE;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function InvoiceHistoryModal({
  invoice,
  trigger,
  open,
  onOpenChange,
}: InvoiceHistoryModalProps) {
  const { session, profile } = useProfileContext();

  const invoiceId = invoice?.id;

  const {
    data: invoiceHistory,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invoiceHistory", invoiceId],
    queryFn: () =>
      getInvoiceHistory({
        accessToken: session?.token,
        clientId: profile?.client_id,
        invoiceId: invoiceId,
      }),
    enabled: open && !!invoiceId && !!session?.token && !!profile?.client_id,
    staleTime: 5 * 60 * 1000,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando historial de la factura...</span>
        </div>
      );
    }

    if (error || !invoiceHistory?.success) {
      return (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="font-medium text-sm text-red-700 mb-2">
            Error al cargar el historial
          </h3>
          <p className="text-sm text-red-600">
            No se pudo obtener el historial de la factura.
          </p>
        </div>
      );
    }

    const historyData = invoiceHistory?.data;

    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-blue-700">Información de la factura</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-xs text-blue-600">Número de documento</span>
                <span className="text-sm font-medium">{invoice.number}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-xs text-blue-600">Monto</span>
                <span className="text-sm font-medium">{formatNumber(invoice.amount)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-xs text-blue-600">Balance</span>
                <span className="text-sm font-medium">{formatNumber(invoice.balance)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-xs text-blue-600">Fecha de emisión</span>
                <span className="text-sm font-medium">
                  {invoice.issue_date ? format(parseISO(invoice.issue_date), "dd/MM/yyyy") : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {invoice.debtor && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-bold text-gray-700 mb-3">
              Información del deudor
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User2 className="w-8 h-8 text-gray-600" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600">Nombre</span>
                  <span className="text-sm font-medium">{invoice.debtor.name || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
            <div className="text-lg font-bold">
              {historyData?.summary?.total_applications || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Pagos Aplicados</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
            <div className="text-lg font-bold">
              $
              {new Intl.NumberFormat("es-CL").format(
                historyData?.summary?.total_amount_applied || 0
              )}
            </div>
            <div className="text-xs mt-1 text-gray-500">Monto aplicado</div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem
            value="historial"
            className="bg-white border rounded-lg"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-gray-600" />
                <div className="text-left">
                  <h3 className="font-bold text-gray-700">
                    Historial de Aplicaciones
                  </h3>
                  <p className="text-xs text-gray-600">
                    Detalle de todos los pagos aplicados a esta factura
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              <div className="max-h-80 overflow-y-auto">
                {historyData?.reconciliation_history?.length > 0 ? (
                  historyData.reconciliation_history.map((event: any) => (
                    <div
                      key={event.id}
                      className="p-4 border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {event.type === "INVOICE_CREATED"
                                ? "Factura creada"
                                : "Aplicación de pago"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(parseISO(event.timestamp), "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            {event.description}
                          </div>

                          {event.payment && (
                            <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                              <div className="font-medium">
                                Pago {event.payment.id ? `#${event.payment.id.slice(-8)}` : ""}
                              </div>
                              <div className="text-gray-600">
                                {event.payment.deposit_at && (
                                  <>
                                    Fecha:{" "}
                                    {format(parseISO(event.payment.deposit_at), "dd/MM/yyyy")}{" "}
                                  </>
                                )}
                                • Estado:{" "}
                                <span className="text-green-600 font-medium">
                                  {event.payment.status === "PAID"
                                    ? "Pagado"
                                    : event.payment.status === "PENDING"
                                      ? "Pendiente"
                                      : "Reversado"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="font-bold text-blue-600">
                            $
                            {new Intl.NumberFormat("es-CL").format(
                              event.amount
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Balance: $
                            {new Intl.NumberFormat("es-CL").format(
                              event.balance
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No hay historial de aplicaciones para esta factura
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  };

  return (
    <DialogForm
      title="Historial de la Factura"
      description="Información completa con historial de aplicaciones de pagos"
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger || <span style={{ display: 'none' }} />}
    >
      {renderContent()}
    </DialogForm>
  );
}
