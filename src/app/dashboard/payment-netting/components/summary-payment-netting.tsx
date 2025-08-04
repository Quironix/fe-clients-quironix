import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Clock2, DollarSign, HeartHandshake } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { createConciliation } from "../services";
import { usePaymentNettingStore } from "../store";
import DiferenceAlert from "./diference-alert";
import ItemListPayment from "./item-list-payment";
import PendingAlert from "./pending-alert";
import SuccessAlert from "./success-alert";

const SummaryPaymentNetting = ({ selectedRows }: { selectedRows: any[] }) => {
  const {
    selectedInvoices,
    selectedPayments,
    setTotalPayments,
    setTotalInvoices,
    resetSelected,
  } = usePaymentNettingStore();

  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const queryClient = useQueryClient();

  const totalPayments = useMemo(() => {
    return selectedPayments.reduce((acc, payment) => {
      const amount = Number(payment.balance || 0);
      return parseInt(acc + amount);
    }, 0);
  }, [selectedPayments]);

  const totalInvoices = useMemo(() => {
    return selectedInvoices.reduce((acc, invoice) => {
      const amount = Number(invoice.balance || 0);
      return parseInt(acc + amount);
    }, 0);
  }, [selectedInvoices]);

  // Actualizar el store cuando cambien los totales
  useEffect(() => {
    setTotalPayments(totalPayments);
  }, [totalPayments, setTotalPayments]);

  useEffect(() => {
    setTotalInvoices(totalInvoices);
  }, [totalInvoices, setTotalInvoices]);

  const handleCompensate = async () => {
    console.log("Invoices", selectedInvoices);
    console.log("Payments", selectedPayments);
    debugger;
    try {
      const response = await createConciliation({
        accessToken: session?.token,
        clientId: profile?.client?.id,
        debtorId: selectedRows[0]?.payment?.debtor_id,
        invoices: selectedInvoices.map((invoice) => invoice.id),
        payments: selectedPayments.map((payment) => payment.id),
      });
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error al compensar, por favor intente nuevamente");
      console.error("Error", error);
    } finally {
      resetSelected();

      // Invalidar queries de payments e invoices
      const debtorId = selectedRows[0]?.payment?.debtor_id;
      if (debtorId) {
        queryClient.invalidateQueries({
          queryKey: ["payments", debtorId],
        });
        queryClient.invalidateQueries({
          queryKey: ["invoices", debtorId],
        });
      }
    }
  };

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
      {totalInvoices !== 0 && totalPayments !== 0 && (
        <>
          {totalInvoices === totalPayments && <SuccessAlert />}
          {totalInvoices < totalPayments && <DiferenceAlert />}
          {totalInvoices > totalPayments && <PendingAlert />}
          <div className="flex items-center justify-center gap-3">
            <ArrowRight className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-bold">
              Compensar: $
              {new Intl.NumberFormat("es-CL").format(
                Math.min(totalInvoices, totalPayments)
              )}
            </span>
          </div>
        </>
      )}

      <div className="flex items-center justify-center w-full">
        <Button
          className="flex items-center justify-center gap-2"
          disabled={totalInvoices === 0 || totalPayments === 0}
          onClick={handleCompensate}
        >
          <HeartHandshake className="w-4 h-4 text-white" />
          <span className="text-md font-bold">Compensar manualmente</span>
        </Button>
      </div>
    </div>
  );
};

export default SummaryPaymentNetting;
