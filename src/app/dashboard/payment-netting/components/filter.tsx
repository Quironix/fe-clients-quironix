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
import { useTranslations } from "next-intl";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import DatePickerFormItem from "../../components/date-picker-form-item";
import { PaymentNettingFilters } from "../types";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendiente" },
  { value: "COMPENSATED", label: "Compensado" },
  { value: "MULTIPLE_SUGGESTIONS", label: "Múltiples sugerencias" },
  { value: "ELIMINATED", label: "Eliminado" },
];

export interface FilterInputsRef {
  getCurrentFilters: () => PaymentNettingFilters;
  resetFilters: () => void;
}

const FilterInputs = React.forwardRef<
  FilterInputsRef,
  {
    onFilterChange?: (filters: PaymentNettingFilters) => void;
    initialFilters?: PaymentNettingFilters;
  }
>(({ onFilterChange, initialFilters }, ref) => {
  const t = useTranslations("paymentNetting.filters");
  const filterSchema = z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  });

  type FilterFormValues = z.infer<typeof filterSchema>;

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema) as any,
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

  React.useImperativeHandle(
    ref,
    () => ({
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
      resetFilters: () => {
        form.reset({
          search: "",
          status: "PENDING",
          dateFrom: "",
          dateTo: "",
        });
        onFilterChange?.({
          status: "PENDING",
        });
      },
    }),
    [form, onFilterChange],
  );

  return (
    <>
      <div className="w-full border-b border-gray-200 mb-4 pb-1">
        <span className="text-sm font-bold text-gray-500">{t("title")}</span>
      </div>
      <FormProvider {...form}>
        <form className="w-full space-y-3" autoComplete="off">
          <div className="space-y-2 grid grid-cols-2 gap-2 flex justify-between items-start">
            <FormField
              control={form.control}
              name="dateFrom"
              render={({ field }) => (
                <DatePickerFormItem field={field} title={t("from")} required />
              )}
            />

            <FormField
              control={form.control}
              name="dateTo"
              render={({ field }) => (
                <DatePickerFormItem field={field} title={t("to")} required />
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("status")}</FormLabel>

                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
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
