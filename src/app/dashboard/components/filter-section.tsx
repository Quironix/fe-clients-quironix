"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FilterConfig, FilterField } from "./types/sheet-types";

interface FilterSectionProps {
  config: FilterConfig;
  initialValues?: Record<string, any>;
}

export function FilterSection({ config, initialValues = {} }: FilterSectionProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    ...config.defaultValues,
    ...initialValues,
  });

  const handleFieldChange = (fieldId: string, value: any) => {
    setFilterValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleApply = () => {
    config.onApply(filterValues);
  };

  const handleReset = () => {
    setFilterValues(config.defaultValues);
    config.onReset();
  };

  const renderField = (field: FilterField) => {
    const value = filterValues[field.id];

    switch (field.type) {
      case 'select':
        return (
          <Select
            value={value || ""}
            onValueChange={(newValue) => handleFieldChange(field.id, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Seleccionar ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(value, "PPP") : field.placeholder || "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => handleFieldChange(field.id, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'text':
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value) || 0)}
            placeholder={field.placeholder}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <h3 className="text-sm font-medium text-foreground">Filtros</h3>
      </div>

      {config.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id} className="text-sm">
            {field.label}
          </Label>
          {renderField(field)}
        </div>
      ))}

      <div className="flex gap-2 pt-4">
        <Button onClick={handleApply} className="flex-1">
          Aplicar filtros
        </Button>
        <Button onClick={handleReset} variant="outline">
          Resetear
        </Button>
      </div>
    </div>
  );
}