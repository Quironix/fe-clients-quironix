import { CheckCircle } from "lucide-react";
import { usePaymentNettingStore } from "../store";

const SuccessAlert = () => {
  const { totalPayments, totalInvoices } = usePaymentNettingStore();
  return (
    <div className="border border-green-400 bg-green-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="w-6 h-6" />
        <span className="text-lg font-bold">Conciliado</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-5">
          <span className="text-sm font-semibold">Cargos:</span>
          <span className="text-sm font-bold">
            <span className="text-black">
              ${new Intl.NumberFormat("es-CL").format(totalInvoices)}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="text-sm font-semibold">Abonos:</span>
          <span className="text-sm font-bold">
            <span className="text-black">
              -${new Intl.NumberFormat("es-CL").format(totalPayments)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SuccessAlert;
