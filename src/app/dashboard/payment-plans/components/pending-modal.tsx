import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, getPendingInstallments } from "@/lib/utils";
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
  IdCard,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import DataTableNormal from "../../components/data-table-normal";
import LoaderTable from "../../components/loader-table";
import { DEBTOR_PAYMENT_METHODS, PAYMENT_FREQUENCY } from "../../data";
import IconDescription from "../../payment-netting/components/icon-description";
import { PaymentPlanResponse } from "../types";
import { ColumnsDetail } from "./columns-detail";

const PendingModal = ({
  detailPaymentPlan,
}: {
  detailPaymentPlan: PaymentPlanResponse;
}) => {
  const [debtorExpanded, setDebtorExpanded] = useState(true);
  const [invoiceExpanded, setInvoiceExpanded] = useState(false);
  const [paymentPlanExpanded, setPaymentPlanExpanded] = useState(false);

  // Calcular cuotas pendientes una sola vez
  const pendingInstallments = useMemo(() => {
    return getPendingInstallments(
      detailPaymentPlan.paymentStartDate,
      detailPaymentPlan.paymentEndDate,
      detailPaymentPlan.numberOfInstallments,
      detailPaymentPlan.paymentFrequency
    );
  }, [
    detailPaymentPlan.paymentStartDate,
    detailPaymentPlan.paymentEndDate,
    detailPaymentPlan.numberOfInstallments,
    detailPaymentPlan.paymentFrequency,
  ]);
  return (
    <>
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setDebtorExpanded(!debtorExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100/50 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Información del deudor</CardTitle>
            </div>
            {debtorExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CardHeader>

        {debtorExpanded && (
          <CardContent className="space-y-6">
            <div className="bg-blue-100/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2 text-blue-800">
                Datos del deudor
              </h3>
              {detailPaymentPlan?.debtor ? (
                <div className="space-y-5 grid grid-cols-2">
                  <IconDescription
                    icon={<IdCard className="w-6 h-6 text-blue-600" />}
                    description="Documento"
                    value={detailPaymentPlan.debtor.name}
                  />
                  <IconDescription
                    icon={<User className="w-6 h-6 text-blue-600" />}
                    description="Contacto"
                    value={detailPaymentPlan.debtor.contacts[0].name}
                  />
                  <IconDescription
                    icon={<Mail className="w-6 h-6 text-blue-600" />}
                    description="Email"
                    value={detailPaymentPlan.debtor.email}
                  />
                  <IconDescription
                    icon={<Phone className="w-6 h-6 text-blue-600" />}
                    description="Teléfono"
                    value={detailPaymentPlan.debtor.phone}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No has seleccionado ningún deudor
                </p>
              )}
            </div>
            <div className="border border-gray-200 p-4 rounded-lg">
              <span className="font-bold text-sm">Facturas seleccionadas</span>
              <DataTableNormal
                columns={ColumnsDetail()}
                data={detailPaymentPlan.invoiceIds.map((x) => ({
                  id: x,
                }))}
                pageSize={5}
                pageSizeOptions={[5, 10, 15, 20, 25, 30, 40, 50]}
                emptyMessage="No se encontraron facturas"
                loadingComponent={<LoaderTable cols={6} />}
              />
            </div>
          </CardContent>
        )}
      </Card>

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
                  {pendingInstallments.slice(0, 4).map((installment, index) => (
                    <div key={index} className="text-xs">
                      {installment}
                    </div>
                  ))}
                  {pendingInstallments.length > 4 && (
                    <div className="text-xs text-gray-500">
                      +{pendingInstallments.length - 4} cuotas más...
                    </div>
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
                value={detailPaymentPlan.planStartDate as unknown as string}
              />
              <IconDescription
                icon={<CalendarCheck className="w-6 h-6 text-gray-400" />}
                description="Término de pago"
                value={detailPaymentPlan.paymentEndDate as unknown as string}
              />
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );
};

export default PendingModal;
