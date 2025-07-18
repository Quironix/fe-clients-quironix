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
import { BankMovementStatusEnum, PaymentNettingFilters } from "../types";

export interface FilterInputsRef {
  getCurrentFilters: () => PaymentNettingFilters;
}

const FilterInputs = React.forwardRef<
  FilterInputsRef,
  {
    onFilterChange?: (filters: PaymentNettingFilters) => void;
    initialFilters?: PaymentNettingFilters;
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

  const handleSubmit = (data: PaymentNettingFilters) => {
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
        <form className="w-full space-y-6" autoComplete="off">
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
                        {Object.entries(BankMovementStatusEnum).map(
                          ([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </FormProvider>
    </>
  );
});

FilterInputs.displayName = "FilterInputs";

export default FilterInputs;
