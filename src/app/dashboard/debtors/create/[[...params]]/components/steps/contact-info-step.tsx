"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import { functionsContact } from "@/app/dashboard/data";
import TitleStep from "@/app/dashboard/settings/components/title-step";
import { StepProps } from "@/app/dashboard/settings/types";
import { getCountries } from "@/app/services";
import Stepper from "@/components/Stepper";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileContext } from "@/context/ProfileContext";
import type { E164Number } from "libphonenumber-js/core";
import { Mail, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebtorsStore } from "../../../../store";

import { NextBackButtons } from "@/app/dashboard/debtors/components/next-back-buttons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
const debtorFormSchema = z.object({
  contact_info: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      function: z.string(),
      email: z.string(),
      phone: z
        .string()
        .min(8, "Campo requerido")
        .max(15, "Máximo 15 caracteres")
        .refine((value) => /^\+?[1-9]\d{1,14}$/.test(value), {
          message: "Número de teléfono inválido",
        }),
      channel: z.string(),
    })
  ),
});

type DebtorFormValues = z.infer<typeof debtorFormSchema>;

const ContactInfoStep: React.FC<StepProps> = ({
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
  const [activeAccordion, setActiveAccordion] = useState("item-0");
  const [countries, setCountries] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const { session } = useProfileContext();
  const { dataDebtor, updateDebtor, setDataDebtor } = useDebtorsStore();
  const router = useRouter();

  const form = useForm<DebtorFormValues>({
    resolver: zodResolver(debtorFormSchema),
    mode: "onChange",
    defaultValues: {
      contact_info:
        dataDebtor?.contacts?.length > 0
          ? dataDebtor?.contacts
          : [
              {
                name: dataDebtor?.contacts?.[0]?.name || "",
                role: dataDebtor?.contacts?.[0]?.role || "",
                function: dataDebtor?.contacts?.[0]?.function || "",
                email: dataDebtor?.contacts?.[0]?.email || "",
                phone: dataDebtor?.contacts?.[0]?.phone || "",
                channel: dataDebtor?.contacts?.[0]?.channel || "",
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contact_info",
  });

  const addContact = () => {
    const newIndex = fields.length;
    append({
      name: "",
      role: "",
      function: "",
      email: "",
      phone: "",
      channel: "",
    });
    // Abrir automáticamente el accordion del nuevo contacto
    setActiveAccordion(`item-${newIndex}`);
  };
  const removeContact = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("Debe mantener al menos un contacto");
    }
  };
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
    debugger;
    setSubmitAttempted(true);
    try {
      if (data.contact_info.length > 0 && dataDebtor?.id) {
        debugger;
        dataDebtor.contacts = data.contact_info;
        await updateDebtor(session?.token, profile?.client?.id, dataDebtor);
      }
      toast.success("Deudor guardado correctamente");
      router.push("/dashboard/debtors");
      router.refresh();
    } catch (error) {
      toast.error("Error al guardar el deudor");
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
        <div className="flex justify-between items-center">
          <TitleStep
            title="Información de contacto"
            icon={<Mail size={16} />}
          />
          <Button
            type="button"
            onClick={addContact}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-2 text-sm border-orange-500 hover:bg-orange-100 bg-white"
          >
            <Plus className="w-4 h-4 text-orange-500" />
            Agregar contacto
          </Button>
        </div>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full space-y-6"
            autoComplete="off"
          >
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-3"
              value={activeAccordion}
              onValueChange={setActiveAccordion}
            >
              {fields.map((field, index) => (
                <AccordionItem
                  key={field.id}
                  value={`item-${index}`}
                  className="border border-gray-200 rounded-md px-3 py-1 mb-1"
                >
                  <div className="grid grid-cols-[96%_4%] items-center gap-2 min-h-[48px]">
                    <AccordionTrigger className="flex items-center justify-between h-full">
                      <span>Contacto {index + 1}</span>
                    </AccordionTrigger>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeContact(index);
                      }}
                      disabled={fields.length === 1}
                      className="bg-red-500 text-white hover:bg-red-600 hover:text-white flex items-center justify-center h-8 w-8"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <div className="grid gap-6">
                      <div className="grid grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name={`contact_info.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`contact_info.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rol</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`contact_info.${index}.function`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Función</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona una función" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {functionsContact.map((func) => (
                                      <SelectItem
                                        key={func.value}
                                        value={func.value}
                                      >
                                        {func.name}
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
                          name={`contact_info.${index}.channel`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Canal preferente de comunicación
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
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">
                                      Teléfono
                                    </SelectItem>
                                    <SelectItem value="whatsapp">
                                      Whatsapp
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`contact_info.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`contact_info.${index}.phone`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <PhoneInput
                                  placeholder="Ej: +56 9 9891 8080"
                                  defaultCountry="CL"
                                  value={field.value as E164Number}
                                  onChange={(value: E164Number | undefined) =>
                                    field.onChange(value || "")
                                  }
                                  error={
                                    !!form.formState.errors.contact_info?.[0]
                                      ?.phone
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

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
                steps={steps}
              />
            </div>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export default ContactInfoStep;
