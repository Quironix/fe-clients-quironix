import { Skeleton } from "@/components/ui/skeleton";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { Clock2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { getInvoices } from "../services";
import { usePaymentNettingStore } from "../store";
import ItemListPayment from "./item-list-payment";

function ListAccountReceivableContent() {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { selectedInvoices } = usePaymentNettingStore();
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
    data: invoices,
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ["invoices", debtorId],
    queryFn: async () =>
      await getInvoices({
        accessToken: session?.token as string,
        clientId: profile?.client_id as string,
        debtorId: debtorId as string,
      }),
    enabled: canFetchInvoices,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const mapInvoiceData = (invoice: any) => ({
    id: invoice.id || Math.random(),
    number: invoice.number || "N/A",
    balance: invoice.balance || 0,
    debtor: {
      name: invoice.debtor?.name || "N/A",
      debtor_code: invoice.debtor?.debtor_code ?? invoice.debtor?.code ?? undefined,
    },
    phases: invoice.phases || [],
    due_date: invoice.due_date || "",
    amount: invoice.amount?.toString() || "0",
    type: invoice.type || "INVOICE",
  });

  const invoicesData = useMemo(() => {
    if (
      !invoices?.success ||
      !invoices.data?.data ||
      !Array.isArray(invoices.data.data)
    ) {
      return [];
    }

    console.log("📋 Respuesta cruda de la API:", invoices.data);
    console.log("📄 Array de facturas:", invoices.data.data);

    const mappedData = invoices.data.data.map(mapInvoiceData);
    console.log("🔄 Datos mapeados:", mappedData);

    // Ordenar por morosidad: facturas más atrasadas con montos más altos primero
    const sortedData = mappedData.sort((a, b) => {
      const today = new Date();

      // Calcular días de atraso para cada factura
      const dueDateA = a.due_date ? new Date(a.due_date) : today;
      const dueDateB = b.due_date ? new Date(b.due_date) : today;

      const daysOverdueA = Math.max(
        0,
        Math.floor(
          (today.getTime() - dueDateA.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
      const daysOverdueB = Math.max(
        0,
        Math.floor(
          (today.getTime() - dueDateB.getTime()) / (1000 * 60 * 60 * 24)
        )
      );

      // Si ambas tienen el mismo nivel de atraso, ordenar por monto descendente
      if (daysOverdueA === daysOverdueB) {
        const balanceA = parseFloat(a.balance?.toString() || "0");
        const balanceB = parseFloat(b.balance?.toString() || "0");
        return balanceB - balanceA; // Mayor monto primero
      }

      // Ordenar por días de atraso descendente (más atrasadas primero)
      return daysOverdueB - daysOverdueA;
    });

    console.log("📊 Datos ordenados por morosidad:", sortedData);
    return sortedData;
  }, [invoices]);

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
          <Clock2 className="w-4 h-4 text-orange-400" /> Cuenta por cobrar
        </span>
        <span className="text-xs font-medium bg-gray-100 text-gray-500 rounded-full p-3 w-3 h-3 flex items-center justify-center">
          {invoicesData.length}
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
          {invoicesData.length > 0 ? (
            invoicesData.map((row: any) => {
              // Validar que row no sea null antes de continuar
              if (!row || !row.id) {
                return null;
              }

              // Verificar si este elemento ya está seleccionado
              const isAlreadySelected = selectedInvoices.some(
                (invoice) => invoice.id === row.id
              );

              return (
                <ItemListPayment
                  key={row.id}
                  row={row}
                  type="account-receivable"
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
                ? "No se encontraron facturas para este deudor"
                : "Selecciona un pago para ver las facturas relacionadas"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ListAccountReceivable() {
  return (
    <Suspense fallback={
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold flex items-center gap-2">
            <Clock2 className="w-4 h-4 text-orange-400" /> Cuenta por cobrar
          </span>
        </div>
        <div className="mt-4 space-y-4">
          <Skeleton className="h-[150px] w-full rounded-md" />
          <Skeleton className="h-[150px] w-full rounded-md" />
        </div>
      </div>
    }>
      <ListAccountReceivableContent />
    </Suspense>
  );
}
