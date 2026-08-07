"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, formatDateTime, formatDateTimeUTC, formatNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Eye, Link2 } from "lucide-react";
import { useState } from "react";
import { DEBTOR_COMMENTS, getChannelTypeLabel, getExecutiveCommentLabel } from "../../../config/management-types";
import { InvoiceWithTrack } from "../../../types/debtor-tracks";

// Clases literales (no interpoladas) para que Tailwind las detecte en build.
const THREAD_TAG_CLASSES: Record<string, string> = {
  amber: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  purple: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  pink: "bg-pink-100 text-pink-700 hover:bg-pink-200",
  cyan: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
  indigo: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  rose: "bg-rose-100 text-rose-700 hover:bg-rose-200",
};

const OBSERVATION_TRUNCATE_LENGTH = 53;

const ObservationText = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return <>-</>;
  if (text.length <= OBSERVATION_TRUNCATE_LENGTH) return <>{text}</>;

  return (
    <>
      {expanded ? text : `${text.slice(0, OBSERVATION_TRUNCATE_LENGTH)}...`}{" "}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        title={expanded ? "Ver menos" : "Ver más"}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 align-text-bottom"
      >
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
    </>
  );
};


const getDebtorCommentLabel = (comment: string): string => {
  const found = DEBTOR_COMMENTS.find((c) => c.value === comment);
  return found?.label || comment;
};

const INBOUND_TYPES = new Set(["MAIL_IN", "CALL_IN"]);
const OUTBOUND_TYPES = new Set(["MAIL_OUT", "MAIL_OUT_REPLY", "CALL_OUT"]);
// Filas sintéticas de correo (armadas en frontend, sin gestión/Track propia):
// entrante (MAIL_IN) y respuestas salientes dentro de un hilo (MAIL_OUT_REPLY).
// Se tratan igual que MAIL_IN para comentarios vacíos y mostrar subject/body.
const SYNTHETIC_EMAIL_TYPES = new Set(["MAIL_IN", "MAIL_OUT_REPLY"]);

const getManagementTypeBadgeClass = (type: string) => {
  if (INBOUND_TYPES.has(type)) {
    return "border-emerald-600 text-emerald-600";
  }
  if (OUTBOUND_TYPES.has(type)) {
    return "border-blue-600 text-blue-600";
  }
  if (type === "AUTOMATED_COLLECTOR" || type === "AUTOMATED_COLLECTOR_SENT") {
    return "border-gray-400 text-gray-500";
  }
  return "border-blue-600 text-blue-600";
};

const getManagementTypeBadge = (type: string) => {
  return (
    <div
      className={`border px-3 text-center rounded-full text-xs ${getManagementTypeBadgeClass(type)}`}
    >
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
  threadColorByTrackId?: Map<string, string>,
  onOpenThread?: (trackId: string) => void,
): ColumnDef<InvoiceWithTrack>[] => [
    {
      accessorKey: "debtor_code",
      header: "Código Deudor",
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {row.original.debtor_code || "-"}
        </div>
      ),
    },
    {
      accessorKey: "documentNumber",
      header: "N° Documento",
      cell: ({ row }) => {
        const batchInvoiceNumbers = row.original.batchInvoiceNumbers;
        if (batchInvoiceNumbers && batchInvoiceNumbers.length > 1) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-medium text-sm underline decoration-dotted cursor-default w-fit">
                  {batchInvoiceNumbers.length} facturas asociadas
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {batchInvoiceNumbers.join(", ")}
              </TooltipContent>
            </Tooltip>
          );
        }
        return (
          <div className="font-medium text-sm">
            {row.original.number || row.original.external_number || "-"}
          </div>
        );
      },
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
          {formatDateTimeUTC(row.original.track?.createdAt)}
        </div>
      ),
    },
    {
      accessorKey: "managementType",
      header: "Tipo de Gestión",
      cell: ({ row }) => {
        const trackId = row.original.track?.id;
        const threadColor = trackId
          ? threadColorByTrackId?.get(trackId)
          : undefined;
        return (
          <div className="flex items-center gap-1.5">
            {getManagementTypeBadge(row.original.track?.managementType)}
            {threadColor && trackId && (
              <button
                type="button"
                onClick={() => onOpenThread?.(trackId)}
                title="Ver hilo completo del correo"
                className={`flex items-center justify-center h-5 w-5 rounded-full transition-colors ${THREAD_TAG_CLASSES[threadColor] ?? "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                <Link2 className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      },
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
      cell: ({ row }) => {
        if (SYNTHETIC_EMAIL_TYPES.has(row.original.track?.managementType || "")) {
          return <div className="text-xs">-</div>;
        }
        return (
          <div className="text-xs max-w-[200px] truncate">
            {getDebtorCommentLabel(row.original.track?.debtorComment)}
          </div>
        );
      },
    },
    {
      accessorKey: "executiveComment",
      header: "Comentario Analista",
      cell: ({ row }) => {
        if (SYNTHETIC_EMAIL_TYPES.has(row.original.track?.managementType || "")) {
          return <div className="text-xs">-</div>;
        }
        return (
          <div className="text-xs max-w-[200px] truncate">
            {getExecutiveCommentLabel(row.original.track?.executiveComment)}
          </div>
        );
      },
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
      size: 350,
      cell: ({ row }) => {
        const track = row.original.track;
        const isSyntheticEmail = SYNTHETIC_EMAIL_TYPES.has(
          track?.managementType || "",
        );
        return (
          <div className="text-xs w-[350px] whitespace-normal break-words space-y-1">
            {isSyntheticEmail && track?.emailSubject && (
              <div className="font-semibold">{track.emailSubject}</div>
            )}
            <div>
              <ObservationText
                text={
                  isSyntheticEmail
                    ? track?.emailBody || ""
                    : track?.observation || ""
                }
              />
            </div>
          </div>
        );
      },
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
      accessorKey: "collectorName",
      header: "Collector",
      cell: ({ row }) => {
        if (row.original.track?.caseData?.debtorComment !== "AUTOMATED_COLLECTOR_SENT") {
          return <div className="text-sm">-</div>;
        }
        const name = row.original.track?.caseData?.collector?.name;
        return <div className="text-sm">{name || "-"}</div>;
      },
    },
    {
      accessorKey: "collectorChannel",
      header: "Canal",
      cell: ({ row }) => {
        if (row.original.track?.caseData?.debtorComment !== "AUTOMATED_COLLECTOR_SENT") {
          return <div className="text-sm">-</div>;
        }
        const CHANNEL_LABELS: Record<string, string> = {
          EMAIL: "Email",
          SMS: "Mensaje de texto",
          WHATSAPP: "Whatsapp",
        };
        const channel = row.original.track?.caseData?.collector?.channel;
        return <div className="text-sm">{channel ? (CHANNEL_LABELS[channel] ?? channel) : "-"}</div>;
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        // Los correos entrantes solo tienen detalle de track si el backend
        // logró vincularlos automáticamente a la gestión que los originó
        // (ver PRD §17). Si no hay track_id, no hay nada que abrir.
        if (row.original.type === "EMAIL_REPLY" && !row.original.track?.id) {
          return null;
        }
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails?.(row.original)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];
