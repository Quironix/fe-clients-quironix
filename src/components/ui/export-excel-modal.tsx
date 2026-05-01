"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Check, FileDown, FileSpreadsheet } from "lucide-react";
import { subMonths, startOfMonth, format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { exportExcel, ExportSchema, ExportStatus } from "@/services/reports";

interface ExportExcelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: ExportSchema;
  accessToken: string;
  clientId: string;
}

const STATUS_SCHEMAS: ExportSchema[] = ["INVOICES", "LITIGATION"];

const SCHEMA_LABELS: Record<ExportSchema, string> = {
  INVOICES: "Facturas",
  PROJECTION: "Proyección",
  LITIGATION: "Litigios",
  PAYMENT_PLANS: "Planes de pago",
  PAYMENTS: "Pagos",
  MANAGEMENTS: "Gestiones",
};

const MAX_SELECTION = 3;

interface MonthOption {
  key: string;
  label: string;
  date: Date;
  isCurrent: boolean;
}

function buildMonthOptions(): MonthOption[] {
  const now = new Date();
  const includeCurrentMonth = now.getDate() > 15;
  const startOffset = includeCurrentMonth ? 0 : 1;
  const options: MonthOption[] = [];

  for (let i = startOffset; i < startOffset + 6; i++) {
    const date = startOfMonth(subMonths(now, i));
    options.push({
      key: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy", { locale: es }),
      date,
      isCurrent: i === 0,
    });
  }

  return options;
}

function getRangeFromSelection(selected: string[], options: MonthOption[]): { from: Date; to: Date } {
  const sorted = [...selected].sort();
  const oldest = options.find((o) => o.key === sorted[0])!;
  const newest = options.find((o) => o.key === sorted[sorted.length - 1])!;

  const [fy, fm] = oldest.key.split("-").map(Number);
  const [ty, tm] = newest.key.split("-").map(Number);

  // Construir fechas en UTC puro para evitar que el offset de timezone
  // desplace el día al serializar con toISOString().
  const from = new Date(Date.UTC(fy, fm - 1, 1, 0, 0, 0, 0));

  const to = newest.isCurrent
    ? new Date(Date.UTC(ty, tm - 1, new Date().getUTCDate(), 23, 59, 59, 999))
    : new Date(Date.UTC(ty, tm, 0, 23, 59, 59, 999)); // día 0 del mes siguiente = último día del mes tm

  return { from, to };
}

function isContiguous(keys: string[]): boolean {
  if (keys.length <= 1) return true;
  const sorted = [...keys].sort();
  for (let i = 1; i < sorted.length; i++) {
    const [py, pm] = sorted[i - 1].split("-").map(Number);
    const [cy, cm] = sorted[i].split("-").map(Number);
    if ((cy * 12 + cm) - (py * 12 + pm) !== 1) return false;
  }
  return true;
}

// Determina si un mes puede ser agregado a la selección actual sin romper contigüidad
function canAdd(key: string, selected: string[]): boolean {
  if (selected.length === 0) return true;
  if (selected.length >= MAX_SELECTION) return false;
  return isContiguous([...selected, key]);
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ExportExcelModal({ open, onOpenChange, schema, accessToken, clientId }: ExportExcelModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<ExportStatus>("all");
  const [isLoading, setIsLoading] = useState(false);

  const showStatus = STATUS_SCHEMAS.includes(schema);
  const options = useMemo(() => buildMonthOptions(), [open]);

  const rangeLabel = useMemo(() => {
    if (selected.length === 0) return null;
    const { from, to } = getRangeFromSelection(selected, options);
    return `${format(from, "d MMM yyyy", { locale: es })} → ${format(to, "d MMM yyyy", { locale: es })}`;
  }, [selected, options]);

  const handleToggle = (key: string) => {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      const next = [...prev, key];
      if (!isContiguous(next)) {
        toast.error("Los meses deben ser consecutivos");
        return prev;
      }
      if (next.length > MAX_SELECTION) {
        toast.error(`Máximo ${MAX_SELECTION} meses`);
        return prev;
      }
      return next;
    });
  };

  const handleExport = async () => {
    if (selected.length === 0) { toast.error("Selecciona al menos un mes"); return; }
    setIsLoading(true);
    try {
      const { from, to } = getRangeFromSelection(selected, options);
      const { blob, filename } = await exportExcel({
        accessToken, clientId, schema,
        from: from.toISOString(),
        to: to.toISOString(),
        status: showStatus ? status : undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success("Archivo exportado correctamente");
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al exportar el archivo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!isLoading) {
      if (value) { setSelected([]); setStatus("all"); }
      onOpenChange(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border/60">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 shrink-0">
                <FileSpreadsheet className="h-[18px] w-[18px] text-orange-500" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold leading-tight">Exportar a Excel</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{SCHEMA_LABELS[schema]}</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Selector de meses */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-foreground">Período</span>
              <span className="text-xs text-muted-foreground">
                Selecciona entre 1 y 3 meses consecutivos
              </span>
            </div>

            <div className="flex flex-col divide-y divide-border/50 rounded-lg border border-border/60 overflow-hidden">
              {options.map((option) => {
                const isSelected = selected.includes(option.key);
                const addable = canAdd(option.key, selected);
                const disabled = !isSelected && !addable;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => !disabled && handleToggle(option.key)}
                    disabled={disabled}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors",
                      isSelected
                        ? "bg-blue-50 text-blue-700"
                        : disabled
                          ? "opacity-35 cursor-not-allowed bg-transparent"
                          : "bg-background hover:bg-muted/40 text-foreground cursor-pointer"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-4 h-4 rounded shrink-0 border transition-colors",
                      isSelected
                        ? "bg-blue-600 border-blue-600"
                        : "border-border bg-background"
                    )}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </div>

                    <span className="flex-1 font-medium">{capitalize(option.label)}</span>

                    {option.isCurrent && (
                      <span className="text-[10px] font-medium text-orange-500 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-full leading-none">
                        En curso
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Resumen del rango */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all duration-200",
              rangeLabel
                ? "bg-muted/50 border border-border/50 text-muted-foreground"
                : "opacity-0 pointer-events-none"
            )}>
              <span className="font-medium text-foreground">Rango:</span>
              <span className="tabular-nums">{rangeLabel ?? "—"}</span>
            </div>
          </div>

          {/* Estado (solo para INVOICES y LITIGATION) */}
          {showStatus && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-foreground">Estado</span>
              <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border/60">
                {(["all", "open", "closed"] as ExportStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      status === s
                        ? "bg-background text-foreground shadow-sm border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s === "all" ? "Todos" : s === "open" ? "Abiertos" : "Cerrados"}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <DialogFooter className="px-5 py-3 border-t border-border/60 bg-muted/10 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={isLoading || selected.length === 0}
            className="gap-1.5"
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileDown className="h-3.5 w-3.5" />
                Exportar
                {selected.length > 0 && (
                  <span className="ml-0.5 opacity-70">
                    ({selected.length} {selected.length === 1 ? "mes" : "meses"})
                  </span>
                )}
              </>
            )}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
