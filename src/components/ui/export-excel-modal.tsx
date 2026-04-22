"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarIcon, FileDown } from "lucide-react";
import { addMonths, startOfMonth, format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

function getDefaults(): { from: Date; to: Date } {
  const from = startOfMonth(new Date());
  return { from, to: addMonths(from, 3) };
}

interface DatePickerProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  fromDate?: Date;
  toDate?: Date;
}

function DatePicker({ label, value, onChange, fromDate, toDate }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-orange-400" />
            {value ? format(value, "PPP", { locale: es }) : "Selecciona una fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => { onChange(date); setOpen(false); }}
            fromDate={fromDate}
            toDate={toDate}
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ExportExcelModal({ open, onOpenChange, schema, accessToken, clientId }: ExportExcelModalProps) {
  const [from, setFrom] = useState<Date | undefined>(() => getDefaults().from);
  const [to, setTo] = useState<Date | undefined>(() => getDefaults().to);
  const [status, setStatus] = useState<ExportStatus>("all");
  const [isLoading, setIsLoading] = useState(false);

  const showStatus = STATUS_SCHEMAS.includes(schema);
  const maxTo = from ? addMonths(from, 3) : undefined;

  const handleFromChange = (date: Date | undefined) => {
    setFrom(date);
    setTo(undefined);
  };

  const handleExport = async () => {
    if (!from || !to) { toast.error("Selecciona un rango de fechas válido"); return; }
    setIsLoading(true);
    try {
      const { blob, filename } = await exportExcel({ accessToken, clientId, schema, from: from.toISOString(), to: to.toISOString(), status: showStatus ? status : undefined });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success("Archivo exportado correctamente");
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al exportar el archivo";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!isLoading) {
      if (value) { const d = getDefaults(); setFrom(d.from); setTo(d.to); setStatus("all"); }
      onOpenChange(value);
    }
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-50 bg-black/50" onClick={() => handleOpenChange(false)} />}
      <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
        <DialogContent className="sm:max-w-md z-50">
          <DialogHeader>
            <DialogTitle>Exportar datos</DialogTitle>
            <DialogDescription>
              Solo puedes exportar un rango máximo de 3 meses, independientemente del año.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <DatePicker label="Fecha desde" value={from} onChange={handleFromChange} toDate={to} />
            <DatePicker label="Fecha hasta" value={to} onChange={setTo} fromDate={from} toDate={maxTo} />

            {showStatus && (
              <div className="flex flex-col gap-1.5">
                <Label>Estado</Label>
                <div className="flex gap-2">
                  {(["all", "open", "closed"] as ExportStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium border transition-colors",
                        status === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {s === "all" ? "Todos" : s === "open" ? "Abiertos" : "Cerrados"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>Cancelar</Button>
            <Button onClick={handleExport} disabled={isLoading}>
              {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Exportando...</> : <><FileDown className="h-4 w-4 mr-2" />Exportar</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
