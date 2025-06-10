"use client";

import Stepper from "@/components/Stepper";
import React, { useEffect, useState } from "react";
import { OnboardingStepProps } from "../../types";
import StepLayout from "../StepLayout";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

import { useDashboard } from "@/stores/dashboard/dashboardStore";
import { useSession } from "next-auth/react";
import useOnboardingStore from "../../store";
import { ContinueAndBackButtons } from "./ContinueAndBackButtons";

const userFormSchema = z.object({
  country_id: z.string().min(1, "El país es requerido"),
  business_name: z.string().min(1, "La razón social es requerida"),
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().min(1, "El apellido es requerido"),
  phone_number: z.string().min(1, "El número de teléfono es requerido"),
  email: z.string().email("El email no es válido"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const PersonalInformationStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  const { countries, refreshCountries } = useDashboard();
  const { data: session } = useSession();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { sendCode, error, loading } = useOnboardingStore();

  useEffect(() => {
    const fetchData = async () => {
      if (session?.token) {
        setIsLoadingData(true);
        try {
          await Promise.all([refreshCountries(session?.token)]);
        } catch (error) {
          console.error("Error al cargar datos:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();
  }, [session?.token]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      country_id: profile?.client?.country_id || "",
      business_name: profile?.client?.name || "",
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone_number: profile?.phone_number || "",
      email: profile?.email || "",
    },
  });

  const handleSubmit = async (data: UserFormValues) => {
    onNext();
  };

  return (
    <StepLayout
      title="Datos personales"
      description="Completa los campos obligatorios para acceder a tu cuenta."
    >
      <section className="h-full">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            autoComplete="off"
            className="h-full"
          >
            {/* Botones de navegación */}
            <div className="p-8 h-[85%]">
              <div className="h-1/6 ">
                <Stepper
                  steps={steps}
                  currentStep={currentStep}
                  onStepChange={onStepChange}
                />
              </div>
              <div className="h-4/6 ">
                <div className="h-full w-full space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="country_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            País<span className="text-orange-500">*</span>
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
                              {isLoadingData && countries.length === 0 ? (
                                <SelectItem value="loading" disabled>
                                  Cargando...
                                </SelectItem>
                              ) : (
                                countries?.map((country: any) => (
                                  <SelectItem
                                    key={country.id}
                                    value={country.id}
                                  >
                                    {country.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="business_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Razón social
                            <span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ingresa razón social"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nombre<span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Apellido<span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Apellido" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Email<span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="nombre.apellido@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Número de teléfono
                            <span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <PhoneInput
                              placeholder="Ingresa tu número de teléfono"
                              {...field}
                              country={form.getValues("country_id")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <ContinueAndBackButtons
              isFirstStep={isFirstStep}
              onBack={onBack}
              loading={loading}
              form={form}
            />
          </form>
        </FormProvider>
      </section>
    </StepLayout>
  );
};

export default PersonalInformationStep;
