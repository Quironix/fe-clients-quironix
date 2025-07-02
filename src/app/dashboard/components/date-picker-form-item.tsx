import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Required from "@/components/ui/required";
import { cn, formatDate } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface DatePickerFormItemProps {
  field: any;
  title: string;
  required?: boolean;
  description?: string;
  onChange?: (field: any, value: any) => void;
}

export default function DatePickerFormItem({
  field,
  title,
  required,
  description,
  onChange,
}: DatePickerFormItemProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <FormItem>
      <FormLabel>
        {title}
        {required && <Required />}
      </FormLabel>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                formatDate(field.value || (new Date() as unknown as string))
              ) : (
                <span>Selecciona una fecha</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={(date) => {
              if (onChange) {
                onChange(field, date);
              } else {
                field.onChange(date?.toISOString());
              }
              setIsOpen(false);
            }}
            disabled={(date) => date < new Date("1900-01-01")}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>

      {description && <FormDescription>{description}</FormDescription>}

      <FormMessage />
    </FormItem>
  );
}
