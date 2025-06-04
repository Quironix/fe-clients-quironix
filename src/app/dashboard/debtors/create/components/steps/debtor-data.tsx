"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormProvider, useForm } from "react-hook-form";
import {
  FormMessage,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TitleStep from "@/app/dashboard/settings/components/title-step";
import { StepProps } from "@/app/dashboard/settings/types";
import Stepper from "@/components/Stepper";
import { FileText, Plus, Minus } from "lucide-react";
import { Debtor } from "@/app/dashboard/debtors/types";
import { Checkbox } from "@/components/ui/checkbox";
import { getCountries } from "@/app/services";
import { useProfileContext } from "@/context/ProfileContext";
import { categories } from "@/app/dashboard/data";
import InputNumberCart from "@/components/ui/input-number-cart";
import Required from "@/components/ui/required";
import { DialogClose } from "@/components/ui/dialog";
import { SearchInput } from "@/components/ui/search-input";

const debtorFormSchema = z.object({
  name: z.string().min(1, "Campo requerido"),
  channel: z.string().min(1, "Campo requerido"),
  debtor_code: z.string().min(1, "Campo requerido"),
  addresses: z.array(
    z.object({
      street: z.string().min(1, "Campo requerido"),
      city: z.string().min(1, "Campo requerido"),
      state: z.string().min(1, "Campo requerido"),
      country: z.string().min(1, "Campo requerido"),
      postal_code: z.string().min(1, "Campo requerido"),
      is_primary: z.boolean(),
    })
  ),
  dni: z.object({
    type: z.string().min(1, "Campo requerido"),
    dni: z.string().min(1, "Campo requerido"),
    emit_date: z.string().min(1, "Campo requerido"),
    expiration_date: z.string().min(1, "Campo requerido"),
  }),
  metadata: z.array(
    z.object({
      value: z.any(),
      type: z.string().min(1, "Campo requerido"),
    })
  ),
  currency: z.string().min(1, "Campo requerido"),
  email: z.string().min(1, "Campo requerido"),
  phone: z.string().min(1, "Campo requerido"),
  contacts: z.array(
    z.object({
      name: z.string().min(1, "Campo requerido"),
      role: z.string().min(1, "Campo requerido"),
      email: z.string().min(1, "Campo requerido"),
      phone: z.string().min(1, "Campo requerido"),
    })
  ),
  category: z.string().min(1, "Campo requerido"),
  economic_activities: z.string().min(1, "Campo requerido"),
  sales_person: z.string().min(1, "Campo requerido"),
  attention_days_hours: z.string().min(1, "Campo requerido"),
});

type DebtorFormValues = z.infer<typeof debtorFormSchema>;

const DebtorsDataStep: React.FC<StepProps> = ({
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
  const { session } = useProfileContext();

  const form = useForm<DebtorFormValues>({
    resolver: zodResolver(debtorFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "Distribuidora ABC S.A.",
      channel: "Mayorista",
      debtor_code: "DEB001",
      addresses: [
        {
          street: "Av. Providencia 1234, Oficina 501",
          city: "Santiago",
          state: "Región Metropolitana",
          country: countries.length > 0 ? countries[0]?.id : "", // Se llenará desde la API
          postal_code: "7500000",
          is_primary: true,
        },
      ],
      dni: {
        type: "RUT",
        dni: "76.123.456-7",
        emit_date: "2020-01-15",
        expiration_date: "2030-01-15",
      },
      metadata: [
        { value: 1, type: "RISK_CLASSIFICATION" },
        { value: 1000, type: "CREDIT_LINE" },
        { value: 1000000, type: "CREDIT_LINE_AMOUNT" },
        { value: "10%", type: "CREDIT_LINE_TOLERANCE" },
        { value: "Vigente", type: "CREDIT_STATUS" },
        { value: 30, type: "PAYMENT_TERMS" },
      ],
      currency: "CLP",
      email: "contacto@distribuidoraabc.cl",
      phone: "+56 9 8765 4321",
      contacts: [
        {
          name: "María González",
          role: "Gerente de Ventas",
          email: "maria.gonzalez@distribuidoraabc.cl",
          phone: "+56 9 8765 4322",
        },
      ],
      category:
        "Comercio al Por Mayor y al por Menor; Reparación de Vehículos Automotores y Motocicletas",
      economic_activities: "Venta al por mayor de productos alimenticios",
      sales_person: "Juan Pérez",
      attention_days_hours:
        "Lunes a Viernes: 9:00 - 18:00, Sábados: 9:00 - 13:00",
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

    debugger;

    try {
      console.log("Datos del deudor:", data);

      if (Object.keys(form.formState.errors).length > 0) {
        console.error("Hay errores en el formulario:", form.formState.errors);
        return;
      }

      // Aquí iría la lógica para guardar el deudor
      console.log("Datos a enviar:", data);

      // Si todo está bien, continuar al siguiente paso
      if (onNext) {
        onNext();
      }
    } catch (error) {
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
        <TitleStep title="Ingreso deudores" icon={<FileText size={16} />} />

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full space-y-6"
            autoComplete="off"
          >
            <div className="grid gap-6">
              <div className="grid grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Razón social <Required />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dni.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipo de documento <Required />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dni.dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Número de documento <Required />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="debtor_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Código deudor <Required />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addresses.0.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Dirección <Required />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addresses.0.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Comuna/Municipio <Required />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addresses.0.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ciudad <Required />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addresses.0.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        País <Required />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un país" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addresses.0.postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Código postal <Required />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Rubro
                        <Required />
                      </FormLabel>
                      <FormControl>
                        <SearchInput
                          value={field.value}
                          onValueChange={(value: string) =>
                            form.setValue("category", value)
                          }
                          options={categories.map((category: any) => ({
                            value: category,
                            label: category,
                          }))}
                          placeholder="Selecciona un rubro"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="economic_activities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Actividades económicas <Required />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Canal <Required />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.0.value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        DBT <Required />
                      </FormLabel>
                      <FormControl>
                        <InputNumberCart
                          value={Number(field.value) ?? 0}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Ej: 5000"
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metadata.1.value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Clasificación de riesgo <Required />
                      </FormLabel>
                      <FormControl>
                        <InputNumberCart
                          value={Number(field.value) ?? 0}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Ej: 5000"
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metadata.2.value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Línea de crédito <Required />
                      </FormLabel>
                      <FormControl>
                        <InputNumberCart
                          value={Number(field.value) ?? 0}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Ej: 5000"
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metadata.3.value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Monto línea de crédito <Required />
                      </FormLabel>
                      <FormControl>
                        <InputNumberCart
                          value={Number(field.value) || 0}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Ej: 5000"
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metadata.4.value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tolerancia línea de crédito <Required />
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona una tolerancia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="10" defaultChecked>
                              10%
                            </SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                            <SelectItem value="30">30%+</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metadata.5.value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Estado crediticio <Required />
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Vigente">Vigente</SelectItem>
                            <SelectItem value="Retenido">Retenido</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export default DebtorsDataStep;
