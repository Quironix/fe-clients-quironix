"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import Language from "@/components/ui/language";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProfileContext } from "@/context/ProfileContext";
import { cn, formatDateTime } from "@/lib/utils";
import { addDays, format, startOfDay, subDays } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { CalendarDays, Download, History, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { getAll as getUsers } from "../users/services";
import HistoryTable from "./components/history-table";
import MultiSelect from "./components/multi-select";
import { ACTION_LABELS, MODULE_LABELS, describeChanges } from "./labels";
import { ActionsHistoryFilters, AuditLog, getActionsHistory } from "./services";

const TZ = "America/Santiago";
const SEARCH_DELAY_MS = 350;
const EXPORT_PAGE = 500;
const EXPORT_MAX = 50000;

const PRESETS: { label: string; range: () => DateRange }[] = [
  {
    label: "Hoy",
    range: () => ({ from: startOfDay(new Date()), to: startOfDay(new Date()) }),
  },
  {
    label: "Últimos 7 días",
    range: () => ({
      from: subDays(startOfDay(new Date()), 6),
      to: startOfDay(new Date()),
    }),
  },
  {
    label: "Últimos 30 días",
    range: () => ({
      from: subDays(startOfDay(new Date()), 29),
      to: startOfDay(new Date()),
    }),
  },
];

// El calendario elige días de Chile; el backend recibe instantes.
const chileDayStart = (date: Date) =>
  fromZonedTime(`${format(date, "yyyy-MM-dd")}T00:00:00`, TZ);

const rangeLabel = (range?: DateRange) => {
  if (!range?.from) return "Cualquier fecha";
  const from = format(range.from, "d MMM", { locale: es });
  const to = range.to ? format(range.to, "d MMM", { locale: es }) : from;
  return from === to ? from : `${from} – ${to}`;
};

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

const toCsv = (items: AuditLog[]) =>
  [
    ["Fecha y hora", "Usuario", "Módulo", "Acción", "Registro", "Cambios"],
    ...items.map((log) => [
      formatDateTime(log.created_at),
      log.actor_name,
      MODULE_LABELS[log.module] ?? log.module,
      ACTION_LABELS[log.action] ?? log.action,
      log.entity_label,
      describeChanges(log).join(" | "),
    ]),
  ]
    .map((row) => row.map(csvCell).join(";"))
    .join("\n");

const FilterChip = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <span className="inline-flex items-center gap-1 rounded-full border bg-primary/5 py-1 pl-3 pr-1 text-xs font-medium text-primary">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="rounded-full p-0.5 hover:bg-primary/10"
      aria-label={`Quitar filtro ${label}`}
    >
      <X className="h-3.5 w-3.5" />
    </button>
  </span>
);

