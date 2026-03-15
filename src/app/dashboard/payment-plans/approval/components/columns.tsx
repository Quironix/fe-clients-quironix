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

const getStatusBadge = (status: PaymentPlanStatus, t?: (key: string) => string) => {
  const tr = t || ((key: string) => key);
  const statusConfig = {
    PENDING: {
      label: tr("statusLabels.pending"),
      variant: WARNING_CLASS,
      icon: null,
    },
    APPROVED: {
      label: tr("statusLabels.approved"),
      variant: SUCCESS_CLASS,
      icon: null,
    },
    REJECTED: {
      label: tr("statusLabels.rejected"),
      variant: ERROR_CLASS,
      icon: null,
    },
    OBJECTED: {
      label: tr("statusLabels.objected"),
      variant: OBJECTED_CLASS,
      icon: null,
    },
  };

  const config = statusConfig[status] || {
    label: tr("statusLabels.unknown"),
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
  onDelete?: (paymentPlan: PaymentPlanResponse) => void,
  t?: (key: string) => string
): ColumnDef<PaymentPlanResponse>[] => {
  const tr = t || ((key: string) => key);
  return [
    {
      accessorKey: "id",
      header: tr("columnHeaders.requestNumber"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.original.requestId}</div>
      ),
    },
    {
      accessorKey: "debtor_id",
      header: tr("columnHeaders.debtor"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.original.debtor.name}</div>
      ),
    },
    {
      accessorKey: "status",
      header: tr("columnHeaders.status"),
      cell: ({ row }) => getStatusBadge(row.getValue("status"), t),
    },
    {
      accessorKey: "total_debt",
      header: tr("columnHeaders.totalDebt"),
      cell: ({ row }) => (
        <div className="font-bold text-sm text-right">
          {formatNumber(row.original.totalDebt)}
        </div>
      ),
    },
    {
      accessorKey: "number_of_installments",
      header: tr("columnHeaders.installments"),
      cell: ({ row }) => (
        <div className="font-medium text-sm text-center">
          {row.original.numberOfInstallments}
        </div>
      ),
    },
    {
      accessorKey: "installment_amount",
      header: tr("columnHeaders.installmentAmount"),
      cell: ({ row }) => (
        <div className="font-bold text-sm">
          {formatNumber(row.original.installmentAmount)}
        </div>
      ),
    },
    {
      accessorKey: "payment_frequency",
      header: tr("columnHeaders.frequency"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {(() => {
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
      header: tr("columnHeaders.startDate"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {formatDate(row.original.planStartDate)}
        </div>
      ),
    },
    {
      accessorKey: "payment_end_date",
      header: tr("columnHeaders.endDate"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {formatDate(row.original.paymentEndDate)}
        </div>
      ),
    },
    {
      accessorKey: "debt_concept",
      header: tr("columnHeaders.comment"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.original.debtConcept}</div>
      ),
    },
    {
      accessorKey: "annual_interest_rate",
      header: tr("columnHeaders.interestRate"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {row.original.annualInterestRate}%
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: tr("columnHeaders.createdAt"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {row.original.createdAt ? formatDate(row.original.createdAt) : "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      header: tr("columnHeaders.actions"),
      cell: ({ row }) => {
        const paymentPlan = row.original;

        return <SheetModal detail={paymentPlan} />;
      },
    },
  ];
};

export const columns = createColumns();
