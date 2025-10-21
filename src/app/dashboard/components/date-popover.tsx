"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { ControllerRenderProps } from "react-hook-form";

interface DatePopoverProps {
  field: ControllerRenderProps<any, any>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const DatePopover = ({
  field,
  label,
  placeholder = "DD-MM-AAAA",
  required = false,
  disabled = false,
}: DatePopoverProps) => {
  return (
    <FormItem>
      <FormLabel>
        {label} {required && <span className="text-red-500">*</span>}
      </FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              disabled={disabled}
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value
                ? format(field.value, "dd-MM-yyyy", {
                    locale: es,
                  })
                : placeholder}
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            locale={es}
            initialFocus
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
};
