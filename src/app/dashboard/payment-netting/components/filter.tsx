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
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import DatePickerFormItem from "../../components/date-picker-form-item";
import { usePaymentNetting } from "../hooks/usePaymentNetting";
import { BankMovementStatusEnum, PaymentNettingFilters } from "../types";

const FilterInputs = () => {
  const { filters } = usePaymentNetting();
  const filterSchema = z.object({
    search: z.string().optional(),
    status: z.string().optional(), // Cambiar a string para aceptar las keys del enum
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  });

  type FilterFormValues = z.infer<typeof filterSchema>;

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    mode: "onChange",
    defaultValues: {
      search: "",
      status: "PENDING", // Usar la key del enum directamente
      dateFrom: "",
      dateTo: "",
    },
  });

  const handleSubmit = (data: PaymentNettingFilters) => {
    console.log(data);
  };

  return (
    <>
      <div className="w-full border-b border-gray-200 mb-4 pb-1">
        <span className="text-sm font-bold text-gray-500">Filtros</span>
      </div>
      <FormProvider {...form}>
        <form
          onChange={form.handleSubmit(handleSubmit)}
          className="w-full space-y-6"
          autoComplete="off"
        >
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
                            <SelectItem
                              key={key}
                              value={key} // Usar la key directamente sin transformación
                            >
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
};

export default FilterInputs;
