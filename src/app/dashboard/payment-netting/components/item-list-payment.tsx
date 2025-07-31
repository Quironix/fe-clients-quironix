import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CheckCircle2,
  Clock2,
  DollarSign,
  InfoIcon,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { usePaymentNettingStore } from "../store";
import DocumentTypeBadge, { DocumentType } from "./document-type-badge";

interface ItemListPaymentProps {
  row: {
    id: number;
    number: string;
    debtor: any;
    phases: Array<any>;
    due_date: string;
    amount: string;
    type: DocumentType;
    created_at?: string;
  };
  type: "account-receivable" | "credit-favor";
  handleOpenInfo: (row: any) => void;
  handleCloseInfo: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
}

const ItemListPayment = ({
  row,
  type,
  handleOpenInfo,
  handleCloseInfo,
  isSelected = false,
  isDisabled = false,
}: ItemListPaymentProps) => {
  const {
    setSelectedInvoices,
    setSelectedPayments,
    selectedInvoices,
    selectedPayments,
  } = usePaymentNettingStore();

  const [popOver, setPopOver] = useState(false);

  const handleClick = () => {
    // No hacer nada si está deshabilitado o ya seleccionado
    if (isDisabled || isSelected) {
      return;
    }

    if (type === "account-receivable") {
      setSelectedInvoices(row);
    } else {
      setSelectedPayments(row);
    }
  };

  const handleRemoveFromSelection = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se ejecute el handleClick del contenedor

    if (type === "account-receivable") {
      // Filtrar el elemento actual de la lista de facturas seleccionadas
      const updatedInvoices = selectedInvoices.filter(
        (invoice) => invoice.id !== row.id
      );
      setSelectedInvoices(updatedInvoices);
    } else {
      // Filtrar el elemento actual de la lista de pagos seleccionados
      const updatedPayments = selectedPayments.filter(
        (payment) => payment.id !== row.id
      );
      setSelectedPayments(updatedPayments);
    }
    setPopOver(false); // Cerrar el popover después de eliminar
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se ejecute el handleClick del contenedor
  };

  // Verificar si el elemento está seleccionado en el store
  const isItemSelected = () => {
    if (type === "account-receivable") {
      return selectedInvoices.some((invoice) => invoice.id === row.id);
    } else {
      return selectedPayments.some((payment) => payment.id === row.id);
    }
  };

  // Determinar las clases CSS basadas en el estado
  const getContainerClasses = () => {
    const baseClasses =
      "flex flex-col items-start justify-between w-full border rounded-lg p-3 transition-all duration-300 group space-y-1 max-h-40 min-h-40";
    const typeClasses =
      type === "account-receivable" ? "border-orange-400" : "border-blue-400";

    if (isSelected) {
      return `${baseClasses} bg-gray-100 border-dashed border-gray-300 shadow-md cursor-default`;
    }

    if (isDisabled) {
      return `${baseClasses} bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed`;
    }

    return `${baseClasses} ${typeClasses} hover:translate-y-[-2px] hover:shadow-md cursor-pointer`;
  };

  return (
    <div className={getContainerClasses()} onClick={handleClick}>
      <div className="flex items-center w-full justify-between">
        <div>
          {/* Badge de seleccionado */}
          {isSelected && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        </div>
        <div className="flex items-center gap-1">
          <DocumentTypeBadge type={row.type} />
          <div className={`${popOver ? "block" : "hidden group-hover:block"}`}>
            {/* <InfoIcon
              onMouseEnter={() => handleOpenInfo(row)}
              onMouseLeave={handleCloseInfo}
              className="w-5 h-5 text-orange-400"
            /> */}
            <Popover open={popOver} onOpenChange={setPopOver}>
              <PopoverTrigger asChild className="cursor-pointer">
                <InfoIcon
                  className="w-5 h-5 text-orange-400"
                  onClick={handleInfoClick}
                  onMouseEnter={(e) => e.stopPropagation()}
                  onMouseLeave={(e) => e.stopPropagation()}
                />
              </PopoverTrigger>
              <PopoverContent
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseLeave={(e) => e.stopPropagation()}
                onMouseOver={(e) => e.stopPropagation()}
                onMouseOut={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">
                    Información del documento
                  </p>
                  <div className="text-xs text-gray-600">
                    <p>
                      <span className="font-medium">Número:</span> {row.number}
                    </p>
                    <p>
                      <span className="font-medium">Deudor:</span>{" "}
                      {row.debtor?.name}
                    </p>
                    <p>
                      <span className="font-medium">Monto:</span> $
                      {new Intl.NumberFormat("es-CL").format(
                        Number(row.amount)
                      )}
                    </p>
                  </div>
                  {isItemSelected() ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleRemoveFromSelection}
                    >
                      <Trash className="w-3 h-3 mr-2" />
                      Eliminar de selección
                    </Button>
                  ) : (
                    <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                      Este documento no está seleccionado actualmente
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-start w-full">
        <div className="flex items-center justify-start gap-1 mb-2">
          {type === "account-receivable" ? (
            <Clock2 className="w-3 h-3 text-orange-400" />
          ) : (
            <DollarSign className="w-3 h-3 text-blue-400" />
          )}
          <span className="text-xs text-gray-500">
            <span className="font-bold text-md">Nº {row?.number}</span>
          </span>
        </div>
        <div className="flex flex-col items-start border-b border-orange-400 pb-2 w-full h-full">
          <span className="font-bold text-xs truncate w-full">
            {row.debtor?.name}
          </span>

          {type === "account-receivable" ? (
            <div className="flex items-start gap-1">
              <span className="font-bold text-xs">Fase</span>
              <span className="text-xs text-gray-500 truncate">
                {row?.phases?.length > 0
                  ? row?.phases[0]?.phase || "Sin fase"
                  : "Sin fase"}
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-1">
              <span className="font-bold text-xs">F. Depósito</span>
              <span className="text-xs text-gray-500">
                {row?.created_at?.split("T")[0]}
              </span>
            </div>
          )}
          <div className="flex items-start gap-1">
            <span className="font-bold text-xs">Vencimiento</span>
            <span className="text-xs text-gray-500">
              {row?.due_date?.split("T")[0]}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-1 mt-1 w-full">
          <span className="text-xs text-gray-500">Monto</span>
          <span className="text-xs font-bold text-gray-500">
            ${new Intl.NumberFormat("es-CL").format(Number(row.amount))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ItemListPayment;
