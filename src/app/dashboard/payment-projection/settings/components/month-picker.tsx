"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const MONTHS_FULL = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface MonthPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [open, setOpen] = useState(false);

  const currentDate = new Date();
  const parsedYear = value ? parseInt(value.split("-")[0]) : currentDate.getFullYear();
  const parsedMonth = value ? parseInt(value.split("-")[1]) - 1 : null;

  const [displayYear, setDisplayYear] = useState(parsedYear);

  const handleSelect = (monthIndex: number) => {
    const month = String(monthIndex + 1).padStart(2, "0");
    onChange(`${displayYear}-${month}`);
    setOpen(false);
  };

  const label = value
    ? `${MONTHS_FULL[parsedMonth!]} ${parsedYear}`
    : "Seleccionar período";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setDisplayYear((y) => y - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">{displayYear}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setDisplayYear((y) => y + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {MONTHS.map((month, index) => {
            const isSelected =
              parsedMonth === index && parsedYear === displayYear;
            return (
              <Button
                key={month}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleSelect(index)}
              >
                {month}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
