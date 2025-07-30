import { Button } from "@/components/ui/button";
import { ArrowRight, Clock2, DollarSign, HeartHandshake } from "lucide-react";
import { usePaymentNettingStore } from "../store";
import DiferenceAlert from "./diference-alert";
import ItemListPayment from "./item-list-payment";
import PendingAlert from "./pending-alert";
import SuccessAlert from "./success-alert";

const SummaryPaymentNetting = () => {
  const { selectedInvoices, selectedPayments } = usePaymentNettingStore();
  return (
    <div className="border border-gray-300 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold flex items-center gap-2 ">
          <HeartHandshake className="w-4 h-4 text-black" /> Resultado de cálculo
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold flex items-center gap-2">
            <Clock2 className="w-4 h-4 text-orange-400" /> Cuenta por cobrar
          </span>
          {selectedInvoices.length === 0 && (
            <span className="border-dashed border-2 border-orange-400 rounded-md p-2 text-center text-sm text-gray-500 h-40 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <Clock2 className="w-6 h-6 text-orange-400" />
                <span>Seleccione una cuenta por cobrar</span>
              </div>
            </span>
          )}
          {selectedInvoices.map((invoice) => (
            <ItemListPayment
              key={invoice.id}
              row={invoice}
              type="account-receivable"
              handleOpenInfo={() => {}}
              handleCloseInfo={() => {}}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-400" /> Créditos a favor
          </span>
          <div className="flex flex-col gap-2">
            {selectedPayments.length === 0 && (
              <span className="border-dashed border-2 border-blue-400 rounded-md p-2 text-center text-sm text-gray-500 h-40 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                  <span>Seleccione un crédito a favor</span>
                </div>
              </span>
            )}
            {selectedPayments.map((payment) => (
              <ItemListPayment
                key={payment.id}
                row={payment}
                type="credit-favor"
                handleOpenInfo={() => {}}
                handleCloseInfo={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
      <SuccessAlert />
      <DiferenceAlert />
      <PendingAlert />
      <div className="flex items-center justify-center gap-3">
        <ArrowRight className="w-6 h-6 text-blue-400" />
        <span className="text-lg font-bold">Compensar: $150.000</span>
      </div>
      <div className="flex items-center justify-center w-full">
        <Button className="flex items-center justify-center gap-2">
          <HeartHandshake className="w-4 h-4 text-white" />
          <span className="text-md font-bold">Compensar manualmente</span>
        </Button>
      </div>
    </div>
  );
};

export default SummaryPaymentNetting;
