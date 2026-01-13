import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { useState } from "react";

interface KPIDateFilterProps {
  onDateChange: (from?: Date, to?: Date) => void;
}

export const KPIDateFilter = ({ onDateChange }: KPIDateFilterProps) => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const handleFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    onDateChange(date, dateTo);
  };

  const handleToChange = (date: Date | undefined) => {
    setDateTo(date);
    onDateChange(dateFrom, date);
  };

  const handleClear = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    onDateChange(undefined, undefined);
  };

  return (
    <Card className="border-2 border-blue-100 shadow-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-orange-500" />
            Filtrar por Fecha
          </CardTitle>
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 text-xs hover:bg-red-50 hover:text-red-600"
            >
              <XIcon className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Desde</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateFrom && "text-gray-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? (
                  format(dateFrom, "PPP", { locale: es })
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={handleFromChange}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Hasta</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateTo && "text-gray-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? (
                  format(dateTo, "PPP", { locale: es })
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={handleToChange}
                initialFocus
                locale={es}
                disabled={(date) =>
                  dateFrom ? date < dateFrom : false
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        {dateFrom && dateTo && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Mostrando datos del{" "}
              <span className="font-semibold">
                {format(dateFrom, "d MMM", { locale: es })}
              </span>{" "}
              al{" "}
              <span className="font-semibold">
                {format(dateTo, "d MMM yyyy", { locale: es })}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
