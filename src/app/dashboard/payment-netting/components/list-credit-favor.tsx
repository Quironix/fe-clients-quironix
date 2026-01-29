import { Skeleton } from "@/components/ui/skeleton";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { getPayments } from "../services";
import { usePaymentNettingStore } from "../store";
import ItemListPayment from "./item-list-payment";

function ListCreditFavorContent() {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { selectedPayments } = usePaymentNettingStore();
  const searchParams = useSearchParams();
  const debtorId = searchParams.get("debtorId");

  const canFetchInvoices = useMemo(() => {
    return !!(
      session?.token &&
      profile?.client_id &&
      debtorId
    );
  }, [session?.token, profile?.client_id, debtorId]);

  const {
    data: payments,
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ["payments", debtorId],
    queryFn: async () =>
      await getPayments({
        accessToken: session?.token as string,
        clientId: profile?.client_id as string,
        debtorId: debtorId as string,
      }),
    enabled: canFetchInvoices,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const mapInvoiceData = (invoice: any) => ({
    id: invoice.id || `fallback-${invoice.payment_number || Date.now()}`,
    number: invoice.payment_number || "N/A",
    balance: invoice.balance || 0,
    debtor: invoice.debtor || { name: "N/A" },
    phases: invoice.phases || [],
    due_date: invoice.due_at || "",
    received_at: invoice.received_at || "",
    amount: invoice.amount?.toString() || "0",
    type: invoice.type || "PAYMENT",
  });

  // Función para contar propiedades válidas (no null, undefined, vacías)
  const countValidProperties = (obj: any) => {
    if (!obj) return 0;
    return Object.values(obj).filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const paymentsData = useMemo(() => {
    if (
      !payments?.success ||
      !payments.data?.data ||
      !Array.isArray(payments.data.data)
    ) {
      return [];
    }

    const mappedData = payments.data.data.map(mapInvoiceData);
    return mappedData;
  }, [payments]);

  // Funciones dummy
  const handleOpenInfo = (row: any) => {
    console.log("Mostrando información de:", row);
  };

  const handleCloseInfo = () => {
    console.log("Cerrando información");
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold flex items-center gap-2 ">
          <DollarSign className="w-4 h-4 text-blue-400" /> Créditos a favor
        </span>
        <span className="text-xs font-medium bg-gray-100 text-gray-500 rounded-full p-3 w-3 h-3 flex items-center justify-center">
          {paymentsData.length}
        </span>
      </div>
      {isLoadingInvoices && canFetchInvoices && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[150px] w-full rounded-md" />
          <Skeleton className="h-[150px] w-full rounded-md" />
          <Skeleton className="h-[150px] w-full rounded-md" />
        </div>
      )}

      {invoicesError && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded text-sm text-red-700">
          ❌ Error al cargar facturas: {invoicesError.message}
        </div>
      )}

      {!isLoadingInvoices && (
        <div className="mt-4 space-y-4 pr-4 pt-2 max-h-[32rem] min-h-[32rem] overflow-y-auto">
          {paymentsData.length > 0 ? (
            paymentsData.map((row: any) => {
              // Validar que row no sea null antes de renderizar
              if (!row || !row.id) {
                return null;
              }

              // Verificar si este elemento ya está seleccionado
              const isAlreadySelected = selectedPayments.some(
                (payment) => payment.id === row.id
              );

              return (
                <ItemListPayment
                  key={row.id}
                  row={row}
                  type="credit-favor"
                  handleOpenInfo={handleOpenInfo}
                  handleCloseInfo={handleCloseInfo}
                  isSelected={isAlreadySelected}
                  isDisabled={false}
                />
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">
              {canFetchInvoices
                ? "No se encontraron pagos a favor para este deudor"
                : "Selecciona un pago para ver los pagos a favor relacionados"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ListCreditFavor() {
  return (
    <Suspense fallback={
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-400" /> Créditos a favor
          </span>
        </div>
        <div className="mt-4 space-y-4">
          <Skeleton className="h-[150px] w-full rounded-md" />
          <Skeleton className="h-[150px] w-full rounded-md" />
        </div>
      </div>
    }>
      <ListCreditFavorContent />
    </Suspense>
  );
}
