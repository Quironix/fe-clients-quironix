"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Clock, Eye, XCircle } from "lucide-react";
import { PAYMENT_FREQUENCY } from "../../data";
import { PaymentPlanResponse, PaymentPlanStatus } from "../types";

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
  "bg-white border-red-500 rounded-md gap-2 text-red-500 text-[10px]";
const SUCCESS_CLASS =
  "bg-white border-green-500 rounded-md gap-2 text-green-500 text-[10px]";
const WARNING_CLASS =
  "bg-white border-orange-500 rounded-md gap-2 text-orange-500 text-[10px]";
const INFO_CLASS =
  "bg-white border-blue-500 rounded-md gap-2 text-blue-500 text-[10px]";

const getStatusBadge = (status: PaymentPlanStatus) => {
  const statusConfig = {
    PENDING: {
      label: "Pendiente",
      variant: WARNING_CLASS,
      icon: <Clock className="h-3 w-3" />,
    },
    ACTIVE: {
      label: "Activo",
      variant: SUCCESS_CLASS,
      icon: <CheckCircle className="h-3 w-3" />,
    },
    COMPLETED: {
      label: "Completado",
      variant: SUCCESS_CLASS,
      icon: <CheckCircle className="h-3 w-3" />,
    },
    CANCELLED: {
      label: "Cancelado",
      variant: ERROR_CLASS,
      icon: <XCircle className="h-3 w-3" />,
    },
    DEFAULTED: {
      label: "En mora",
      variant: ERROR_CLASS,
      icon: <XCircle className="h-3 w-3" />,
    },
  };

  const config = statusConfig[status] || {
    label: "Desconocido",
    variant: INFO_CLASS,
    icon: <Clock className="h-3 w-3" />,
  };

  return (
    <Badge className={config.variant}>
      <span className="flex items-center gap-1">
        {config.icon}
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
      <div className="font-bold text-sm">
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

      return (
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => {
            if (paymentPlan.status === "PENDING") {
              onViewDetails?.(paymentPlan);
            }
          }}
        >
          <Eye className="h-4 w-4 text-blue-600" />
        </Button>
      );
    },
  },
];

export const columns = createColumns();
