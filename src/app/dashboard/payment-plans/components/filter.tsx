import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { BankMovementStatusEnum, PaymentPlansFilters } from "../types";
import { Checkbox } from "@/components/ui/checkbox";

export interface FilterInputsRef {
  getCurrentFilters: () => PaymentPlansFilters;
}

const FilterInputs = React.forwardRef<
  FilterInputsRef,
  {
    onFilterChange?: (filters: PaymentPlansFilters) => void;
    initialFilters?: PaymentPlansFilters;
  }
>(({ onFilterChange, initialFilters }, ref) => {
  const filterSchema = z.object({
    search: z.string().optional(),
    status: z.array(z.string()).optional(),
  });

  type FilterFormValues = z.infer<typeof filterSchema>;

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    mode: "onChange",
    defaultValues: {
      search: initialFilters?.search || "",
      status: initialFilters?.status
      ? Array.isArray(initialFilters.status)
        ? initialFilters.status
        : [initialFilters.status]
      : []
    },
  });

  const handleSubmit = (data: PaymentPlansFilters) => {
    onFilterChange?.(data);
  };
  const handleCheckboxChange = (value: string) => {
    const current = form.getValues("status") || [];
    if (current.includes(value)) {
      form.setValue(
        "status",
        current.filter((v) => v !== value)
      );
    } else {
      form.setValue("status", [...current, value]);
    }
  };


  React.useImperativeHandle(ref, () => ({
    getCurrentFilters: () => {
      const values = form.getValues();
      return {
        ...values,
        status: values.status && values.status.length > 0 ? values.status : undefined,
      };
    },
  }));

  return (
    <>
      <div className="w-full border-b border-gray-200 mb-4 pb-1">
        <span className="text-sm font-bold text-gray-500">Estado</span>
      </div>
      <FormProvider {...form}>
        <form className="w-full space-y-3" autoComplete="off">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>

                <FormControl>
                <div className="space-y-2">
                {Object.entries(BankMovementStatusEnum).map(([key, label]) => {
  const checked = form.watch("status")?.includes(key) || false;
  return (
    <FormControl key={key}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={key}
          checked={checked}
          onCheckedChange={(checked) => {
            const current = form.getValues("status") || [];
            if (checked) {
              form.setValue("status", [...current, key]);
            } else {
              form.setValue(
                "status",
                current.filter((v) => v !== key)
              );
            }
          }}
        />
        <label htmlFor={key} className="text-sm cursor-pointer select-none">
          {label}
        </label>
      </div>
    </FormControl>
  );
})}
                </div>
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
