"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  allLabel: string;
  searchPlaceholder: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

/** Selector de varios valores: vacío = todos. */
const MultiSelect = ({
  allLabel,
  searchPlaceholder,
  options,
  selected,
  onChange,
}: MultiSelectProps) => {
  const labelOf = (value: string) =>
    options.find((o) => o.value === value)?.label ?? value;
  const text =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? labelOf(selected[0])
        : `${labelOf(selected[0])} +${selected.length - 1}`;

  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 w-52 justify-between font-normal",
            selected.length === 0 && "text-muted-foreground",
          )}
          aria-label={allLabel}
        >
          <span className="truncate">{text}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>Sin resultados</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  // El id evita choques entre nombres iguales; el buscador igual filtra por el nombre.
                  value={`${option.label} ${option.value}`}
                  onSelect={() => toggle(option.value)}
                  className="gap-2"
                >
                  <Checkbox
                    checked={selected.includes(option.value)}
                    // CommandItem pinta de gris sus íconos; el ✓ debe quedar blanco como en las tablas.
                    className="pointer-events-none [&_svg]:!text-primary-foreground"
                  />
                  <span
                    className={cn(
                      "truncate",
                      selected.includes(option.value) && "font-medium",
                    )}
                  >
                    {option.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {selected.length > 0 && (
            <div className="border-t p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onChange([])}
              >
                Limpiar selección
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelect;
