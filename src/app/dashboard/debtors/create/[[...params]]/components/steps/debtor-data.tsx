"use client";

import CountriesSelectFormItem from "@/app/dashboard/components/countries-select-form-item";
import { categories, channels, typeDocuments } from "@/app/dashboard/data";
import { NextBackButtons } from "@/app/dashboard/debtors/components/next-back-buttons";
import TitleStep from "@/app/dashboard/settings/components/title-step";
import { StepProps } from "@/app/dashboard/settings/types";
import Stepper from "@/components/Stepper";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputNumberCart from "@/components/ui/input-number-cart";
import Required from "@/components/ui/required";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useDebtorsStore } from "../../../../store";

const debtorFormSchema = z.object({
  name: z.string().min(1, "Campo requerido"),
  channel: z.enum(
    channels.map((channel) => channel.value) as [string, ...string[]],
    {
      errorMap: () => ({ message: "Debe seleccionar un valor" }),
    }
  ),
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
    emit_date: z.string().optional(),
    expiration_date: z.string().optional(),
  }),
  metadata: z.array(
    z.object({
      value: z.any(),
      type: z.string().min(1, "Campo requerido"),
    })
  ),
  currency: z.string().min(1, "Campo requerido"),
  contacts: z.array(
    z.object({
      name: z.string().optional(),
      role: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      channel: z.string().optional(),
      function: z.string().optional(),
    })
  ),
  category: z.string().min(1, "Campo requerido"),
  economic_activities: z.array(z.string()).min(1, "Campo requerido"),
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
  const { createDebtor, setDataDebtor, dataDebtor, updateDebtor } =
    useDebtorsStore();
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { session } = useProfileContext();

  const form = useForm<DebtorFormValues>({
    resolver: zodResolver(debtorFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      channel: "EMAIL",
      debtor_code: "",
      addresses: [
        {
          street: "",
          city: "",
          state: "",
          country: "",
          postal_code: "",
          is_primary: true,
        },
      ],
      dni: {
        type: "RUT",
        dni: "",
        emit_date: "",
        expiration_date: "",
      },
      metadata: [
        {
          value: "0",
          type: "DBT_DEBTOR",
        },
        {
          value: 0,
          type: "RISK_CLASSIFICATION",
        },
        {
          value: 0,
          type: "CREDIT_LINE",
        },
        {
          value: 0,
          type: "CREDIT_LINE_AMOUNT",
        },
        {
          value: "",
          type: "CREDIT_LINE_TOLERANCE",
        },
        {
          value: "Vigente",
          type: "CREDIT_STATUS",
        },
      ],
      currency: "CLP",
      contacts: [
        {
          name: "",
          role: "",
          email: "",
          phone: "",
          channel: "EMAIL",
          function: "",
        },
      ],
      category: "",
      economic_activities: [""],
    },
  });

  useEffect(() => {
    if (dataDebtor?.id) {
      const formData: DebtorFormValues = {
        name: dataDebtor.name || "",
        channel: dataDebtor.channel || "EMAIL",
        debtor_code: dataDebtor.debtor_code || "",
        addresses: [
          {
            street: dataDebtor.addresses?.[0]?.street || "",
            city: dataDebtor.addresses?.[0]?.city || "",
            state: dataDebtor.addresses?.[0]?.state || "",
            country: dataDebtor.addresses?.[0]?.country || "",
            postal_code: dataDebtor.addresses?.[0]?.postal_code || "",
            is_primary: dataDebtor.addresses?.[0]?.is_primary || true,
          },
        ],
        dni: {
          type: dataDebtor.dni?.type || "RUT",
          dni: dataDebtor.dni?.dni || "",
          emit_date: dataDebtor.dni?.emit_date || "",
          expiration_date: dataDebtor.dni?.expiration_date || "",
        },
        metadata: [
          {
            value: Number(
              dataDebtor.metadata?.find((meta) => meta.type === "DBT_DEBTOR")
                ?.value
            ),
            type: "DBT_DEBTOR",
          },
          {
            value:
              dataDebtor.metadata?.find(
                (meta) => meta.type === "RISK_CLASSIFICATION"
              )?.value || 0,
            type: "RISK_CLASSIFICATION",
          },
          {
            value:
              Number(
                dataDebtor.metadata?.find((meta) => meta.type === "CREDIT_LINE")
                  ?.value
              ) || 0,
            type: "CREDIT_LINE",
          },
          {
            value:
              dataDebtor.metadata?.find(
                (meta) => meta.type === "CREDIT_LINE_AMOUNT"
              )?.value || 0,
            type: "CREDIT_LINE_AMOUNT",
          },
          {
            value:
              dataDebtor.metadata?.find(
                (meta) => meta.type === "CREDIT_LINE_TOLERANCE"
              )?.value || "",
            type: "CREDIT_LINE_TOLERANCE",
          },
          {
            value:
              dataDebtor.metadata?.find((meta) => meta.type === "CREDIT_STATUS")
                ?.value || "Vigente",
            type: "CREDIT_STATUS",
          },
        ],
        currency: dataDebtor.currency || "CLP",
        contacts: [
          {
            name: dataDebtor.contacts?.[0]?.name || "",
            role: dataDebtor.contacts?.[0]?.role || "",
            email: dataDebtor.contacts?.[0]?.email || "",
            phone: dataDebtor.contacts?.[0]?.phone || "",
            channel: dataDebtor.contacts?.[0]?.channel || "EMAIL",
            function: dataDebtor.contacts?.[0]?.function || "",
          },
        ],
        category: dataDebtor.category || "",
        economic_activities: dataDebtor.economic_activities || [""],
      };
      form.reset(formData);
    }
  }, [dataDebtor?.id, form]);

  const handleSubmit = async (data: DebtorFormValues): Promise<void> => {
    setSubmitAttempted(true);
    try {
      if (dataDebtor?.id) {
        const updatedData = {
          ...dataDebtor,
          ...data,
          id: dataDebtor.id,
        };

        const hasChanges = Object.keys(data).some((key) => {
          const formValue = data[key as keyof typeof data];
          const storeValue = dataDebtor[key as keyof typeof dataDebtor];

          return JSON.stringify(formValue) !== JSON.stringify(storeValue);
        });

        setDataDebtor(updatedData);

        if (hasChanges) {
          await updateDebtor(session?.token, profile?.client?.id, updatedData);
        }
      } else {
        setDataDebtor(data);
        await createDebtor(session?.token, profile?.client?.id, data);
      }
      if (onNext) {
        onNext();
      }
    } catch (error) {
      toast.error("Error al guardar el deudor");
    }
  };

  // console.log("FORM", form.getValues());
  // console.log("DATADEBTOR", dataDebtor);

  return (
    <section className="space-y-6">
      <div className="mb-6">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={onStepChange}
        />
      </div>
      <div className="space-y-4 border border-gray-200 rounded-md p-5">
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un tipo de documento" />
                          </SelectTrigger>
                          <SelectContent>
                            {typeDocuments.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
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
                    <CountriesSelectFormItem
                      field={field}
                      title="País"
                      required
                    />
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
                        <Input
                          {...field}
                          value={field.value.join(", ")}
                          onChange={(e) =>
                            field.onChange(e.target.value.split(", "))
                          }
                        />
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un canal" />
                          </SelectTrigger>

                          <SelectContent>
                            {channels.map((channel: any) => (
                              <SelectItem
                                key={channel.value}
                                value={channel.value}
                              >
                                {channel.name}
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
                  name="metadata.0.value"
                  render={({ field }) => {
                    return (
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
                    );
                  }}
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
                        <Input {...field} />
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

              <NextBackButtons
                loading={form.formState.isSubmitting}
                currentStep={currentStep}
                onBack={onBack}
                onNext={() => {
                  if (Object.keys(form.formState.errors).length > 0) {
                    setSubmitAttempted(true);
                  }
                }}
              />
            </div>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export default DebtorsDataStep;
