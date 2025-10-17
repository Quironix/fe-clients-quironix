"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import DataTableNormal from "../../components/data-table-normal";
import LoaderTable from "../../components/loader-table";
import DocumentTypeBadge from "../../payment-netting/components/document-type-badge";
import { getInvoices } from "../../payment-netting/services";
import { Invoice as StoreInvoice, usePaymentPlansStore } from "../store";

// Usar la interfaz del store
type Invoice = StoreInvoice;
interface DebtorInvoicesTableProps {
  debtorId?: string;
  onInvoicesSelected?: (invoices: Invoice[]) => void;
}

// Crear las columnas dentro del componente para tener acceso a las funciones
const createColumns = (
  selectedInvoices: Invoice[],
  handleInvoiceSelect: (invoice: Invoice, isSelected: boolean) => void,
  allInvoices: Invoice[],
  handleSelectAll: (checked: boolean) => void
): ColumnDef<Invoice>[] => [
  {
    id: "select",
    header: ({ table }) => {
      const allSelected =
        allInvoices.length > 0 &&
        selectedInvoices.length === allInvoices.length;
      const someSelected =
        selectedInvoices.length > 0 &&
        selectedInvoices.length < allInvoices.length;

      return (
        <Checkbox
          checked={allSelected}
          ref={(el) => {
            if (el && el.querySelector && el.querySelector("input")) {
              const input = el.querySelector("input") as HTMLInputElement;
              if (input) input.indeterminate = someSelected;
            }
          }}
          onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
          aria-label="Seleccionar todas las facturas"
        />
      );
    },
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <Checkbox
          checked={selectedInvoices.some((inv) => inv.id === invoice.id)}
          onCheckedChange={(checked) =>
            handleInvoiceSelect(invoice, checked as boolean)
          }
          aria-label="Seleccionar factura"
        />
      );
    },
    size: 32,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "number",
    header: "N° documento",
    cell: ({ row }) => {
      const number = row.getValue("number") as string;
      return (
        <div className="font-bold">{number || row.original.id || "-"}</div>
      );
    },
  },
  {
    accessorKey: "document_type",
    header: "Tipo de documento",
    cell: ({ row }) => {
      const type = row.original.type;
      return <DocumentTypeBadge type={type} />;
    },
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const amount = row.getValue("amount") ?? row.original.amount;
      if (amount == null) return <div>-</div>;

      // Convertir string a número si es necesario
      const numericAmount =
        typeof amount === "string" ? parseFloat(amount) : (amount as number);

      if (isNaN(numericAmount)) return <div>-</div>;

      return (
        <div className="font-medium">
          {new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
          }).format(numericAmount)}
        </div>
      );
    },
  },
  {
    accessorKey: "due_date",
    header: "Vencimiento",
    cell: ({ row }) => {
      const dueDate =
        (row.getValue("due_date") as string) || row.original.due_date;
      if (!dueDate) return <div>-</div>;
      try {
        return <div>{format(new Date(dueDate), "dd-MM-yyyy")}</div>;
      } catch {
        return <div>{dueDate}</div>;
      }
    },
  },
  {
    accessorKey: "phases",
    header: "Fase",
    cell: ({ row }) => {
      const phasesArray = row.original.phases;
      const lastPhase =
        Array.isArray(phasesArray) && phasesArray.length > 0
          ? phasesArray[phasesArray.length - 1]
          : null;
      if (!lastPhase) {
        return <div>-</div>;
      }
      // lastPhase es un objeto Phase
      return <div>{(lastPhase as any).phase ?? 0}</div>;
    },
  },
];

export default function DebtorInvoicesTable({
  debtorId,
  onInvoicesSelected,
}: DebtorInvoicesTableProps) {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const [isExpanded, setIsExpanded] = useState(true);

  // Usar el store para manejar las facturas seleccionadas
  const {
    selectedInvoices,
    setSelectedInvoices,
    clearSelectedInvoices,
    toggleInvoiceSelection,
    selectAllInvoices,
  } = usePaymentPlansStore();

  const handleInvoiceSelect = (invoice: Invoice, isSelected: boolean) => {
    // Usar la función del store para alternar la selección
    toggleInvoiceSelection(invoice);

    // Obtener las facturas actualizadas y notificar al componente padre
    const updatedSelected = isSelected
      ? [...selectedInvoices, invoice]
      : selectedInvoices.filter((inv) => inv.id !== invoice.id);

    onInvoicesSelected?.(updatedSelected);
  };

  const {
    data: invoices,
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ["invoices", debtorId, profile?.client_id],
    queryFn: async () =>
      await getInvoices({
        accessToken: session?.token as string,
        clientId: profile?.client_id as string,
        debtorId: debtorId as string,
      }),
    enabled: !!(debtorId && session?.token && profile?.client_id),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const handleSelectAll = (checked: boolean) => {
    const allInvoices = invoices?.data?.data || [];

    if (checked) {
      // Seleccionar todas las facturas usando el store
      selectAllInvoices(allInvoices);
      onInvoicesSelected?.(allInvoices);
    } else {
      // Deseleccionar todas las facturas usando el store
      clearSelectedInvoices();
      onInvoicesSelected?.([]);
    }
  };

  // Crear las columnas con el estado actual
  const allInvoices = invoices?.data?.data || [];
  const columns = createColumns(
    selectedInvoices,
    handleInvoiceSelect,
    allInvoices,
    handleSelectAll
  );

  if (!debtorId) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Facturas del deudor</CardTitle>
            {selectedInvoices.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  {selectedInvoices.length} seleccionada
                  {selectedInvoices.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelectedInvoices();
                    onInvoicesSelected?.([]);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Limpiar selección
                </button>
              </div>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        <p className="text-sm text-gray-600">
          Selecciona las facturas que deseas considerar para el plan de pago
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="overflow-x-auto">
            <DataTableNormal
              columns={columns}
              data={invoices?.data?.data || []}
              loadingComponent={<LoaderTable cols={6} />}
              emptyMessage="No se encontraron facturas"
              pageSize={5}
              pageSizeOptions={[5, 10, 15, 20, 25, 30, 40, 50]}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
