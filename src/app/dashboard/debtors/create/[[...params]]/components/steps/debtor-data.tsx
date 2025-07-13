"use client";

import { useCompaniesStore } from "@/app/dashboard/companies/store";
import CountriesSelectFormItem from "@/app/dashboard/components/countries-select-form-item";
import PaymentMethodSelectFormItem from "@/app/dashboard/components/payment-method-select-form-item";
import SelectClient from "@/app/dashboard/components/select-client";
import {
  categories,
  COMMUNICATION_CHANNEL,
  CREDIT_STATUS,
  DEBTOR_PAYMENT_METHODS,
  PAYMENT_TERMS,
  PREFERRED_CHANNELS,
  RISK_CLASSIFICATION,
  typeDocuments,
} from "@/app/dashboard/data";
import { NextBackButtons } from "@/app/dashboard/debtors/components/next-back-buttons";
import TitleStep from "@/app/dashboard/settings/components/title-step";
import { StepProps } from "@/app/dashboard/settings/types";
import Stepper from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputNumberCart from "@/components/ui/input-number-cart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProfileContext } from "@/context/ProfileContext";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, FileText, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useDebtorsStore } from "../../../../store";

const createDebtorFormSchema = (isFactoring: boolean) =>
  z.object({
    name: z.string().min(1, "Campo requerido"),
    companies: isFactoring
      ? z
          .array(
            z.object({
              id: z.string().min(1, "Campo requerido"),
              debtor_code: z.string().nullable(),
            })
          )
          .min(1, "Debes seleccionar al menos una compañía")
      : z.null(),
    channel: z
      .union([
        z.enum(
          PREFERRED_CHANNELS.map((channel) => channel.code) as [
            string,
            ...string[],
          ]
        ),
        z.literal("__none__"),
        z.null(),
      ])
      .optional()
      .nullable()
      .default(null),
    channel_communication: z
      .union([
        z.enum(
          COMMUNICATION_CHANNEL.map((channel) => channel.code) as [
            string,
            ...string[],
          ]
        ),
        z.literal("__none__"),
        z.null(),
      ])
      .optional()
      .nullable()
      .default(null),
    payment_method: z
      .union([
        z.enum(
          DEBTOR_PAYMENT_METHODS.map(
            (paymentMethod) => paymentMethod.value
          ) as [string, ...string[]]
        ),
        z.literal("__none__"),
        z.null(),
      ])
      .optional()
      .nullable()
      .default(null),
    debtor_code: z.string().min(1, "Campo requerido"),
    addresses: z
      .array(
        z.object({
          street: z.string().optional().nullable(),
          city: z.string().optional().nullable(),
          state: z.string().optional().nullable(),
          country: z.string().optional().nullable(),
          postal_code: z.string().optional().nullable(),
          is_primary: z.boolean().optional().nullable(),
        })
      )
      .optional()
      .nullable(),
    sales_person: z.string().optional(),
    dni: z.object({
      type: z.enum(typeDocuments.map((doc) => doc) as [string, ...string[]]),
      dni: z.string().min(1, "Campo requerido"),
      emit_date: z.string().optional(),
      expiration_date: z.string().optional(),
    }),
    metadata: z
      .array(
        z.object({
          value: z.any().optional(),
          type: z.string().optional(),
        })
      )
      .optional(),
    currency: z.string().optional(),
    category: z.string().optional(),
    economic_activities: z.array(z.string()).optional(),
  });