const ActionsHistoryPage = () => {
  const { profile, session } = useProfileContext();
  const token = session?.token;
  const clientId = profile?.client?.id;

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [actorIds, setActorIds] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [range, setRange] = useState<DateRange | undefined>();
  const [dateOpen, setDateOpen] = useState(false);

  const [items, setItems] = useState<AuditLog[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [users, setUsers] = useState<
    { id: string; first_name: string; last_name: string }[]
  >([]);
  const lastRequest = useRef(0);

  // Busca sola mientras se escribe, sin botón.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [q]);

  const filters = useMemo<ActionsHistoryFilters>(
    () => ({
      // Varios valores del mismo filtro van separados por coma (se combinan con O).
      actor_id: actorIds.join(",") || undefined,
      module: modules.join(",") || undefined,
      action: actions.join(",") || undefined,
      from: range?.from ? chileDayStart(range.from).toISOString() : undefined,
      to: range?.from
        ? addDays(chileDayStart(range.to ?? range.from), 1).toISOString()
        : undefined,
      q: debouncedQ || undefined,
    }),
    [actorIds, modules, actions, range, debouncedQ],
  );

  const load = useCallback(
    async (next: ActionsHistoryFilters, after: string | null) => {
      if (!token || !clientId) return;
      // Si cambian los filtros mientras carga, solo vale la última respuesta.
      const request = ++lastRequest.current;
      setLoading(true);
      try {
        const page = await getActionsHistory(token, clientId, next, after);
        if (request !== lastRequest.current) return;
        setItems((prev) => (after ? [...prev, ...page.items] : page.items));
        setCursor(page.next_cursor);
      } catch (error) {
        toast.error("Error", { description: (error as Error).message });
      } finally {
        if (request === lastRequest.current) setLoading(false);
      }
    },
    [token, clientId],
  );

  useEffect(() => {
    load(filters, null);
  }, [load, filters]);

  useEffect(() => {
    if (!token || !clientId) return;
    getUsers(token, clientId)
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, [token, clientId]);

  const userName = (id: string) => {
    const user = users.find((u) => u.id === id);
    return user ? `${user.first_name} ${user.last_name}`.trim() : "Usuario";
  };

  const without = (list: string[], value: string) =>
    list.filter((v) => v !== value);

  // Un chip por cada valor elegido: se puede quitar uno sin abrir el selector.
  const chips = [
    debouncedQ && { key: "q", label: `“${debouncedQ}”`, clear: () => setQ("") },
    ...actorIds.map((id) => ({
      key: `u-${id}`,
      label: userName(id),
      clear: () => setActorIds((prev) => without(prev, id)),
    })),
    ...modules.map((m) => ({
      key: `m-${m}`,
      label: MODULE_LABELS[m] ?? m,
      clear: () => setModules((prev) => without(prev, m)),
    })),
    ...actions.map((a) => ({
      key: `a-${a}`,
      label: ACTION_LABELS[a] ?? a,
      clear: () => setActions((prev) => without(prev, a)),
    })),
    range?.from && {
      key: "range",
      label: rangeLabel(range),
      clear: () => setRange(undefined),
    },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const clearAll = () => {
    setQ("");
    setActorIds([]);
    setModules([]);
    setActions([]);
    setRange(undefined);
  };

  const onExport = async () => {
    if (!token || !clientId) return;
    setExporting(true);
    try {
      const all: AuditLog[] = [];
      let after: string | null = null;
      do {
        const page = await getActionsHistory(
          token,
          clientId,
          filters,
          after,
          EXPORT_PAGE,
        );
        all.push(...page.items);
        after = page.next_cursor;
      } while (after && all.length < EXPORT_MAX);

      if (after) {
        toast.warning("Exportación parcial", {
          description: `Se exportaron las ${EXPORT_MAX.toLocaleString("es-CL")} acciones más recientes. Acota las fechas para exportar el resto.`,
        });
      }

      const blob = new Blob([`﻿${toCsv(all)}`], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `historial-de-acciones-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error", { description: (error as Error).message });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Historial de acciones"
          description="Quién cambió qué en la plataforma: ediciones, borrados y acciones sensibles hechas por personas."
          icon={<History color="white" />}
          subDescription="Usuarios"
        />

        <div className="mt-4 rounded-xl border bg-card p-3 shadow-sm">
          {/* Fila 1: buscador a todo el ancho; fila 2: filtros. Nada cambia de lugar al escribir. */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-10 pl-9 pr-9"
                placeholder="Buscar por deudor, factura, rol o usuario…"
                aria-label="Buscar"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className="h-10 shrink-0"
              onClick={onExport}
              disabled={exporting || items.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "Exportando…" : "Exportar CSV"}
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <MultiSelect
              allLabel="Todos los usuarios"
              searchPlaceholder="Buscar usuario…"
              options={users.map((u) => ({
                value: u.id,
                label: `${u.first_name} ${u.last_name}`.trim(),
              }))}
              selected={actorIds}
              onChange={setActorIds}
            />
            <MultiSelect
              allLabel="Todos los módulos"
              searchPlaceholder="Buscar módulo…"
              options={Object.entries(MODULE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              selected={modules}
              onChange={setModules}
            />
            <MultiSelect
              allLabel="Todas las acciones"
              searchPlaceholder="Buscar acción…"
              options={Object.entries(ACTION_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              selected={actions}
              onChange={setActions}
            />

            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-10 w-44 justify-start font-normal",
                    !range?.from && "text-muted-foreground",
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {rangeLabel(range)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex w-auto p-0" align="end">
                <div className="flex flex-col gap-1 border-r p-3">
                  {PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        setRange(preset.range());
                        setDateOpen(false);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-muted-foreground"
                    onClick={() => {
                      setRange(undefined);
                      setDateOpen(false);
                    }}
                  >
                    Cualquier fecha
                  </Button>
                </div>
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={2}
                  locale={es}
                  disabled={{ after: new Date() }}
                  defaultMonth={range?.from ?? subDays(new Date(), 30)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
              <span className="text-xs text-muted-foreground">
                Filtrando por
              </span>
              {chips.map((chip) => (
                <FilterChip
                  key={chip.key}
                  label={chip.label}
                  onRemove={chip.clear}
                />
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="ml-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </div>

        <div
          className={cn(
            "mt-4 flex-1 overflow-hidden rounded-xl border bg-card transition-opacity",
            loading && items.length > 0 && "opacity-60",
          )}
        >
          <HistoryTable items={items} loading={loading} />
          {cursor && (
            <div className="flex justify-center border-t py-3">
              <Button
                variant="ghost"
                onClick={() => load(filters, cursor)}
                disabled={loading}
              >
                {loading ? "Cargando…" : "Cargar más"}
              </Button>
            </div>
          )}
        </div>
      </Main>
    </>
  );
};

export default ActionsHistoryPage;
