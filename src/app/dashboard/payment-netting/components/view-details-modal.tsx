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
  Barcode,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Eye,
  History,
  Keyboard,
  Loader2,
  Mail,
  Phone,
  TrendingUp,
  User2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { format, parseISO } from "date-fns";
import DialogForm from "../../components/dialog-form";
import { getPaymentHistory } from "../services";
import IconDescription from "./icon-description";

interface ViewDetailsModalProps {
  row: any;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ViewDetailsModal({
  row,
  trigger,
  open,
  onOpenChange,
}: ViewDetailsModalProps) {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();

  const paymentId = row?.payment?.id;

  const {
    data: paymentHistory,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["paymentHistory", paymentId],
    queryFn: () =>
      getPaymentHistory({
        accessToken: session?.token,
        clientId: profile?.client_id,
        paymentId: paymentId,
      }),
    enabled: open && !!paymentId && !!session?.token && !!profile?.client_id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Eye className="h-4 w-4 mr-2" />
      Ver detalles
    </Button>
  );

  const renderContent = () => {
    if (!paymentId) {
      // Mostrar información estructurada del row cuando no hay payment.id
      return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Header de la Transacción */}
          <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-orange-700">
                Información de la transacción
              </h3>
              {/* <div className="text-xs text-orange-600">
                ID: {row?.id?.slice(-8) || "N/A"}
              </div> */}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <IconDescription
                  icon={<DollarSign />}
                  description="Monto"
                  value={formatNumber(row?.amount)}
                />
              </div>
              <div>
                <IconDescription
                  icon={<DollarSign />}
                  description="Saldo"
                  value={formatNumber(row?.balance)}
                />
              </div>
              <div>
                <IconDescription
                  icon={<History />}
                  description="Estado"
                  value={
                    row?.status === "PAID"
                      ? "Pagado"
                      : row?.status === "PENDING"
                        ? "Pendiente"
                        : "Reversado"
                  }
                />
              </div>
              <div>
                <IconDescription
                  icon={<Calendar />}
                  description="Fecha"
                  value={row?.date || "N/A"}
                />
              </div>
              <div>
                <IconDescription
                  icon={<Barcode />}
                  description="Código Deudor"
                  value={row?.debtor?.debtor_code || "N/A"}
                />
              </div>
              <div>
                <IconDescription
                  icon={<Building2 />}
                  description="Banco"
                  value={row?.bank_information?.bank || "N/A"}
                />
              </div>
              <div>
                <IconDescription
                  icon={<CreditCard />}
                  description="Número de cuenta"
                  value={row?.account_number || "N/A"}
                />
              </div>
            </div>
          </div>

          {/* Descripción y Comentarios */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-bold text-gray-700 mb-3">
              Detalles adicionales
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-600">Descripción</span>
                <div className="text-sm">
                  {row?.description || "Sin descripción"}
                </div>
              </div>
              {row?.comment && (
                <div>
                  <span className="text-xs text-gray-600">Comentario</span>
                  <div className="text-sm">{row.comment}</div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Pago (si existe parcialmente) */}
          {row?.payment && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-700 mb-3">
                Información del pago
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {row.payment.debtor && (
                  <>
                    <div>
                      <IconDescription
                        icon={<User2 />}
                        description="Deudor"
                        value={row.payment.debtor.name}
                      />
                    </div>
                    <div>
                      <IconDescription
                        icon={<Barcode />}
                        description="Cópdigo deudor"
                        value={row.payment.debtor.debtor_code}
                      />
                    </div>
                    <div>
                      <span className="text-xs text-green-600">RUT</span>
                      <div className="text-sm font-medium">
                        {row.payment.debtor.dni_id || "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-green-600">Teléfono</span>
                      <div className="text-sm font-medium">
                        {row.payment.debtor.phone || "N/A"}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando historial del pago...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="font-medium text-sm text-red-700 mb-2">
            Error al cargar el historial
          </h3>
          <p className="text-sm text-red-600">
            No se pudo obtener el historial del pago. Mostrando datos básicos.
          </p>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96 whitespace-pre-wrap mt-2">
            {JSON.stringify(row, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header del Pago */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-blue-700">Información del pago</h3>
            {/* <div className="text-xs text-blue-600">
              ID: {paymentHistory?.data?.payment?.id?.slice(-8)}
            </div> */}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <IconDescription
                icon={<DollarSign />}
                description="Monto del pago"
                value={formatNumber(paymentHistory?.data?.payment?.amount)}
              />
            </div>
            <div>
              <IconDescription
                icon={<TrendingUp />}
                description="Balance actual"
                value={formatNumber(
                  paymentHistory?.data?.summary?.current_balance
                )}
              />
            </div>
            <div>
              <IconDescription
                icon={<Keyboard />}
                description="Tipo de ingreso"
                value={
                  paymentHistory?.data?.payment?.ingress_type === "AUTOMATIC"
                    ? "Automático"
                    : "Manual"
                }
              />
            </div>
            <div>
              <IconDescription
                icon={<Calendar />}
                description="Fecha de depósito"
                value={
                  paymentHistory?.data?.payment?.deposit_at
                    ? format(parseISO(paymentHistory.data.payment.deposit_at), "dd/MM/yyyy")
                    : "N/A"
                }
              />
            </div>
          </div>
        </div>

        {/* Información del Deudor */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-bold text-gray-700 mb-3">
            Información del deudor
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <IconDescription
                icon={<User2 />}
                description="Nombre"
                value={paymentHistory?.data?.debtor?.name}
              />
            </div>
            <div>
              <IconDescription
                icon={<Barcode />}
                description="Código deudor"
                value={paymentHistory?.data?.debtor?.debtor_code}
              />
            </div>
            <div>
              <IconDescription
                icon={<Mail />}
                description="Email"
                value={paymentHistory?.data?.debtor?.email || "N/A"}
              />
            </div>
            <div>
              <IconDescription
                icon={<Phone />}
                description="Teléfono"
                value={paymentHistory?.data?.debtor?.phone || "N/A"}
              />
            </div>
          </div>
        </div>

        {/* Resumen de Aplicaciones */}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
            <div className="text-lg font-bold">
              {paymentHistory?.data?.summary?.total_applications || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Facturas Aplicadas</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
            <div className="text-lg font-bold">
              $
              {new Intl.NumberFormat("es-CL").format(
                paymentHistory?.data?.summary?.total_amount_applied || 0
              )}
            </div>
            <div className="text-xs mt-1 text-gray-500">Monto aplicado</div>
          </div>
          {/* <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
            <div className="text-lg font-bold">
              {paymentHistory?.data?.summary?.reconciliation_type
                ? "Automático"
                : "Manual"}
            </div>
            <div className="text-xs text-gray-600 mt-1">Tipo aplicado</div>
          </div> */}
        </div>

        {/* Historial de Aplicaciones */}
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
                    Detalle de todas las aplicaciones realizadas a facturas
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              <div className="max-h-80 overflow-y-auto">
                {paymentHistory?.data?.reconciliation_history?.map(
                  (event: any) => (
                    <div
                      key={event.id}
                      className="p-4 border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {event.type === "PAYMENT_CREATED"
                                ? "Pago creado"
                                : "Aplicación de factura"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(parseISO(event.timestamp), "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            {event.description}
                          </div>

                          {event.invoice && (
                            <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                              <div className="font-medium">
                                Factura #{event.invoice.number}
                              </div>
                              <div className="text-gray-600">
                                Fecha:{" "}
                                {format(parseISO(event.invoice.issue_date), "dd/MM/yyyy")}{" "}
                                • Estado:{" "}
                                <span className="text-green-600 font-medium">
                                  {event.invoice.status === "PAID"
                                    ? "Pagado"
                                    : event.invoice.status === "PENDING"
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
                  )
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Información del Movimiento Bancario */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h3 className="font-bold text-orange-700 mb-3">
            Movimiento Bancario
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-orange-600">Banco</span>
              <div className="text-sm font-medium">
                {paymentHistory?.data?.bank_movement?.bank_information?.bank}
              </div>
            </div>
            <div>
              <span className="text-xs text-orange-600">Cuenta</span>
              <div className="text-sm font-medium">
                {
                  paymentHistory?.data?.bank_movement?.bank_information
                    ?.account_number
                }
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-orange-600">Descripción</span>
              <div className="text-sm font-medium">
                {paymentHistory?.data?.bank_movement?.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DialogForm
      title={paymentId ? "Detalle del movimiento" : "Detalle de la transacción"}
      description={
        paymentId
          ? "Información completa con historial del pago"
          : "Información completa de la transacción seleccionada"
      }
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger || defaultTrigger}
    >
      {renderContent()}
    </DialogForm>
  );
}
