"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormProvider, useForm } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import TitleStep from "@/app/dashboard/settings/components/title-step";
import { StepProps } from "@/app/dashboard/settings/types";
import Stepper from "@/components/Stepper";
import {
  CalendarClock,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { getCountries } from "@/app/services";
import { useProfileContext } from "@/context/ProfileContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { useDebtorsStore } from "@/app/dashboard/debtors/store";
import { toast } from "sonner";

const debtorFormSchema = z.object({
  attention_days_hours: z.array(
    z
      .object({
        day: z.string().optional(),
        hour_start: z.string().optional(),
        hour_end: z.string().optional(),
      })
      .superRefine((val, ctx) => {
        if (val.day) {
          if (!val.hour_start) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Campo requerido",
              path: ["hour_start"],
            });
          }
          if (!val.hour_end) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Campo requerido",
              path: ["hour_end"],
            });
          }
        }
      })
      .optional()
  ),
});

type DebtorFormValues = z.infer<typeof debtorFormSchema>;

// Función para generar las opciones de horario
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 8; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      times.push({
        value: timeString,
        label: timeString,
      });
    }
  }
  return times;
};

const AttentionStep: React.FC<StepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [countries, setCountries] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [openStartTimePopovers, setOpenStartTimePopovers] = useState<{
    [key: number]: boolean;
  }>({});
  const [openEndTimePopovers, setOpenEndTimePopovers] = useState<{
    [key: number]: boolean;
  }>({});
  const { dataDebtor, updateDebtor, setDataDebtor } = useDebtorsStore();
  const { session } = useProfileContext();

  const timeOptions = generateTimeOptions();

  const form = useForm<DebtorFormValues>({
    resolver: zodResolver(debtorFormSchema),
    mode: "onChange",
    defaultValues: {
      attention_days_hours: Array.isArray(dataDebtor?.attention_days_hours)
        ? dataDebtor.attention_days_hours
        : [],
    },
  });

  // Cargar países cuando el componente se monta
  useEffect(() => {
    const fetchCountries = async () => {
      if (!session?.token) return;

      try {
        const countriesData = await getCountries(session.token);
        setCountries(countriesData || []);
      } catch (error) {
        console.error("Error al cargar países:", error);
      }
    };

    fetchCountries();
  }, [session?.token]);

  const handleSubmit = async (data: DebtorFormValues): Promise<void> => {
    setSubmitAttempted(true);

    //elimina los elementos undefined de data.attention_days_hours
    data.attention_days_hours = data.attention_days_hours.filter(
      (item: any) => item.day !== undefined
    );

    try {
      console.log("Datos del deudor:", data);

      if (Object.keys(form.formState.errors).length > 0) {
        console.error("Hay errores en el formulario:", form.formState.errors);
        return;
      }

      if (data.attention_days_hours.length > 0 && dataDebtor?.id) {
        setDataDebtor({
          ...dataDebtor,
          attention_days_hours: data.attention_days_hours,
        });
        await updateDebtor(session?.token, profile?.client?.id, {
          id: dataDebtor?.id,
          attention_days_hours: data.attention_days_hours,
        });
      }
      if (onNext) {
        onNext();
      }
    } catch (error) {
      toast.error("Error al guardar el deudor");
      console.error("Error al guardar el deudor:", error);
    }
  };

  return (
    <section className="h-full">
      <div className="h-1/6">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={onStepChange}
        />
      </div>
      <div className="h-5/6 space-y-4 border border-gray-200 rounded-md p-5 overflow-y-auto">
        <TitleStep title="Atención" icon={<CalendarClock size={16} />} />
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full space-y-6"
            autoComplete="off"
          >
            <div className="grid gap-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Día</TableHead>
                        <TableHead>Hora de inicio</TableHead>
                        <TableHead>Hora de fin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        "Lunes",
                        "Martes",
                        "Miércoles",
                        "Jueves",
                        "Viernes",
                        "Sábado",
                        "Domingo",
                      ].map((day, index) => (
                        <TableRow key={day} className="align-middle">
                          <TableCell className="py-3">
                            <FormField
                              control={form.control}
                              name={`attention_days_hours.${index}.day`}
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                  <FormControl>
                                    <Checkbox
                                      id={`day-${index}`}
                                      checked={field.value === day}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked ? day : "");
                                        if (!checked) {
                                          form.setValue(
                                            `attention_days_hours.${index}.hour_start`,
                                            ""
                                          );
                                          form.setValue(
                                            `attention_days_hours.${index}.hour_end`,
                                            ""
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <label
                                    htmlFor={`day-${index}`}
                                    className="text-base font-semibold"
                                  >
                                    {day}
                                  </label>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="py-3">
                            <FormField
                              control={form.control}
                              name={`attention_days_hours.${index}.hour_start`}
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <Popover
                                    open={openStartTimePopovers[index] || false}
                                    onOpenChange={(open) =>
                                      setOpenStartTimePopovers((prev) => ({
                                        ...prev,
                                        [index]: open,
                                      }))
                                    }
                                  >
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          aria-expanded={
                                            openStartTimePopovers[index] ||
                                            false
                                          }
                                          className={cn(
                                            "w-full justify-between",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                          disabled={
                                            form.watch(
                                              `attention_days_hours.${index}.day`
                                            ) !== day
                                          }
                                        >
                                          {field.value || "Hora inicio"}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Buscar hora..." />
                                        <CommandEmpty>
                                          No se encontró la hora.
                                        </CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                          {timeOptions.map((time) => (
                                            <CommandItem
                                              key={time.value}
                                              value={time.value}
                                              onSelect={(currentValue) => {
                                                field.onChange(
                                                  currentValue === field.value
                                                    ? ""
                                                    : currentValue
                                                );
                                                setOpenStartTimePopovers(
                                                  (prev) => ({
                                                    ...prev,
                                                    [index]: false,
                                                  })
                                                );
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  field.value === time.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              {time.label}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="py-3">
                            <FormField
                              control={form.control}
                              name={`attention_days_hours.${index}.hour_end`}
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <Popover
                                    open={openEndTimePopovers[index] || false}
                                    onOpenChange={(open) =>
                                      setOpenEndTimePopovers((prev) => ({
                                        ...prev,
                                        [index]: open,
                                      }))
                                    }
                                  >
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          aria-expanded={
                                            openEndTimePopovers[index] || false
                                          }
                                          className={cn(
                                            "w-full justify-between",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                          disabled={
                                            form.watch(
                                              `attention_days_hours.${index}.day`
                                            ) !== day
                                          }
                                        >
                                          {field.value || "Hora fin"}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Buscar hora..." />
                                        <CommandEmpty>
                                          No se encontró la hora.
                                        </CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                          {timeOptions.map((time) => (
                                            <CommandItem
                                              key={time.value}
                                              value={time.value}
                                              onSelect={(currentValue) => {
                                                field.onChange(
                                                  currentValue === field.value
                                                    ? ""
                                                    : currentValue
                                                );
                                                setOpenEndTimePopovers(
                                                  (prev) => ({
                                                    ...prev,
                                                    [index]: false,
                                                  })
                                                );
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  field.value === time.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              {time.label}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {submitAttempted &&
                Object.keys(form.formState.errors).length > 0 && (
                  <div className="text-red-500 text-xs self-center mr-2">
                    Por favor, completa todos los campos requeridos
                  </div>
                )}

              <Button
                type="button"
                className="bg-white border-2 border-primary text-black hover:bg-white hover:text-gray-500"
                onClick={() => onBack()}
              >
                <ArrowLeft className="w-4 h-4 text-primary" /> Volver
              </Button>
              <Button
                type="submit"
                className="bg-blue-700 text-white"
                disabled={form.formState.isSubmitting}
                onClick={() => {
                  // Esto permite que se muestren los errores al hacer clic en el botón
                  if (Object.keys(form.formState.errors).length > 0) {
                    setSubmitAttempted(true);
                  }
                }}
              >
                {form.formState.isSubmitting ? "Guardando..." : "Continuar"}{" "}
                <ArrowRight className="w-4 h-4 text-white" />
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export default AttentionStep;
