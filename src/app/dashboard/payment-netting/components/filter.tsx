import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { PaymentNettingFilters } from "../types";

const FilterInputs = ({
  handleFilterChange,
}: {
  handleFilterChange: (filters: PaymentNettingFilters) => void;
}) => {
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
      search: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    },
  });

  const handleSubmit = (data: PaymentNettingFilters) => {
    handleFilterChange(data);
  };

  return (
    <>
      <div className="w-full border-b border-gray-200 pb-4">
        <span className="text-sm font-bold text-gray-500">Filtros</span>
      </div>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full space-y-6"
          autoComplete="off"
        >
          <div className="">
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="dateFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desde</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 2025-01-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 2025-01-31" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </FormProvider>
    </>
  );
};

export default FilterInputs;
