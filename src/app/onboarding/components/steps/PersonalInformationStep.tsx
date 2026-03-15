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
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import useOnboardingStore from "../../store";
import { ContinueAndBackButtons } from "./ContinueAndBackButtons";

const createUserFormSchema = (t: ReturnType<typeof useTranslations<"onboarding">>) =>
  z.object({
    country_id: z.string().min(1, t("personalInfo.validation.countryRequired")),
    business_name: z.string().min(1, t("personalInfo.validation.businessNameRequired")),
    first_name: z.string().min(1, t("personalInfo.validation.firstNameRequired")),
    last_name: z.string().min(1, t("personalInfo.validation.lastNameRequired")),
    phone_number: z.string().min(1, t("personalInfo.validation.phoneRequired")),
    email: z.string().email(t("personalInfo.validation.emailInvalid")),
  });

type UserFormValues = z.infer<ReturnType<typeof createUserFormSchema>>;

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
  const t = useTranslations("onboarding");
  const tCommon = useTranslations("common");
  const { countries, refreshCountries } = useDashboard();
  const { data: session } = useSession();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { sendCode, error, loading } = useOnboardingStore();
  const userFormSchema = createUserFormSchema(t);

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
    resolver: zodResolver(userFormSchema) as any,
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
      title={t("personalInfo.title")}
      description={t("personalInfo.description")}
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
                            {t("personalInfo.country")}<span className="text-orange-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t("personalInfo.selectCountry")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingData && countries.length === 0 ? (
                                <SelectItem value="loading" disabled>
                                  {tCommon("loading.generic")}
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
                            {t("personalInfo.businessName")}
                            <span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("personalInfo.businessNamePlaceholder")}
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
                            {t("personalInfo.firstName")}<span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder={t("personalInfo.firstName")} {...field} />
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
                            {t("personalInfo.lastName")}<span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder={t("personalInfo.lastName")} {...field} />
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
                            {t("personalInfo.phone")}
                            <span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <PhoneInput
                              placeholder={t("personalInfo.phonePlaceholder")}
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
