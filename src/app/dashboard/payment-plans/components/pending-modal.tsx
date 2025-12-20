import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatNumber, getPendingInstallments } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calculator,
  Calendar,
  CalendarCheck,
  CalendarClock,
  ChartBar,
  ChevronDown,
  ChevronUp,
  Coins,
  DollarSign,
  Info,
  MessageSquare,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DEBTOR_PAYMENT_METHODS, PAYMENT_FREQUENCY } from "../../data";
import IconDescription from "../../payment-netting/components/icon-description";
import { PaymentPlanResponse } from "../types";
import CardUser from "./card-user";

const PendingModal = ({
  detailPaymentPlan,
}: {
  detailPaymentPlan: PaymentPlanResponse | null;
}) => {
  const [debtorExpanded, setDebtorExpanded] = useState(false);
  const [paymentPlanExpanded, setPaymentPlanExpanded] = useState(true);
  const [objectedExpanded, setObjectedExpanded] = useState(
    detailPaymentPlan?.status === "OBJECTED" || false
  );

  // Calcular cuotas pendientes una sola vez (antes de cualquier return condicional)
  const pendingInstallments = useMemo(() => {
    if (!detailPaymentPlan) return [];

    return getPendingInstallments(
      detailPaymentPlan.paymentStartDate,
      detailPaymentPlan.paymentEndDate,
      detailPaymentPlan.numberOfInstallments,
      detailPaymentPlan.paymentFrequency
    );
  }, [
    detailPaymentPlan?.paymentStartDate,
    detailPaymentPlan?.paymentEndDate,
    detailPaymentPlan?.numberOfInstallments,
    detailPaymentPlan?.paymentFrequency,
  ]);

  // Early return if detailPaymentPlan is null
  if (!detailPaymentPlan) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-gray-500">
          No se pudo cargar la información del plan de pago
        </span>
      </div>
    );
  }
  return (
    <>
      {/* Status badge section */}

      {detailPaymentPlan.status === "REJECTED" && (
        <div className="flex justify-start items-center gap-2 bg-red-100 border border-red-300 p-4 rounded-lg">
          <MessageSquare className="w-6 h-6 text-red-300 shrink-0" />
          <span className="text-sm text-gray-500 flex flex-col gap-0">
            <span className="text-black text-xs">Comentario supervisor</span>
            <span className="text-md text-gray-500">
              Motivo del rechazo: {detailPaymentPlan.rejectionComment}
            </span>
          </span>
        </div>
      )}
      {detailPaymentPlan.status === "PENDING" && (
        <div className="flex justify-start items-center gap-2 bg-blue-100 border border-blue-300 p-4 rounded-lg">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="text-sm text-gray-500 flex flex-col gap-0">
            <span className="text-md font-bold text-black">
              La solicitud se encuentra en revisión
            </span>
          </span>
        </div>
      )}
      <CardUser
        detail={detailPaymentPlan}
        setDebtorExpanded={setDebtorExpanded}
        debtorExpanded={debtorExpanded}
      />
      {detailPaymentPlan.status !== "OBJECTED" && (
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setPaymentPlanExpanded(!paymentPlanExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100/50 rounded-full flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">
                  Configuración del plan de pago
                </CardTitle>
              </div>
              {paymentPlanExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </CardHeader>

          {paymentPlanExpanded && (
            <CardContent className="space-y-6">
              <div className="bg-blue-100/30 p-4 rounded-lg grid grid-cols-3 items-center">
                <div className="flex flex-col gap-0">
                  <span className="text-sm text-black">Colocación total</span>
                  <span className=" text-blue-700 text-2xl font-bold">
                    {formatNumber(detailPaymentPlan.totalPlanAmount)}
                  </span>
                </div>
                <div className="flex flex-col gap-0">
                  <span className="text-sm text-black">Pago contado</span>
                  <span className=" text-blue-700 text-2xl font-bold">
                    {formatNumber(detailPaymentPlan.initialPayment)}
                  </span>
                </div>
                <div className="flex flex-col gap-0">
                  <span className="text-xs text-black font-bold">
                    Próximos vencimientos
                  </span>
                  <div className="text-sm text-black space-y-1">
                    {pendingInstallments
                      .slice(0, 4)
                      .map((installment, index) => (
                        <div key={index} className="text-xs">
                          {installment}
                        </div>
                      ))}
                    {pendingInstallments.length > 4 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                            +{pendingInstallments.length - 4} cuotas más...
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              Todas las cuotas pendientes
                            </DialogTitle>
                          </DialogHeader>
                          <div className="max-h-[350px] overflow-y-auto space-y-2">
                            {pendingInstallments.map((installment, index) => (
                              <div
                                key={index}
                                className="text-xs text-gray-700 p-2 bg-gray-50 rounded"
                              >
                                {installment}
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {pendingInstallments.length === 0 && (
                      <div className="text-xs text-green-600">
                        No hay cuotas pendientes
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <IconDescription
                  icon={<Coins className="w-6 h-6 text-gray-400" />}
                  description="Nº de cuotas"
                  value={
                    detailPaymentPlan.numberOfInstallments as unknown as string
                  }
                />
                <IconDescription
                  icon={<Coins className="w-6 h-6 text-gray-400" />}
                  description="Valor por cuotas"
                  value={formatNumber(
                    detailPaymentPlan.installmentAmount as unknown as number
                  )}
                />
                <IconDescription
                  icon={<ChartBar className="w-6 h-6 text-gray-400" />}
                  description="Tasa de interés anual (%)"
                  value={
                    detailPaymentPlan.annualInterestRate as unknown as string
                  }
                />
                <IconDescription
                  icon={<DollarSign className="w-6 h-6 text-gray-400" />}
                  description="Forma de pago"
                  value={
                    DEBTOR_PAYMENT_METHODS.find(
                      (x) => x.value === detailPaymentPlan.paymentMethod
                    )?.label
                  }
                />

                <IconDescription
                  icon={<Calendar className="w-6 h-6 text-gray-400" />}
                  description="Inicio de pago"
                  value={
                    detailPaymentPlan.planStartDate
                      ? format(detailPaymentPlan.planStartDate, "dd-MM-yyyy", {
                          locale: es,
                        })
                      : "-"
                  }
                />
                <IconDescription
                  icon={<CalendarCheck className="w-6 h-6 text-gray-400" />}
                  description="Término de pago"
                  value={
                    detailPaymentPlan.paymentEndDate
                      ? format(detailPaymentPlan.paymentEndDate, "dd-MM-yyyy", {
                          locale: es,
                        })
                      : "-"
                  }
                />
                <IconDescription
                  icon={<CalendarClock className="w-6 h-6 text-gray-400" />}
                  description="Frecuencia de pago"
                  value={
                    PAYMENT_FREQUENCY.find(
                      (x) => x.code === detailPaymentPlan.paymentFrequency
                    )?.label
                  }
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {detailPaymentPlan.status === "OBJECTED" && (
        <div className="space-y-4">
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setPaymentPlanExpanded(!paymentPlanExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100/50 rounded-full flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">
                    Configuración del plan de pago
                  </CardTitle>
                </div>
                {paymentPlanExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </CardHeader>

            {paymentPlanExpanded && (
              <CardContent className="space-y-6">
                <div className="bg-red-100/30 p-4 rounded-lg grid grid-cols-3 items-center">
                  <div className="flex flex-col gap-0">
                    <span className="text-sm text-black">Colocación total</span>
                    <span className=" text-red-700 text-2xl font-bold">
                      {formatNumber(detailPaymentPlan.totalPlanAmount)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0">
                    <span className="text-sm text-black">Pago contado</span>
                    <span className=" text-red-700 text-2xl font-bold">
                      {formatNumber(detailPaymentPlan.initialPayment)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0">
                    <span className="text-xs text-black font-bold">
                      Próximos vencimientos
                    </span>
                    <div className="text-sm text-black space-y-1">
                      {pendingInstallments
                        .slice(0, 4)
                        .map((installment, index) => (
                          <div key={index} className="text-xs">
                            {installment}
                          </div>
                        ))}
                      {pendingInstallments.length > 4 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                              +{pendingInstallments.length - 4} cuotas más...
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Todas las cuotas pendientes
                              </DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[350px] overflow-y-auto space-y-2">
                              {pendingInstallments.map((installment, index) => (
                                <div
                                  key={index}
                                  className="text-xs text-gray-700 p-2 bg-gray-50 rounded"
                                >
                                  {installment}
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {pendingInstallments.length === 0 && (
                        <div className="text-xs text-green-600">
                          No hay cuotas pendientes
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <IconDescription
                    icon={<Coins className="w-6 h-6 text-gray-400" />}
                    description="Nº de cuotas"
                    value={
                      detailPaymentPlan.numberOfInstallments as unknown as string
                    }
                  />
                  <IconDescription
                    icon={<ChartBar className="w-6 h-6 text-gray-400" />}
                    description="Tasa de interés anual (%)"
                    value={
                      detailPaymentPlan.annualInterestRate as unknown as string
                    }
                  />
                  <IconDescription
                    icon={<DollarSign className="w-6 h-6 text-gray-400" />}
                    description="Forma de pago"
                    value={
                      DEBTOR_PAYMENT_METHODS.find(
                        (x) => x.value === detailPaymentPlan.paymentMethod
                      )?.label
                    }
                  />
                  <IconDescription
                    icon={<CalendarClock className="w-6 h-6 text-gray-400" />}
                    description="Frecuencia de pago"
                    value={
                      PAYMENT_FREQUENCY.find(
                        (x) => x.code === detailPaymentPlan.paymentFrequency
                      )?.label
                    }
                  />
                  <IconDescription
                    icon={<Calendar className="w-6 h-6 text-gray-400" />}
                    description="Inicio de pago"
                    value={
                      detailPaymentPlan.planStartDate
                        ? format(
                            detailPaymentPlan.planStartDate,
                            "dd-MM-yyyy",
                            {
                              locale: es,
                            }
                          )
                        : "-"
                    }
                  />
                  <IconDescription
                    icon={<CalendarCheck className="w-6 h-6 text-gray-400" />}
                    description="Término de pago"
                    value={
                      detailPaymentPlan.paymentEndDate
                        ? format(
                            detailPaymentPlan.paymentEndDate,
                            "dd-MM-yyyy",
                            {
                              locale: es,
                            }
                          )
                        : "-"
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setObjectedExpanded(!objectedExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100/50 rounded-full flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">
                    Observaciones del plan de pago
                  </CardTitle>
                </div>
                {objectedExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </CardHeader>

            {objectedExpanded && (
              <CardContent className="space-y-6">
                <div className="bg-purple-300/30 p-4 rounded-lg grid grid-cols-3 items-center">
                  <div className="flex flex-col gap-0">
                    <span className="text-sm text-black">Colocación total</span>
                    <span className=" text-purple-500 text-2xl font-bold">
                      {formatNumber(detailPaymentPlan.totalPlanAmount)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0">
                    <span className="text-sm text-black">Pago contado</span>
                    <span className=" text-purple-500 text-2xl font-bold">
                      {formatNumber(detailPaymentPlan.initialPayment)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0">
                    <span className="text-xs text-black font-bold">
                      Próximos vencimientos
                    </span>
                    <div className="text-sm text-black space-y-1">
                      {pendingInstallments
                        .slice(0, 4)
                        .map((installment, index) => (
                          <div key={index} className="text-xs">
                            {installment}
                          </div>
                        ))}
                      {pendingInstallments.length > 4 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                              +{pendingInstallments.length - 4} cuotas más...
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Todas las cuotas pendientes
                              </DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[350px] overflow-y-auto space-y-2">
                              {pendingInstallments.map((installment, index) => (
                                <div
                                  key={index}
                                  className="text-xs text-gray-700 p-2 bg-gray-50 rounded"
                                >
                                  {installment}
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {pendingInstallments.length === 0 && (
                        <div className="text-xs text-green-600">
                          No hay cuotas pendientes
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <IconDescription
                    icon={<Coins className="w-6 h-6 text-gray-400" />}
                    description="Nº de cuotas"
                    value={
                      detailPaymentPlan.numberOfInstallments as unknown as string
                    }
                  />
                  <IconDescription
                    icon={<ChartBar className="w-6 h-6 text-gray-400" />}
                    description="Tasa de interés anual (%)"
                    value={
                      detailPaymentPlan.annualInterestRate as unknown as string
                    }
                  />
                  <IconDescription
                    icon={<DollarSign className="w-6 h-6 text-gray-400" />}
                    description="Forma de pago"
                    value={
                      DEBTOR_PAYMENT_METHODS.find(
                        (x) => x.value === detailPaymentPlan.paymentMethod
                      )?.label
                    }
                  />
                  <IconDescription
                    icon={<CalendarClock className="w-6 h-6 text-gray-400" />}
                    description="Frecuencia de pago"
                    value={
                      PAYMENT_FREQUENCY.find(
                        (x) => x.code === detailPaymentPlan.paymentFrequency
                      )?.label
                    }
                  />
                  <IconDescription
                    icon={<Calendar className="w-6 h-6 text-gray-400" />}
                    description="Inicio de pago"
                    value={
                      detailPaymentPlan.planStartDate
                        ? format(
                            detailPaymentPlan.planStartDate,
                            "dd-MM-yyyy",
                            {
                              locale: es,
                            }
                          )
                        : "-"
                    }
                  />
                  <IconDescription
                    icon={<CalendarCheck className="w-6 h-6 text-gray-400" />}
                    description="Término de pago"
                    value={
                      detailPaymentPlan.paymentEndDate
                        ? format(
                            detailPaymentPlan.paymentEndDate,
                            "dd-MM-yyyy",
                            {
                              locale: es,
                            }
                          )
                        : "-"
                    }
                  />
                </div>
                {detailPaymentPlan.debtConcept && (
                  <div className="flex justify-start items-center gap-2 bg-purple-300/30 border border-purple-300 p-4 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-purple-500 shrink-0" />
                    <span className="text-sm text-gray-500 flex flex-col gap-0">
                      <span className="text-black text-xs">
                        Comentario supervisor
                      </span>
                      <span className="text-md text-gray-700">
                        {detailPaymentPlan.debtConcept}
                      </span>
                    </span>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {detailPaymentPlan.debtConcept && (
        <div className="flex justify-start items-center gap-2 bg-amber-100 border border-amber-300 p-4 rounded-lg">
          <MessageSquare className="w-6 h-6 text-amber-300 shrink-0" />
          <span className="text-sm text-gray-500 flex flex-col gap-0">
            <span className="text-black text-xs">Comentario</span>
            <span className="text-md text-gray-500">
              {detailPaymentPlan.debtConcept}
            </span>
          </span>
        </div>
      )}
    </>
  );
};

export default PendingModal;
