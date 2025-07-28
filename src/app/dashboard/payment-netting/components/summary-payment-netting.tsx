import { Button } from "@/components/ui/button";
import { ArrowRight, Clock2, DollarSign, HeartHandshake } from "lucide-react";
import DiferenceAlert from "./diference-alert";
import ItemListPayment from "./item-list-payment";
import PendingAlert from "./pending-alert";
import SuccessAlert from "./success-alert";

const SummaryPaymentNetting = () => {
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
          <ItemListPayment
            key={1}
            row={{
              id: 1,
              number: "123456778",
              debtor: { name: "Empresa ABC S.A." },
              phases: [1],
              due_date: "2024-03-15T00:00:00Z",
              amount: "250000",
              type: "Factura",
            }}
            type="account-receivable"
            handleOpenInfo={() => {}}
            handleCloseInfo={() => {}}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-400" /> Créditos a favor
          </span>
          <div className="flex flex-col gap-2">
            <ItemListPayment
              key={2}
              row={{
                id: 6,
                number: "654321789",
                debtor: { name: "Financiera MNO SpA" },
                phases: [2],
                due_date: "2024-04-18T00:00:00Z",
                amount: "125800",
                type: "Pagaré",
              }}
              type="credit-favor"
              handleOpenInfo={() => {}}
              handleCloseInfo={() => {}}
            />
            <ItemListPayment
              key={4}
              row={{
                id: 7,
                number: "987654321",
                debtor: { name: "Financiera MNO SpA" },
                phases: [2],
                due_date: "2024-04-18T00:00:00Z",
                amount: "125800",
                type: "Pagaré",
              }}
              type="credit-favor"
              handleOpenInfo={() => {}}
              handleCloseInfo={() => {}}
            />
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
