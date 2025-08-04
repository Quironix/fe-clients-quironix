import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftRight,
  Building2,
  Calendar,
  DollarSign,
  File,
  IdCard,
} from "lucide-react";
import DialogForm from "../../components/dialog-form";
import { BankMovementStatusEnum, PaymentNetting } from "../types";
import IconDescription from "./icon-description";

interface TransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: PaymentNetting | null;
}

const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(numAmount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusBadge = (status: BankMovementStatusEnum) => {
  const ERROR_CLASS = "bg-red-100 border-red-500 text-red-700";
  const SUCCESS_CLASS = "bg-green-100 border-green-500 text-green-700";
  const WARNING_CLASS = "bg-orange-100 border-orange-500 text-orange-700";

  const statusConfig = {
    [BankMovementStatusEnum.PENDING]: {
      label: "Pendiente",
      variant: WARNING_CLASS,
    },
    [BankMovementStatusEnum.PROCESSED]: {
      label: "Procesado",
      variant: SUCCESS_CLASS,
    },
    [BankMovementStatusEnum.PAYMENT_CREATED]: {
      label: "Pago creado",
      variant: SUCCESS_CLASS,
    },
    [BankMovementStatusEnum.REJECTED]: {
      label: "Rechazado",
      variant: ERROR_CLASS,
    },
    [BankMovementStatusEnum.ELIMINATED]: {
      label: "Eliminado",
      variant: ERROR_CLASS,
    },
    [BankMovementStatusEnum.COMPENSATED]: {
      label: "Compensado",
      variant: SUCCESS_CLASS,
    },
    [BankMovementStatusEnum.REJECTED_DUPLICATE]: {
      label: "Rechazado duplicado",
      variant: ERROR_CLASS,
    },
    [BankMovementStatusEnum.ELIMINATED_NEGATIVE_AMOUNT]: {
      label: "Eliminado monto negativo",
      variant: ERROR_CLASS,
    },
    [BankMovementStatusEnum.ELIMINATED_NO_TRACKING]: {
      label: "Eliminado sin tracking",
      variant: ERROR_CLASS,
    },
    [BankMovementStatusEnum.MAINTAINED]: {
      label: "Mantenido",
      variant: SUCCESS_CLASS,
    },
  };

  const config = statusConfig[status] || {
    label: "Desconocido",
    variant: WARNING_CLASS,
  };

  return <Badge className={config.variant}>{config.label}</Badge>;
};

export default function TransactionDetailModal({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <DialogForm
      title="Detalle del depósito"
      description=""
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <Button
          disabled={!!transaction.payment?.debtor}
          className="bg-orange-400 text-white hover:bg-orange-400/90"
          onClick={() => onOpenChange(true)}
        >
          Asignar deudor
        </Button>
      }
    >
      {/* Header con ID y Estado */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-400" />
          <span className="font-medium">MOV-{transaction?.id}</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(transaction.status)}
        </div>
      </div>

      <div className="bg-blue-100 border p-4 rounded-lg flex items-center gap-2">
        <div className="flex items-center gap-1">
          <DollarSign className="w-6 h-6 text-gray-400" />
          <div className="flex flex-col gap-0">
            <span className="text-xs">Monto</span>
            <span className="font-bold text-blue-500 -mt-1">{`$ ${new Intl.NumberFormat(
              "es-ES",
              {}
            ).format(Number(transaction.amount))}`}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 border-b border-t border-gray-200 py-4">
        <IconDescription
          icon={<File className="w-4 h-4 text-gray-400" />}
          description="Descripción"
          value="Transferencia bancaria"
        />
        <IconDescription
          icon={<Building2 className="w-4 h-4 text-gray-400" />}
          description="Banco"
          value={transaction.bank_information?.bank}
        />
        <IconDescription
          icon={<Calendar className="w-4 h-4 text-gray-400" />}
          description="Fecha de depósito"
          value={transaction.created_at}
        />
        <IconDescription
          icon={<ArrowLeftRight className="w-4 h-4 text-gray-400" />}
          description="Transferencia"
          value={`$ ${new Intl.NumberFormat("es-ES", {}).format(
            Number(transaction.amount)
          )}`}
        />
        {transaction.payment?.debtor?.dni_id && (
          <IconDescription
            icon={<IdCard className="w-4 h-4 text-gray-400" />}
            description="RUT"
            value={transaction.payment.debtor.dni_id}
          />
        )}
        {transaction?.payment?.debtor?.debtor_code && (
          <IconDescription
            icon={<ArrowLeftRight className="w-4 h-4 text-gray-400" />}
            description="Código deudor"
            value={transaction.payment.debtor.debtor_code}
          />
        )}
      </div>
    </DialogForm>
  );
}
