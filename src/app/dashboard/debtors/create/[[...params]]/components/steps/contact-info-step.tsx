"use client";

import { Button } from "@/components/ui/button";
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
import { FormProvider, useForm } from "react-hook-form";
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
import { ArrowLeft, Mail, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebtorsStore } from "../../../../store";

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
      contact_info: [
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
    try {
      if (Object.keys(form.formState.errors).length > 0) {
        toast.error("Hay errores en el formulario");
        return;
      }
      if (data.contact_info.length > 0 && dataDebtor?.id) {
        dataDebtor.contacts[0] = data.contact_info[0];
        dataDebtor.email = data.contact_info[0].email;
        dataDebtor.phone = data.contact_info[0].phone;
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
        <TitleStep title="Información de contacto" icon={<Mail size={16} />} />

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
                  name="contact_info.0.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contacto </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_info.0.role"
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
                  name="contact_info.0.function"
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
                              <SelectItem key={func.value} value={func.value}>
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
                  name="contact_info.0.channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canal preferente de comunicación</FormLabel>
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
                            <SelectItem value="phone">Teléfono</SelectItem>
                            <SelectItem value="whatsapp">Whatsapp</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_info.0.email"
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
                  name={`contact_info.0.phone`}
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
                            !!form.formState.errors.contact_info?.[0]?.phone
                          }
                        />
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
                {form.formState.isSubmitting ? "Guardando..." : "Finalizar"}{" "}
                <Save className="w-4 h-4 text-white" />
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export default ContactInfoStep;