const DebtorsDataStep: React.FC<StepProps> = ({
  onNext,
  onBack,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  const {
    createDebtor,
    setDataDebtor,
    dataDebtor,
    updateDebtor,
    error: errorDebtor,
  } = useDebtorsStore();
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { companies } = useCompaniesStore();
  const [open, setOpen] = useState(false);
  const { session } = useProfileContext();

  // Función helper para manejar valores numéricos seguros
  const safeNumber = (value: any, defaultValue = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  const isFactoring = profile?.client?.type === "FACTORING";
  const debtorFormSchema = createDebtorFormSchema(isFactoring);
  type DebtorFormValues = z.infer<typeof debtorFormSchema>;

  const form = useForm<DebtorFormValues>({
    resolver: zodResolver(debtorFormSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "",
      companies: isFactoring ? [] : null,
      channel: null,
      channel_communication: null,
      debtor_code: "",
      payment_method: dataDebtor?.payment_method || null,
      sales_person: "",
      addresses: [
        {
          street: null,
          city: null,
          state: null,
          country: null,
          postal_code: null,
          is_primary: true,
        },
      ],
      dni: {
        type: "",
        dni: "",
        emit_date: "",
        expiration_date: "",
      },
      metadata: [
        {
          value: 0,
          type: "DBT_DEBTOR",
        },
        {
          value: "LOW",
          type: "RISK_CLASSIFICATION",
        },
        {
          value: "false",
          type: "CREDIT_LINE",
        },
        {
          value: 0,
          type: "CREDIT_LINE_AMOUNT",
        },
        {
          value: 0,
          type: "CREDIT_LINE_TOLERANCE",
        },
        {
          value: null,
          type: "CREDIT_STATUS",
        },
        {
          value: "30_DAYS",
          type: "PAYMENT_TERMS",
        },
      ],
      currency: "CLP",
      category: "",
      economic_activities: [],
    },
  });

  useEffect(() => {
    if (dataDebtor?.id) {
      const formData: DebtorFormValues = {
        name: dataDebtor.name || "",
        companies: isFactoring
          ? // Para edición: mapear debtorCompanies si existe, sino companies
            dataDebtor.debtorCompanies
            ? dataDebtor.debtorCompanies.map((debtorCompany) => ({
                id: debtorCompany.company_id,
                debtor_code: null,
              }))
            : (dataDebtor.companies || []).map((company) => ({
                id: company.id,
                debtor_code: null,
              }))
          : null,
        channel: dataDebtor.channel !== undefined ? dataDebtor.channel : null,
        channel_communication:
          dataDebtor.communication_channel !== undefined
            ? dataDebtor.communication_channel
            : null,
        debtor_code: dataDebtor.debtor_code || "",
        payment_method: dataDebtor.payment_method || null,
        sales_person: dataDebtor.sales_person || "",
        addresses: [
          {
            street: dataDebtor.addresses?.[0]?.street || null,
            city: dataDebtor.addresses?.[0]?.city || null,
            state: dataDebtor.addresses?.[0]?.state || null,
            country:
              dataDebtor.addresses?.[0]?.country !== undefined
                ? dataDebtor.addresses?.[0]?.country
                : null,
            postal_code: dataDebtor.addresses?.[0]?.postal_code || null,
            is_primary: dataDebtor.addresses?.[0]?.is_primary || true,
          },
        ],
        dni: {
          type: dataDebtor?.dni?.type || "",
          dni: dataDebtor.dni?.dni || "",
          emit_date: dataDebtor.dni?.emit_date || "",
          expiration_date: dataDebtor.dni?.expiration_date || "",
        },
        metadata: [
          {
            value:
              dataDebtor.metadata?.find((meta) => meta.type === "DBT_DEBTOR")
                ?.value || 0,
            type: "DBT_DEBTOR",
          },
          {
            value:
              dataDebtor.metadata?.find(
                (meta) => meta.type === "RISK_CLASSIFICATION"
              )?.value !== undefined
                ? dataDebtor.metadata?.find(
                    (meta) => meta.type === "RISK_CLASSIFICATION"
                  )?.value
                : "LOW",
            type: "RISK_CLASSIFICATION",
          },
          {
            value:
              dataDebtor.metadata?.find((meta) => meta.type === "CREDIT_LINE")
                ?.value !== undefined
                ? dataDebtor.metadata?.find(
                    (meta) => meta.type === "CREDIT_LINE"
                  )?.value
                : "false",
            type: "CREDIT_LINE",
          },
          {
            value: safeNumber(
              dataDebtor.metadata?.find(
                (meta) => meta.type === "CREDIT_LINE_AMOUNT"
              )?.value,
              0
            ),
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
                ?.value || "ACTIVE",
            type: "CREDIT_STATUS",
          },
          {
            value:
              dataDebtor.metadata?.find((meta) => meta.type === "PAYMENT_TERMS")
                ?.value || "30_DAYS",
            type: "PAYMENT_TERMS",
          },
        ],
        currency: dataDebtor.currency || "CLP",
        category: dataDebtor.category || "",
        economic_activities: dataDebtor.economic_activities || [""],
      };
      form.reset(formData);

      // Establecer valores manualmente después del reset para asegurar que se mantengan
      setTimeout(() => {
        if (formData.channel !== null && formData.channel !== undefined) {
          form.setValue("channel", formData.channel);
        }
        if (
          formData.channel_communication !== null &&
          formData.channel_communication !== undefined
        ) {
          form.setValue(
            "channel_communication",
            formData.channel_communication
          );
        }
        if (
          formData.payment_method !== null &&
          formData.payment_method !== undefined
        ) {
          form.setValue("payment_method", formData.payment_method);
        }

        // Establecer valores de metadata manualmente
        if (
          formData.metadata?.[1]?.value !== undefined &&
          formData.metadata?.[1]?.value !== null
        ) {
          form.setValue("metadata.1.value", formData.metadata[1].value);
        }

        if (
          formData.metadata?.[2]?.value !== undefined &&
          formData.metadata?.[2]?.value !== null
        ) {
          form.setValue("metadata.2.value", formData.metadata[2].value);
        }

        // Establecer country manualmente
        if (
          formData.addresses?.[0]?.country !== null &&
          formData.addresses?.[0]?.country !== undefined
        ) {
          form.setValue("addresses.0.country", formData.addresses[0].country);
        }

        // Segundo intento para los Select después de un delay más largo
        setTimeout(() => {
          if (formData.channel !== null && formData.channel !== undefined) {
            form.setValue("channel", formData.channel, {
              shouldValidate: true,
            });
          }

          // Lógica especial para channel_communication
          let channelCommValue = formData.channel_communication;

          // Si channel_communication es null/undefined, intentar establecer un valor por defecto válido
          if (channelCommValue === null || channelCommValue === undefined) {
            // Verificar si WHOLESALE está disponible en COMMUNICATION_CHANNEL
            const wholesaleAvailable = COMMUNICATION_CHANNEL.find(
              (c) => c.code === "WHOLESALE"
            );
            if (wholesaleAvailable) {
              channelCommValue = "WHOLESALE";
            } else if (COMMUNICATION_CHANNEL.length > 0) {
              // Si WHOLESALE no está disponible, usar el primer canal disponible
              channelCommValue = COMMUNICATION_CHANNEL[0].code;
            }
          }

          if (channelCommValue !== null && channelCommValue !== undefined) {
            form.setValue("channel_communication", channelCommValue, {
              shouldValidate: true,
            });
          }

          // Segundo intento para country
          if (
            formData.addresses?.[0]?.country !== null &&
            formData.addresses?.[0]?.country !== undefined
          ) {
            form.setValue(
              "addresses.0.country",
              formData.addresses[0].country,
              { shouldValidate: true }
            );
          }
        }, 300);
      }, 100);
    }
  }, [dataDebtor.id, companies.length, currentStep, isFactoring]);

  // Limpiar error cuando el usuario edita el formulario
  useEffect(() => {
    if (submitError) {
      const subscription = form.watch(() => {
        setSubmitError(null);
      });
      return () => subscription.unsubscribe();
    }
  }, [submitError, form]);

  // Función para manejar el click del botón Next
  const handleNextClick = async () => {
    setSubmitAttempted(true);

    // Validar el formulario primero
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Por favor, completa todos los campos requeridos");
      return;
    }

    // Si el formulario es válido, ejecutar handleSubmit
    const formData = form.getValues();
    await handleSubmit(formData);
  };

  const handleSubmit = async (data: DebtorFormValues): Promise<void> => {
    setSubmitAttempted(true);
    setIsSubmitting(true);
    setSubmitError(null); // Limpiar errores previos

    // Validar que no haya errores del formulario antes de continuar
    if (Object.keys(form.formState.errors).length > 0) {
      setIsSubmitting(false);
      toast.error("Por favor, completa todos los campos requeridos");
      return;
    }

    try {
      if (dataDebtor?.id) {
        // Para edición: transformar companies a debtorCompanies y limpiar campos vacíos
        const cleanedData = {
          ...data,
          addresses: data.addresses?.map((address) => ({
            ...address,
            street: address.street === "" ? null : address.street,
            city: address.city === "" ? null : address.city,
            state: address.state === "" ? null : address.state,
            country: address.country === "" ? null : address.country,
            postal_code:
              address.postal_code === "" ? null : address.postal_code,
          })),
        };

        const updatedData = {
          ...dataDebtor,
          ...cleanedData,
          id: dataDebtor.id,
          // Mapear channel_communication a communication_channel para el backend
          communication_channel: cleanedData.channel_communication,
        };

        // Si es factoring y hay companies, convertir a debtorCompanies para edición
        if (isFactoring && data.companies && data.companies.length > 0) {
          const debtorCompanies = data.companies.map((company) => {
            // Buscar si ya existe una relación existente
            const existingRelation = dataDebtor.debtorCompanies?.find(
              (dc) => dc.company_id === company.id
            );

            return {
              id: existingRelation?.id || undefined, // ID de la relación si existe
              debtor_id: dataDebtor.id,
              company_id: company.id,
              debtor_code: company.debtor_code || null,
              client_id: profile?.client?.id,
              created_at: existingRelation?.created_at || undefined,
              updated_at: existingRelation?.updated_at || undefined,
            };
          });

          // Reemplazar companies con debtorCompanies para el payload de edición
          const editPayload = {
            ...updatedData,
            debtorCompanies,
            companies: undefined, // Remover companies del payload
          };

          const hasChanges = Object.keys(data).some((key) => {
            const formValue = data[key as keyof typeof data];
            let storeValue = dataDebtor[key as keyof typeof dataDebtor];

            // Mapeo especial para channel_communication
            if (key === "channel_communication") {
              storeValue = dataDebtor.communication_channel;
            }

            const hasChange =
              JSON.stringify(formValue) !== JSON.stringify(storeValue);
            return hasChange;
          });

          setDataDebtor(editPayload);

          if (hasChanges) {
            await updateDebtor(
              session?.token,
              profile?.client?.id,
              editPayload
            );
          }
        } else {
          // Para casos sin companies o no factoring
          const hasChanges = Object.keys(data).some((key) => {
            const formValue = data[key as keyof typeof data];
            let storeValue = dataDebtor[key as keyof typeof dataDebtor];

            // Mapeo especial para channel_communication
            if (key === "channel_communication") {
              storeValue = dataDebtor.communication_channel;
            }

            const hasChange =
              JSON.stringify(formValue) !== JSON.stringify(storeValue);
            return hasChange;
          });

          setDataDebtor(updatedData);

          if (hasChanges) {
            await updateDebtor(
              session?.token,
              profile?.client?.id,
              updatedData
            );
          }
        }
      } else {
        // Para creación: usar companies normal y limpiar campos vacíos de addresses
        const cleanedData = {
          ...data,
          addresses: data.addresses?.map((address) => ({
            ...address,
            street: address.street === "" ? null : address.street,
            city: address.city === "" ? null : address.city,
            state: address.state === "" ? null : address.state,
            country: address.country === "" ? null : address.country,
            postal_code:
              address.postal_code === "" ? null : address.postal_code,
          })),
        };
        setDataDebtor(cleanedData);
        await createDebtor(session?.token, profile?.client?.id, cleanedData);
      }

      // Solo avanzar al siguiente paso si llegamos aquí sin errores
      if (!errorDebtor) {
        onNext();
      }
    } catch (error: any) {
      console.error("Error al guardar el deudor:", error);
      console.error("Error response:", error?.response);
      console.error("Error data:", error?.response?.data);

      // Manejo de errores más específico
      let errorMessage = "Error al guardar el deudor";

      // Verificar la estructura específica del error que mencionas
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.errors) {
        // Si hay errores de validación específicos
        const validationErrors = error.response.data.errors;
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors.join(", ");
        } else if (typeof validationErrors === "object") {
          errorMessage = Object.values(validationErrors).flat().join(", ");
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Mostrar el error específico
      toast.error(errorMessage);
      setSubmitError(errorMessage);

      // IMPORTANTE: No re-lanzar el error para evitar que se propague
      // El error ya se manejó mostrando el toast y estableciendo submitError
      // No ejecutar onNext() - simplemente retornar
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {profile?.client?.type === "FACTORING" && (
                  <FormField
                    control={form.control}
                    name="companies"
                    render={({ field }) => (
                      <SelectClient field={field} title="Compañía" required />
                    )}
                  />
                )}

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
                          value={field.value || "RUT"}
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
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
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
                      <FormLabel>Comuna/Municipio</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
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
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addresses.0.country"
                  render={({ field }) => (
                    <CountriesSelectFormItem field={field} title="País" />
                  )}
                />
                <FormField
                  control={form.control}
                  name="addresses.0.postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código postal</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
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
                      <FormLabel>Rubro</FormLabel>
                      <FormControl>
                        <Popover open={open} onOpenChange={setOpen}>
                          <div className="relative space-x-2">
                            <Input
                              {...field}
                              placeholder="Escribe o selecciona un rubro"
                              autoComplete="off"
                              className="pr-12"
                            />
                            <PopoverTrigger
                              asChild
                              onClick={() => setOpen(true)}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2"
                                type="button"
                              >
                                <Search className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                          </div>
                          <PopoverContent className="w-80 p-0" align="start">
                            <Command>
                              <CommandInput
                                placeholder="Buscar rubro..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontró el rubro
                                </CommandEmpty>
                                <CommandGroup>
                                  {categories.map((category: any) => (
                                    <CommandItem
                                      key={category}
                                      value={category}
                                      onSelect={(value) => {
                                        field.onChange(value);
                                        setOpen(false);
                                      }}
                                    >
                                      <Tooltip>
                                        <TooltipTrigger className="truncate">
                                          {category}
                                        </TooltipTrigger>
                                        <TooltipContent side="left">
                                          {category}
                                        </TooltipContent>
                                      </Tooltip>

                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4 flex-shrink-0",
                                          category === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
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
                      <FormLabel>Actividades económicas</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field?.value?.join(", ") || ""}
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
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Canal</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(
                                value === "__none__" ? null : value
                              )
                            }
                            value={
                              field.value !== null && field.value !== undefined
                                ? field.value
                                : "__none__"
                            }
                            key={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un canal" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="__none__">
                                -- Selecciona un canal --
                              </SelectItem>
                              {PREFERRED_CHANNELS.map((channel: any) => (
                                <SelectItem
                                  key={channel.code}
                                  value={channel.code}
                                >
                                  {channel.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="channel_communication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canal de comunicación</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === "__none__" ? null : value)
                          }
                          value={
                            field.value !== null && field.value !== undefined
                              ? field.value
                              : "__none__"
                          }
                          key={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un canal" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="__none__">
                              -- Selecciona un canal --
                            </SelectItem>
                            {COMMUNICATION_CHANNEL.map((channel: any) => (
                              <SelectItem
                                key={channel.code}
                                value={channel.code}
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
                        <FormLabel>DBT</FormLabel>
                        <FormControl>
                          <InputNumberCart
                            value={safeNumber(field.value, 0)}
                            onChange={(val) =>
                              field.onChange(safeNumber(val, 0))
                            }
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
                      <FormLabel>Clasificación de riesgo</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || null}
                          defaultValue={field.value || null}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {RISK_CLASSIFICATION.map((status: any) => (
                              <SelectItem key={status.code} value={status.code}>
                                {status.name}
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
                  name="metadata.2.value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Línea de crédito <Required />
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          defaultValue={field.value || ""}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona una línea de crédito" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Si</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <FormLabel>Monto línea de crédito</FormLabel>
                      <FormControl>
                        <InputNumberCart
                          value={safeNumber(field.value, 0)}
                          onChange={(val) => field.onChange(safeNumber(val, 0))}
                          placeholder="Ej: 5000"
                          min={0}
                          step={100000}
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
                      <FormLabel>Tolerancia línea de crédito</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={safeNumber(field.value, 0)}
                          onChange={(e) =>
                            field.onChange(safeNumber(e.target.value, 0))
                          }
                        />
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
                      <FormLabel>Estado crediticio</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "ACTIVE"}
                          defaultValue={field.value || "ACTIVE"}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {CREDIT_STATUS.map((status: any) => (
                              <SelectItem key={status.code} value={status.code}>
                                {status.name}
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
                  name="metadata.6.value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condiciones de pago</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("metadata.6.type", "PAYMENT_TERMS");
                          }}
                          value={field.value}
                          defaultValue={field.value}
                          key={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_TERMS.map((term: any) => (
                              <SelectItem key={term.code} value={term.code}>
                                {term.name}
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
                  name="payment_method"
                  render={({ field }) => (
                    <PaymentMethodSelectFormItem
                      field={field}
                      title="Método de pago"
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="sales_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendedor</FormLabel>
                      <FormControl>
                        <Input {...field} />
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

              {submitError && (
                <div className="text-red-500 text-xs self-center mr-2">
                  {submitError}
                </div>
              )}

              <NextBackButtons
                loading={isSubmitting || form.formState.isSubmitting}
                currentStep={currentStep}
                onBack={onBack}
                onNext={handleNextClick}
              />
            </div>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export default DebtorsDataStep;
