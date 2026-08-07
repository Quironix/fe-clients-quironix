"use client";

import { Invoice } from "@/app/dashboard/payment-plans/store";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

interface InvoiceCardLitigationProps {
  invoice: Invoice;
  isSelected: boolean;
  onToggleSelect: (invoice: Invoice) => void;
  isDisabled?: boolean;
  litigationAmount?: string;
  onAmountChange?: (amount: string) => void;
}

const InvoiceCardLitigation = ({
  invoice,
  isSelected,
  onToggleSelect,
  isDisabled = false,
  litigationAmount = "",
  onAmountChange,
}: InvoiceCardLitigationProps) => {
  const [displayAmount, setDisplayAmount] = useState(litigationAmount);

  useEffect(() => {
    setDisplayAmount(litigationAmount);
  }, [litigationAmount]);

  const getContainerClasses = () => {
    const baseClasses =
      "flex flex-col items-start w-full border rounded-lg p-3 transition-all duration-300 group";

    if (isDisabled) {
      return `${baseClasses} min-h-45 border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed`;
    }

    if (isSelected) {
      return `${baseClasses} border-orange-400 bg-orange-50 shadow-md`;
    }

    return `${baseClasses} min-h-45 border-gray-300 hover:border-orange-400 hover:shadow-sm cursor-pointer`;
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

      <div className="flex flex-col items-start justify-start w-full space-y-2">
        <div className="flex items-center justify-start gap-1">
          <span className="text-xs text-gray-500">
            <span className="font-bold text-md">Nº {invoice?.number}</span>
          </span>
        </div>

        <div className="flex flex-col items-start w-full">
          <span className="font-bold text-xs truncate w-full">
            {invoice.debtor?.name || "Sin deudor"}
          </span>

          <div className="flex items-start gap-1 mt-1">
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

        {/* Separador */}
        <div className="w-full border-t border-orange-400 my-2"></div>

        {/* Monto y Saldo al final */}
        <div className="flex items-center justify-between gap-1 w-full">
          <span className="text-xs text-gray-500">Monto</span>
          <span className="text-xs font-bold text-gray-500">
            $
            {new Intl.NumberFormat("es-CL").format(Number(invoice.amount || 0))}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 w-full">
          <span className="text-xs text-gray-500">Saldo</span>
          <span className="text-xs font-bold text-gray-500">
            $
            {new Intl.NumberFormat("es-CL").format(
              Number(invoice.balance || 0)
            )}
          </span>
        </div>

        {/* Input de monto en litigio - siempre visible */}
        {onAmountChange && (
          <div className="flex flex-col gap-1 w-full pt-2 border-t border-orange-300">
            <label className={`text-xs font-semibold ${isSelected ? 'text-orange-700' : 'text-gray-500'}`}>
              Monto en litigio *
            </label>
            <Input
              type="text"
              placeholder="Ingresa monto"
              value={displayAmount}
              disabled={!isSelected}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                if (!isSelected) return;
                const rawValue = e.target.value.replace(/[^0-9]/g, "");
                setDisplayAmount(e.target.value);
                onAmountChange(rawValue);
              }}
              onBlur={() => {
                if (!isSelected) return;
                const numValue = parseFloat(litigationAmount) || 0;
                const formatted = new Intl.NumberFormat("es-CL", {
                  style: "decimal",
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0,
                }).format(numValue);
                setDisplayAmount(formatted);
              }}
              onFocus={(e) => {
                e.stopPropagation();
                if (!isSelected) return;
                const numValue = parseFloat(litigationAmount) || 0;
                setDisplayAmount(numValue > 0 ? numValue.toString() : "");
              }}
              className={`h-8 text-xs border-orange-300 focus:border-orange-500 ${isSelected ? 'bg-white' : ''}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceCardLitigation;
