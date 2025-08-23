import { ArrowUpCircle } from "lucide-react";
import { usePaymentNettingStore } from "../store";
import CommentAlert from "./comment-alert";

const DiferenceAlert = () => {
  const { totalInvoices, totalPayments } = usePaymentNettingStore();
  return (
    <div className="border border-blue-400 bg-blue-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <ArrowUpCircle className="w-6 h-6" />
        <span className="text-lg font-bold">Diferencia: saldo a favor</span>
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
              ${new Intl.NumberFormat("es-CL").format(totalPayments)}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-5 border-t border-blue-400 pt-2">
          <span className="text-sm font-semibold">Diferencia:</span>
          <span className="text-sm font-bold">
            <span className="text-black">
              $
              {new Intl.NumberFormat("es-CL").format(
                Math.abs(totalPayments - totalInvoices)
              )}
            </span>
          </span>
        </div>
        <CommentAlert
          comment={
            <span>
              Al realizar esta compensación estás generando un{" "}
              <span className="font-bold">
                saldo a favor en la cuenta del deudor
              </span>
              .
            </span>
          }
        />
      </div>
    </div>
  );
};

export default DiferenceAlert;
