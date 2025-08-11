"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Clock, Eye, XCircle } from "lucide-react";
import { PaymentPlanResponse, PaymentPlanStatus } from "../../types";

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
  "bg-white border-red-500 rounded-full gap-2 text-red-500 text-[10px]";
const SUCCESS_CLASS =
  "bg-white border-green-500 rounded-full gap-2 text-green-500 text-[10px]";
const WARNING_CLASS =
  "bg-white border-blue-500 rounded-full gap-2 text-blue-500 text-[10px]";
const INFO_CLASS =
  "bg-white border-blue-500 rounded-full gap-2 text-blue-500 text-[10px]";
const OBJECTED_CLASS =
  "bg-white border-purple-500 rounded-full gap-2 text-purple-500 text-[10px]";

const getStatusBadge = (status: PaymentPlanStatus) => {
  const statusConfig = {
    PENDING: {
      label: "Pendiente",
      variant: WARNING_CLASS,
      icon: <Clock className="h-3 w-3" />,
    },
    ACTIVE: {
      label: "Aprobado",
      variant: SUCCESS_CLASS,
      icon: <CheckCircle className="h-3 w-3" />,
    },
    COMPLETED: {
      label: "Completado",
      variant: SUCCESS_CLASS,
      icon: <CheckCircle className="h-3 w-3" />,
    },
    REJECTED: {
      label: "Rechazado",
      variant: ERROR_CLASS,
      icon: <XCircle className="h-3 w-3" />,
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
    accessorKey: "requestId",
    header: "N° Documento",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.requestId}</div>
    ),
  },
  {
    accessorKey: "clientId",
    header: "Documento",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.clientId}</div>
    ),
  },
  {
    accessorKey: "total_debt",
    header: "Monto",
    cell: ({ row }) => (
      <div className="font-bold text-sm">
        {formatNumber(row.original.totalDebt)}
      </div>
    ),
  },
  {
    accessorKey: "payment_end_date",
    header: "Vencimiento",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {formatDate(row.original.paymentEndDate)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Fase",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    id: "actions",
    header: "Acción",
    cell: ({ row }) => {
      const paymentPlan = row.original;

      return (
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => {
            onViewDetails?.(paymentPlan);
          }}
        >
          <Eye className="h-4 w-4 text-blue-600" />
        </Button>
      );
    },
  },
];

export const columns = createColumns();
