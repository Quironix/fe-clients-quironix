import { Skeleton } from "@/components/ui/skeleton";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { usePaymentNetting } from "../hooks/usePaymentNetting";
import { getPayments } from "../services";
import { usePaymentNettingStore } from "../store";
import ItemListPayment from "./item-list-payment";

const ListCreditFavor = () => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { selectedPayments } = usePaymentNettingStore();
  const { getSelectedRows, isHydrated } = usePaymentNetting(
    session?.token,
    profile?.client_id,
    false
  );
  const selectedPaymentsList = useMemo(() => {
    if (!isHydrated) return [];
    return getSelectedRows();
  }, [getSelectedRows, isHydrated]);

  // Validar que todos los parámetros requeridos estén disponibles
  const canFetchInvoices = useMemo(() => {
    return !!(
      session?.token &&
      profile?.client_id &&
      selectedPaymentsList[0]?.payment?.debtor?.id
    );
  }, [session?.token, profile?.client_id, selectedPaymentsList]);

  const {
    data: payments,
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ["payments", selectedPaymentsList[0]?.payment?.debtor?.id],
    queryFn: async () =>
      await getPayments({
        accessToken: session?.token as string,
        clientId: profile?.client_id as string,
        debtorId: selectedPaymentsList[0]?.payment?.debtor?.id as string,
      }),
    enabled: canFetchInvoices, // Solo ejecutar si todos los parámetros están disponibles
    retry: 1, // Reintentar solo una vez en caso de error
    refetchOnWindowFocus: false, // No refetch al enfocar la ventana
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

    // Procesar pagos seleccionados
    selectedPaymentsList.forEach((payment) => {
      // Validar que payment y payment.payment no sean null/undefined
      if (!payment || !payment.payment) {
        console.warn("⚠️ Payment o payment.payment es null/undefined:", payment);
        return;
      }

      const selectedPaymentData = {
        id: payment.id,
        number: payment.payment.payment_number || "N/A",
        balance: payment.payment.balance || 0,
        debtor: payment.payment.debtor,
        phases: payment.payment.phases,
        due_date: payment.payment.due_at,
        amount: payment.payment.amount,
        type: payment.payment.document_type,
        created_at: payment.payment.created_at,
      };

      // Buscar si ya existe un elemento con el mismo ID
      const existingIndex = mappedData.findIndex(
        (item) => item?.id === payment?.payment?.id
      );

      if (existingIndex !== -1) {
        // Si existe, comparar cuál tiene más datos
        const existingItem = mappedData[existingIndex];
        const existingDataCount = countValidProperties(existingItem);
        const selectedDataCount = countValidProperties(selectedPaymentData);

        console.log(`🔍 Comparando duplicados:
          - Existente (${existingDataCount} propiedades): ${JSON.stringify(existingItem)}
          - Seleccionado (${selectedDataCount} propiedades): ${JSON.stringify(selectedPaymentData)}`);

        // Usar el que tenga más datos válidos
        // if (selectedDataCount > existingDataCount) {
        //   mappedData[existingIndex] = selectedPaymentData;
        //   console.log(`✅ Reemplazando con elemento seleccionado (más datos)`);
        // } else {
        //   console.log(`✅ Manteniendo elemento existente (más datos)`);
        // }
      } else {
        // Si no existe, agregarlo
        // mappedData.push(selectedPaymentData);
        console.log(
          `➕ Agregando nuevo elemento: ${JSON.stringify(selectedPaymentData)}`
        );
      }
    });

    return mappedData;
  }, [payments, selectedPaymentsList]);

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
};

export default ListCreditFavor;
