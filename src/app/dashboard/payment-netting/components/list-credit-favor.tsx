import { Skeleton } from "@/components/ui/skeleton";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { usePaymentNetting } from "../hooks/usePaymentNetting";
import { getPayments } from "../services";
import ItemListPayment from "./item-list-payment";

const ListCreditFavor = () => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { getSelectedRows, isHydrated } = usePaymentNetting(
    session?.token,
    profile?.client_id,
    false
  );
  const selectedPayments = useMemo(() => {
    if (!isHydrated) return [];
    return getSelectedRows();
  }, [getSelectedRows, isHydrated]);

  // Validar que todos los parámetros requeridos estén disponibles
  const canFetchInvoices = useMemo(() => {
    return !!(
      session?.token &&
      profile?.client_id &&
      selectedPayments[0]?.payment?.debtor?.id
    );
  }, [session?.token, profile?.client_id, selectedPayments]);

  const {
    data: payments,
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ["payments", selectedPayments[0]?.payment?.debtor?.id],
    queryFn: async () =>
      await getPayments({
        accessToken: session?.token as string,
        clientId: profile?.client_id as string,
        debtorId: selectedPayments[0]?.payment?.debtor?.id as string,
      }),
    enabled: canFetchInvoices, // Solo ejecutar si todos los parámetros están disponibles
    retry: 1, // Reintentar solo una vez en caso de error
    refetchOnWindowFocus: false, // No refetch al enfocar la ventana
  });

  const mapInvoiceData = (invoice: any) => ({
    id: invoice.id || Math.random(),
    number: invoice.payment_number || "N/A",
    debtor: invoice.debtor || { name: "N/A" },
    phases: invoice.phases || [],
    due_date: invoice.due_at || "",
    amount: invoice.amount?.toString() || "0",
    type: invoice.type || "PAYMENT",
  });

  const paymentsData = useMemo(() => {
    if (
      !payments?.success ||
      !payments.data?.data ||
      !Array.isArray(payments.data.data)
    ) {
      return [];
    }

    console.log("📋 Respuesta cruda de la API:", payments.data);
    console.log("📄 Array de facturas:", payments.data.data);

    debugger;
    const mappedData = payments.data.data.map(mapInvoiceData);
    console.log("🔄 Datos mapeados:", mappedData);

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
        <div className="mt-4 space-y-4">
          {paymentsData.length > 0 ? (
            paymentsData.map((row: any) => {
              console.log("🎯 Renderizando item:", row);
              return (
                <ItemListPayment
                  key={row.id}
                  row={row}
                  type="credit-favor"
                  handleOpenInfo={handleOpenInfo}
                  handleCloseInfo={handleCloseInfo}
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
};

export default ListCreditFavor;
