"use client";

import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Clock } from "lucide-react";
import { PAYMENT_FREQUENCY } from "../../../data";
import { PaymentPlanResponse, PaymentPlanStatus } from "../../types";
import SheetModal from "./sheet-modal";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
  }).format((amount as number) || 0);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatPaymentFrequency = (frequency: string) => {
  const frequencyMap: Record<string, string> = {
    FREQ_7_DAYS: "7 días",
    FREQ_15_DAYS: "15 días",
    FREQ_30_DAYS: "30 días",
    FREQ_60_DAYS: "60 días",
    FREQ_90_DAYS: "90 días",
    MONTHLY: "Mensual",
    WEEKLY: "Semanal",
    BIWEEKLY: "Quincenal",
    QUARTERLY: "Trimestral",
  };
  return frequencyMap[frequency] || frequency;
};

const ERROR_CLASS =
  "bg-white border-red-500 rounded-full gap-2 text-red-500 text-[10px] min-w-[100px] max-w-[100px] truncate text-center text-[10px] p-0";
const SUCCESS_CLASS =
  "bg-white border-green-500 rounded-full gap-2 text-green-500 text-[10px] min-w-[100px] max-w-[100px] truncate text-center text-[10px] p-0";
const WARNING_CLASS =
  "bg-white border-blue-500 rounded-full gap-2 text-blue-500 text-[10px] min-w-[100px] max-w-[100px] truncate text-center text-[10px] p-0";
const INFO_CLASS =
  "bg-white border-blue-500 rounded-full gap-2 text-blue-500 text-[10px] min-w-[100px] max-w-[100px] truncate text-center text-[10px] p-0";
const OBJECTED_CLASS =
  "bg-white border-purple-500 rounded-full gap-2 text-purple-500 text-[10px] min-w-[100px] max-w-[100px] truncate text-center text-[10px] p-0";

const getStatusBadge = (status: PaymentPlanStatus) => {
  const statusConfig = {
    PENDING: {
      label: "Pendiente",
      variant: WARNING_CLASS,
      icon: null,
    },
    APPROVED: {
      label: "Aprobado",
      variant: SUCCESS_CLASS,
      icon: null,
    },
    REJECTED: {
      label: "Rechazado",
      variant: ERROR_CLASS,
      icon: null,
    },
    OBJECTED: {
      label: "Con observaciones",
      variant: OBJECTED_CLASS,
      icon: null,
    },
  };

  const config = statusConfig[status] || {
    label: "Desconocido",
    variant: INFO_CLASS,
    icon: <Clock className="h-3 w-3" />,
  };

  return (
    <Badge className={config.variant}>
      <span className="flex items-center justify-center gap-1 min-w-[100px] max-w-[100px] truncate text-center p-0">
        {config.label}
      </span>
    </Badge>
  );
};

export const createColumns = (
  onViewDetails?: (paymentPlan: PaymentPlanResponse) => void,
  onEdit?: (paymentPlan: PaymentPlanResponse) => void,
  onDelete?: (paymentPlan: PaymentPlanResponse) => void
): ColumnDef<PaymentPlanResponse>[] => [
  {
    accessorKey: "id",
    header: "N° Solicitud",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.requestId}</div>
    ),
  },
  {
    accessorKey: "debtor_id",
    header: "Deudor",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.debtor.name}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "total_debt",
    header: "Deuda total",
    cell: ({ row }) => (
      <div className="font-bold text-sm text-right">
        {formatNumber(row.original.totalDebt)}
      </div>
    ),
  },
  {
    accessorKey: "number_of_installments",
    header: "N° Cuotas",
    cell: ({ row }) => (
      <div className="font-medium text-sm text-center">
        {row.original.numberOfInstallments}
      </div>
    ),
  },
  {
    accessorKey: "installment_amount",
    header: "Monto cuota",
    cell: ({ row }) => (
      <div className="font-bold text-sm">
        {formatNumber(row.original.installmentAmount)}
      </div>
    ),
  },
  {
    accessorKey: "payment_frequency",
    header: "Frecuencia",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {(() => {
          // Importa PAYMENT_FREQUENCY desde el archivo correspondiente
          // import { PAYMENT_FREQUENCY } from "@/app/dashboard/data";
          // Si ya está importado, omite la línea de importación

          // Función para obtener la etiqueta de la frecuencia de pago
          const getPaymentFrequencyLabel = (code: string) => {
            const freq = PAYMENT_FREQUENCY.find((f) => f.code === code);
            return freq ? freq.label : code;
          };

          return getPaymentFrequencyLabel(row.original.paymentFrequency);
        })()}
      </div>
    ),
  },
  {
    accessorKey: "plan_start_date",
    header: "Inicio pago",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {formatDate(row.original.planStartDate)}
      </div>
    ),
  },
  {
    accessorKey: "payment_end_date",
    header: "Término pago",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {formatDate(row.original.paymentEndDate)}
      </div>
    ),
  },
  {
    accessorKey: "debt_concept",
    header: "Comentario",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.debtConcept}</div>
    ),
  },
  {
    accessorKey: "annual_interest_rate",
    header: "Tasa Interés",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original.annualInterestRate}%
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Fecha Creación",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original.createdAt ? formatDate(row.original.createdAt) : "N/A"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const paymentPlan = row.original;

      return <SheetModal detail={paymentPlan} />;
    },
  },
];

export const columns = createColumns();
