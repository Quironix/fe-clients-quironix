import {
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
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import DatePickerFormItem from "../../components/date-picker-form-item";
import { LITIGATION_STATUS } from "../../data";
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
    search: z.string().optional(),
    status: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  });

  type FilterFormValues = z.infer<typeof filterSchema>;

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    mode: "onChange",
    defaultValues: {
      search: initialFilters?.search || "",
      status: initialFilters?.status || "PENDING",
      dateFrom: initialFilters?.dateFrom || "",
      dateTo: initialFilters?.dateTo || "",
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
        dateFrom: values.dateFrom
          ? new Date(values.dateFrom).toISOString().split("T")[0]
          : undefined,
        dateTo: values.dateTo
          ? new Date(values.dateTo).toISOString().split("T")[0]
          : undefined,
      };
    },
  }));

  return (
    <>
      <div className="w-full border-b border-gray-200 mb-4 pb-1">
        <span className="text-sm font-bold text-gray-500">Filtros</span>
      </div>
      <FormProvider {...form}>
        <form className="w-full space-y-3" autoComplete="off">
          <div className="space-y-2 grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="dateFrom"
              render={({ field }) => (
                <DatePickerFormItem field={field} title="Desde" required />
              )}
            />

            <FormField
              control={form.control}
              name="dateTo"
              render={({ field }) => (
                <DatePickerFormItem field={field} title="Hasta" required />
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>

                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
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
      </FormProvider>
    </>
  );
});

FilterInputs.displayName = "FilterInputs";

export default FilterInputs;
