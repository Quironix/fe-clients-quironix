"use client";

import { formatNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
  DEBTOR_COMMENTS,
  getChannelTypeLabel,
  getExecutiveCommentLabel,
} from "../../../config/management-types";
import { DebtorTrack } from "../../../types/debtor-tracks";

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDebtorCommentLabel = (comment: string): string => {
  const found = DEBTOR_COMMENTS.find((c) => c.value === comment);
  return found?.label ?? comment;
};

const getManagementTypeBadge = (type: string) => {
  const label = getChannelTypeLabel(type);
  return (
    <div className="border border-blue-600 px-3 text-center text-blue-600 rounded-full text-xs">
      {label}
    </div>
  );
};

export const createColumns = (): ColumnDef<DebtorTrack>[] => [
  {
    accessorKey: "documentNumber",
    header: "N° Documento",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original.id.split("-")[row.original.id.split("-").length - 1] ||
          "-"}
      </div>
    ),
  },
  {
    accessorKey: "order_code",
    header: "N° Pedido",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original.order_code || "-"}
      </div>
    ),
  },
  {
    accessorKey: "numberOfInstallments",
    header: "N° de cuotas",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original.numberOfInstallments || "-"}
      </div>
    ),
  },
  {
    accessorKey: "daysOverdue",
    header: "Días de atraso",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.daysOverdue !== undefined
          ? row.original.daysOverdue
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => (
      <div className="font-bold text-sm">
        {row.original.amount ? formatNumber(row.original.amount) : "-"}
      </div>
    ),
  },
  {
    accessorKey: "documentPhase",
    header: "Fase del documento",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.documentPhase || "-"}</div>
    ),
  },
  {
    accessorKey: "timeInPhase",
    header: "Tiempo en la fase",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.timeInPhase || "-"}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha y hora de gestión",
    cell: ({ row }) => (
      <div className="text-sm">{formatDateTime(row.original.createdAt)}</div>
    ),
  },
  {
    accessorKey: "managementType",
    header: "Tipo de Gestión",
    cell: ({ row }) => getManagementTypeBadge(row.original.managementType),
  },
  {
    accessorKey: "executive",
    header: "Nombre analista",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.executive.first_name} {row.original.executive.last_name}
      </div>
    ),
  },
  {
    accessorKey: "contact",
    header: "Contacto",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="text-sm">{row.original.contact.value}</span>
      </div>
    ),
  },
  {
    accessorKey: "debtorComment",
    header: "Comentario deudor",
    cell: ({ row }) => (
      <div className="text-xs max-w-[200px] truncate">
        {getDebtorCommentLabel(row.original.debtorComment)}
      </div>
    ),
  },
  {
    accessorKey: "executiveComment",
    header: "Comentario Analista",
    cell: ({ row }) => (
      <div className="text-xs max-w-[200px] truncate">
        {getExecutiveCommentLabel(row.original.executiveComment)}
      </div>
    ),
  },
  {
    accessorKey: "paymentCommitmentDate",
    header: "Fecha de compromiso de pago",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.paymentCommitmentDate
          ? formatDate(row.original.paymentCommitmentDate)
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "caseData",
    header: "Litigio (submotivo)",
    cell: ({ row }) => (
      <div className="text-xs max-w-[150px] truncate">
        {row.original.caseData?.litigationIds &&
        row.original.caseData.litigationIds.length > 0
          ? `${row.original.caseData.litigationIds.length} litigio(s)`
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "observation",
    header: "Observación",
    cell: ({ row }) => (
      <div className="text-xs max-w-[250px] whitespace-normal break-words">
        {row.original.observation || "-"}
      </div>
    ),
  },
  {
    accessorKey: "nextManagementDate",
    header: "Fecha de próxima gestión",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.nextManagementDate
          ? formatDateTime(row.original.nextManagementDate)
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "collector",
    header: "Collector",
    cell: ({ row }) => {
      if (row.original.caseData?.debtorComment !== "AUTOMATED_COLLECTOR_SENT") {
        return <div className="text-sm">-</div>;
      }
      const collector = row.original.caseData?.collector;
      if (!collector?.name && !collector?.channel) return <div className="text-sm">-</div>;
      return (
        <div className="flex flex-col gap-0.5">
          {collector.name && (
            <span className="text-sm font-medium">{collector.name}</span>
          )}
          {collector.channel && (
            <span className="text-xs text-muted-foreground">{collector.channel}</span>
          )}
        </div>
      );
    },
  },
];
