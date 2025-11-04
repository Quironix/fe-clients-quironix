"use client";

import { Invoice } from "@/app/dashboard/payment-plans/store";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

interface InvoiceCardLitigationProps {
  invoice: Invoice;
  isSelected: boolean;
  onToggleSelect: (invoice: Invoice) => void;
  isDisabled?: boolean;
}

const InvoiceCardLitigation = ({
  invoice,
  isSelected,
  onToggleSelect,
  isDisabled = false,
}: InvoiceCardLitigationProps) => {
  const getContainerClasses = () => {
    const baseClasses =
      "flex flex-col items-start justify-between w-full border rounded-lg p-3 transition-all duration-300 group space-y-1 max-h-45 min-h-45 py-3";

    if (isDisabled) {
      return `${baseClasses} border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed`;
    }

    if (isSelected) {
      return `${baseClasses} border-orange-400 bg-orange-50 shadow-md`;
    }

    return `${baseClasses} border-gray-300 hover:border-orange-400 hover:shadow-sm cursor-pointer`;
  };

  return (
    <div
      className={getContainerClasses()}
      onClick={() => !isDisabled && onToggleSelect(invoice)}
    >
      <div className="flex items-center w-full justify-between">
        {isSelected && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
        <span className="text-xs bg-pink-200 text-pink-700 px-2 py-1 rounded-full ml-auto">
          Factura
        </span>
      </div>

      <div className="flex flex-col items-start justify-start w-full">
        <div className="flex items-center justify-start gap-1 mb-2">
          <span className="text-xs text-gray-500">
            <span className="font-bold text-md">Nº {invoice?.number}</span>
          </span>
        </div>
        <div className="flex flex-col items-start border-b border-orange-400 pb-2 w-full h-full">
          <span className="font-bold text-xs truncate w-full">
            {invoice.debtor?.name || "Sin deudor"}
          </span>

          <div className="flex items-start gap-1">
            <span className="font-bold text-xs">Fase</span>
            <span className="text-xs text-gray-500 truncate">
              {invoice?.phases?.length > 0
                ? invoice?.phases[0]?.phase || "Sin fase"
                : "Sin fase"}
            </span>
          </div>

          <div className="flex items-start gap-1">
            <span className="font-bold text-xs">Vencimiento</span>
            <span className="text-xs text-gray-500">
              {invoice?.due_date
                ? format(new Date(invoice.due_date), "dd/MM/yyyy")
                : "Sin fecha"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-1 mt-1 w-full">
          <span className="text-xs text-gray-500">Monto</span>
          <span className="text-xs font-bold text-gray-500">
            $
            {new Intl.NumberFormat("es-CL").format(Number(invoice.amount || 0))}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 mt-1 w-full">
          <span className="text-xs text-gray-500">Saldo</span>
          <span className="text-xs font-bold text-gray-500">
            $
            {new Intl.NumberFormat("es-CL").format(
              Number(invoice.balance || 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCardLitigation;
