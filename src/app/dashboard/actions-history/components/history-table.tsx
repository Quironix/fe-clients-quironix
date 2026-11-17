"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatDateTime } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { ChevronDown, ChevronRight, KeyRound } from "lucide-react";
import { Fragment, useState } from "react";
import LoaderTable from "../../components/loader-table";
import {
  ACTION_LABELS,
  ACTION_TONES,
  MODULE_LABELS,
  changeEntries,
  describeEntry,
} from "../labels";
import { AuditLog } from "../services";
import { ChangeView } from "./change-view";

const TZ = "America/Santiago";
const COLS = 7;

const dayKey = (date: Date) => formatInTimeZone(date, TZ, "yyyy-MM-dd");

const dayLabel = (key: string) => {
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 86_400_000));
  if (key === today) return "Hoy";
  if (key === yesterday) return "Ayer";
  const text = formatInTimeZone(
    new Date(`${key}T12:00:00Z`),
    TZ,
    "EEEE d 'de' MMMM",
    {
      locale: es,
    },
  );
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const Actor = ({ log }: { log: AuditLog }) => (
  <span className="flex min-w-0 items-center gap-2" title={log.actor_name}>
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
      {log.actor_type === "client_api_key" ? (
        <KeyRound className="h-3.5 w-3.5" />
      ) : (
        initials(log.actor_name)
      )}
    </span>
    <span className="truncate">{log.actor_name}</span>
  </span>
);

const ActionBadge = ({ action }: { action: string }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
      ACTION_TONES[action] ?? "bg-muted text-foreground ring-border",
    )}
  >
    {ACTION_LABELS[action] ?? action}
  </span>
);

interface HistoryTableProps {
  items: AuditLog[];
  loading: boolean;
}

const HistoryTable = ({ items, loading }: HistoryTableProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  let lastDay = "";

  return (
    // Ancho fijo: la tabla nunca pasa del contenedor; lo largo se corta y se ve al expandir.
    <Table className="w-full table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead className="w-28">Hora</TableHead>
          <TableHead className="w-44">Usuario</TableHead>
          <TableHead className="w-36">Módulo</TableHead>
          <TableHead className="w-32">Acción</TableHead>
          <TableHead className="w-[26%]">Registro</TableHead>
          <TableHead>Cambios</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading && items.length === 0 && <LoaderTable cols={COLS} />}
        {!loading && items.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={COLS}
              className="py-14 text-center text-sm text-muted-foreground"
            >
              No hay acciones registradas con estos filtros.
            </TableCell>
          </TableRow>
        )}
        {items.map((log) => {
          const created = new Date(log.created_at);
          const day = dayKey(created);
          const showDay = day !== lastDay;
          lastDay = day;

          const entries = changeEntries(log);
          const canExpand = entries.length > 0;
          const isOpen = expanded === log.id;
          return (
            <Fragment key={log.id}>
              {showDay && (
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableCell
                    colSpan={COLS}
                    className="py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {dayLabel(day)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow
                className={cn(
                  canExpand && "cursor-pointer",
                  isOpen && "bg-muted/30",
                )}
                onClick={() => canExpand && setExpanded(isOpen ? null : log.id)}
              >
                <TableCell className="text-muted-foreground">
                  {canExpand &&
                    (isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    ))}
                </TableCell>
                <TableCell title={formatDateTime(log.created_at)}>
                  <div className="font-medium">
                    {formatInTimeZone(created, TZ, "HH:mm")}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(created, {
                      locale: es,
                      addSuffix: true,
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <Actor log={log} />
                </TableCell>
                <TableCell className="truncate text-muted-foreground">
                  {MODULE_LABELS[log.module] ?? log.module}
                </TableCell>
                <TableCell>
                  <ActionBadge action={log.action} />
                </TableCell>
                <TableCell
                  className="truncate font-medium"
                  title={log.entity_label}
                >
                  {log.entity_label}
                </TableCell>
                <TableCell title={entries.map(describeEntry).join("\n")}>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 truncate">
                      {entries[0] ? (
                        <ChangeView entry={entries[0]} compact />
                      ) : (
                        "—"
                      )}
                    </span>
                    {entries.length > 1 && (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        +{entries.length - 1}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {isOpen && (
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell />
                  <TableCell
                    colSpan={COLS - 1}
                    className="whitespace-normal pb-4"
                  >
                    <ul className="space-y-2 text-sm">
                      {entries.map((entry) => (
                        <li key={entry.field}>
                          <ChangeView entry={entry} />
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default HistoryTable;
