"use client";

import { formatNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { getExecutiveCommentLabel } from "../../../config/management-types";
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

const getManagementTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    CALL_OUT: "Llamada telefónica",
    EMAIL: "Correo electrónico",
    VISIT: "Visita",
    LETTER: "Carta",
    WHATSAPP: "WhatsApp",
  };
  return types[type] || type;
};

const getDebtorCommentLabel = (comment: string) => {
  const comments: Record<string, string> = {
    WILL_DEPOSIT_OR_TRANSFER: "Depositará o hará transferencia",
    DEPOSITED_OR_TRANSFERRED: "Depositó o transfirió",
    CONTACT_NOT_RESPONDING: "Contacto no responde",
    STATEMENT_SENT: "Envío Estado de Cuenta",
    PAYMENT_MADE_AND_IDENTIFIED: "Pago realizado e identificado",
    INVOICE_NOT_REGISTERED_IN_ACCOUNTING:
      "Factura no registrada en contabilidad",
    INVOICE_WITH_LITIGATION: "Factura con litigio",
    NEED_PAYMENT_PLAN: "Necesito Plan de Pago",
    CHECK_CONFIRMED: "Cheque Confirmado",
  };
  return comments[comment] || comment;
};

const getManagementTypeBadge = (type: string) => {
  const label = getManagementTypeLabel(type);
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
      <div className="text-xs max-w-[250px] truncate">
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
];
