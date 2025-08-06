import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { disputes, LITIGATION_STATUS } from "../../data";
import { LitigationFilters } from "../types";

export interface FilterInputsRef {
  getCurrentFilters: () => LitigationFilters;
}

const FilterInputs = React.forwardRef<
  FilterInputsRef,
  {
    onFilterChange?: (filters: LitigationFilters) => void;
    initialFilters?: LitigationFilters;
  }
>(({ onFilterChange, initialFilters }, ref) => {
  const filterSchema = z.object({
    motivo: z.string().optional(),
    status: z.string().optional(),
  });

  type FilterFormValues = z.infer<typeof filterSchema>;

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    mode: "onChange",
    defaultValues: {
      motivo: initialFilters?.motivo || "ALL",
      status: initialFilters?.status || "PENDING",
    },
  });

  const handleSubmit = (data: LitigationFilters) => {
    onFilterChange?.(data);
  };

  React.useImperativeHandle(ref, () => ({
    getCurrentFilters: () => {
      const values = form.getValues();
      return {
        ...values,
      };
    },
  }));

  return (
    <>
      <div className="w-full border-b border-gray-200 mb-4 pb-1">
        <span className="text-sm font-bold text-gray-500">Filtros</span>
      </div>
      <Form {...form}>
        <form className="w-full space-y-3" autoComplete="off">
          <FormField
            control={form.control}
            name="motivo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo</FormLabel>

                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "ALL"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos los motivos</SelectItem>
                      {disputes.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>

                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "ALL"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos los estados</SelectItem>
                      {LITIGATION_STATUS.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
});

FilterInputs.displayName = "FilterInputs";

export default FilterInputs;
