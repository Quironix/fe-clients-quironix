"use client";

import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { DEBTOR_COMMENTS, getChannelTypeLabel, getExecutiveCommentLabel } from "../../../config/management-types";
import { InvoiceWithTrack } from "../../../types/debtor-tracks";

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
  return found?.label || comment;
};

const getManagementTypeBadge = (type: string) => {
  return (
    <div className="border border-blue-600 px-3 text-center text-blue-600 rounded-full text-xs">
      {getChannelTypeLabel(type)}
    </div>
  );
};

const calculateDaysOverdue = (dueDate: string) => {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getCurrentPhase = (invoice: InvoiceWithTrack) => {
  const currentPhase = invoice.phases?.find((phase) => phase.is_current);
  return currentPhase?.phase || "-";
};

const calculateTimeInPhase = (invoice: InvoiceWithTrack) => {
  const currentPhase = invoice.phases?.find((phase) => phase.is_current);
  if (!currentPhase) return "-";

  const phaseDate = new Date(currentPhase.created_at);
  const today = new Date();
  const diffTime = today.getTime() - phaseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "1 día";
  return `${diffDays} días`;
};

export const createInvoiceColumns = (
  onViewDetails?: (invoice: InvoiceWithTrack) => void,
): ColumnDef<InvoiceWithTrack>[] => [
  {
    accessorKey: "documentNumber",
    header: "N° Documento",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original.number || row.original.external_number || "-"}
      </div>
    ),
  },
  {
    accessorKey: "order_code",
    header: "N° Pedido",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original.order_code || row.original.order_code || "-"}
      </div>
    ),
  },
  {
    accessorKey: "number_of_installments",
    header: "N° de cuotas",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original.number_of_installments}
      </div>
    ),
  },
  {
    accessorKey: "daysOverdue",
    header: "Días de atraso",
    cell: ({ row }) => (
      <div className="text-sm">
        {calculateDaysOverdue(row.original.due_date)}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => (
      <div className="font-bold text-sm">
        {row.original.balance
          ? formatNumber(parseFloat(row.original.balance))
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "documentPhase",
    header: "Fase del documento",
    cell: ({ row }) => (
      <div className="text-sm">{getCurrentPhase(row.original)}</div>
    ),
  },
  {
    accessorKey: "timeInPhase",
    header: "Tiempo en la fase",
    cell: ({ row }) => (
      <div className="text-sm">{calculateTimeInPhase(row.original)}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha y hora de gestión",
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDateTime(row.original.track?.createdAt)}
      </div>
    ),
  },
  {
    accessorKey: "managementType",
    header: "Tipo de Gestión",
    cell: ({ row }) =>
      getManagementTypeBadge(row.original.track?.managementType),
  },
  {
    accessorKey: "executive",
    header: "Nombre analista",
    cell: ({ row }) => {
      const track = row.original.track;
      if (track?.executiveComment === "AUTOMATED_COMMUNICATION") {
        return <div className="text-sm">Motor de collector</div>;
      }
      return (
        <div className="text-sm">
          {track?.executive
            ? `${track.executive.first_name ?? ""} ${track.executive.last_name ?? ""}`.trim()
            : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "Contacto",
    cell: ({ row }) => {
      const contact = row.original.track?.contact;
      // Mostrar el nombre si existe, sino el email/teléfono como fallback
      const displayValue = contact?.name || contact?.value || "-";
      return (
        <div className="flex flex-col text-xs">
          <span className="text-sm">{displayValue}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "debtorComment",
    header: "Comentario deudor",
    cell: ({ row }) => (
      <div className="text-xs max-w-[200px] truncate">
        {getDebtorCommentLabel(row.original.track?.debtorComment)}
      </div>
    ),
  },
  {
    accessorKey: "executiveComment",
    header: "Comentario Analista",
    cell: ({ row }) => (
      <div className="text-xs max-w-[200px] truncate">
        {getExecutiveCommentLabel(row.original.track?.executiveComment)}
      </div>
    ),
  },
  {
    accessorKey: "paymentCommitmentDate",
    header: "Fecha de compromiso de pago",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.track?.caseData?.commitmentDate
          ? formatDate(row.original.track.caseData.commitmentDate as string)
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "caseData",
    header: "Litigio",
    cell: ({ row }) => (
      <div className="text-xs max-w-[150px] truncate">
        {row.original.track?.caseData?.litigationIds &&
        row.original.track.caseData.litigationIds.length > 0
          ? `${row.original.track.caseData.litigationIds.length} litigio(s)`
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "observation",
    header: "Observación",
    cell: ({ row }) => (
      <div className="text-xs max-w-[250px] truncate">
        {row.original.track?.observation || "-"}
      </div>
    ),
  },
  {
    accessorKey: "nextManagementDate",
    header: "Fecha de próxima gestión",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.track?.nextManagementDate
          ? formatDateTime(row.original.track.nextManagementDate)
          : "-"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewDetails?.(row.original)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
];
