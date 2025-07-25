import { Clock2, InfoIcon } from "lucide-react";
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
  };
  type: "account-receivable" | "credit-favor";
  handleOpenInfo: (row: any) => void;
  handleCloseInfo: () => void;
}

const ItemListPayment = ({
  row,
  type,
  handleOpenInfo,
  handleCloseInfo,
}: ItemListPaymentProps) => {
  return (
    <div
      className={`flex flex-col items-end justify-between w-full border rounded-lg p-3 hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 group space-y-1 ${
        type === "account-receivable" ? "border-orange-400" : "border-blue-400"
      }`}
    >
      <div className="flex items-end w-full justify-between">
        <div></div>
        <div className="flex items-center gap-1">
          <DocumentTypeBadge type={row.type} />
          <div className="hidden group-hover:block">
            <InfoIcon
              onMouseEnter={() => handleOpenInfo(row)}
              onMouseLeave={handleCloseInfo}
              className="w-5 h-5 text-orange-400"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-start w-full">
        <div className="flex items-center justify-start gap-1 mb-2">
          <Clock2 className="w-3 h-3 text-orange-400" />
          <span className="text-xs text-gray-500">
            <span className="font-bold text-md">Nº {row.number}</span>
          </span>
        </div>
        <div className="flex flex-col items-start border-b border-orange-400 pb-2 w-full">
          <span className="font-bold text-xs truncate w-full">
            {row.debtor?.name}
          </span>
          <div className="flex items-start gap-1">
            <span className="font-bold text-xs">Fase</span>
            <span className="text-xs text-gray-500 truncate">
              {row?.phases?.length > 0 ? row?.phases[0] : "Sin fase"}
            </span>
          </div>
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
