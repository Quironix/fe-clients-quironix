"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { ControllerRenderProps } from "react-hook-form";

interface TimePopoverProps {
  field: ControllerRenderProps<any, any>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  startHour?: number;
  endHour?: number;
  interval?: number;
}

const generateTimeOptions = (
  startHour: number = 8,
  endHour: number = 22,
  interval: number = 15
) => {
  const times = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      times.push({
        value: timeString,
        label: timeString,
      });
    }
  }
  return times;
};

export const TimePopover = ({
  field,
  label,
  placeholder = "Hora inicio",
  required = false,
  disabled = false,
  startHour = 8,
  endHour = 22,
  interval = 15,
}: TimePopoverProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const timeOptions = generateTimeOptions(startHour, endHour, interval);

  return (
    <FormItem className="flex flex-col">
      <FormLabel>
        {label} {required && <span className="text-red-500">*</span>}
      </FormLabel>
      <Popover open={open || false} onOpenChange={(isOpen) => setOpen(isOpen)}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open || false}
              disabled={disabled}
              className={cn(
                "w-full justify-between",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value || placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar hora..." />
            <CommandEmpty>No se encontró la hora.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {timeOptions.map((time) => (
                <CommandItem
                  key={time.value}
                  value={time.value}
                  onSelect={(currentValue) => {
                    field.onChange(
                      currentValue === field.value ? "" : currentValue
                    );
                    setOpen(!open);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      field.value === time.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {time.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
};
