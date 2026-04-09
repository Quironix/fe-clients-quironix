"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";

const MONTH_NAMES_API = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const toPeriodString = (month: number, year: number): string =>
  `${MONTH_NAMES_API[month]}-${year}`;

const parseValue = (value: string | null): { month: number; year: number } | null => {
  if (!value) return null;
  const [monthName, year] = value.split("-");
  const month = MONTH_NAMES_API.indexOf(monthName);
  if (month === -1 || !year) return null;
  return { month, year: parseInt(year) };
};

const formatDisplay = (value: string | null): string => {
  const parsed = parseValue(value);
  if (!parsed) return "Filtrar por período";
  return `${MONTH_LABELS[parsed.month]} ${parsed.year}`;
};

interface KPIPeriodFilterProps {
  value: string | null;
  onChange: (period: string | null) => void;
}

export const KPIPeriodFilter = ({ value, onChange }: KPIPeriodFilterProps) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const parsed = parseValue(value);
  const [viewYear, setViewYear] = useState(parsed?.year ?? currentYear);
  const [open, setOpen] = useState(false);

  const isFuture = (month: number, year: number): boolean =>
    year > currentYear || (year === currentYear && month > currentMonth);

  const handleSelect = (month: number) => {
    if (isFuture(month, viewYear)) return;
    onChange(toPeriodString(month, viewYear));
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <CalendarDays size={14} className="text-gray-400" />
          <span className={value ? "text-gray-800" : "text-gray-400"}>
            {formatDisplay(value)}
          </span>
          {value && (
            <X
              size={13}
              className="text-gray-400 hover:text-gray-600 ml-1"
              onClick={handleClear}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setViewYear((y) => y - 1)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-800">{viewYear}</span>
          <button
            onClick={() => setViewYear((y) => y + 1)}
            disabled={viewYear >= currentYear}
            className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {MONTH_LABELS.map((label, index) => {
            const disabled = isFuture(index, viewYear);
            const selected =
              parsed?.month === index && parsed?.year === viewYear;

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={disabled}
                className={cn(
                  "px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                  selected
                    ? "bg-orange-500 text-white"
                    : disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { onChange(null); setOpen(false); }}
            className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600"
          >
            Limpiar filtro
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};
