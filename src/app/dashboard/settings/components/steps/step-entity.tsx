"use client";
import {
  categories,
  currencies,
  languages,
  typeDocuments,
} from "@/app/dashboard/data";
import { getCountries } from "@/app/services";
import Stepper from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Required from "@/components/ui/required";
import { SearchInput } from "@/components/ui/search-input";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Cog,
  ImagePlus,
  Loader,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateDataClient } from "../../services";
import { useSettingsImageStore } from "../../store";
import { StepProps } from "../../types";
import StepLayout from "../StepLayout";
import TitleStep from "../title-step";
import ImageUploader from "./image-uploader";

const StepEntity: React.FC<StepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  const { session, refreshProfile } = useProfileContext();
  const [countries, setCountries] = useState([]);
  const { previewUrl, clearImage, setBase64String } = useSettingsImageStore();
  const [loading, setLoading] = useState(false);
  const t = useTranslations("settings.entity");
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (profile?.client?.operational?.logo_url) {
      const base64Image = profile.client.operational.logo_url;
      setBase64String(base64Image);
      if (!base64Image.startsWith("data:image")) {
        setBase64String(`data:image/jpeg;base64,${base64Image}`);
      }
    }
  }, [profile?.client?.operational?.logo_url]);

  const formSchema = z.object({
    first_name: z.string().min(1, t("validation.nameRequired")),
    dni_type: z.string().min(1, t("validation.documentTypeRequired")),
    dni_number: z.string().min(1, t("validation.documentNumberRequired")),
    operational: z.object({
      logo_url: z.string().optional(),
      decimals: z.number().min(0, t("validation.decimalsRequired")),
      erp_code: z.string().min(1, t("validation.erpCodeRequired")),
    }),
    language: z.string().min(1, t("validation.languageRequired")),
    category: z.string().min(1, t("validation.categoryRequired")),
    currency: z.string().min(1, t("validation.currencyRequired")),
    country_id: z.string().min(1, t("validation.countryRequired")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      first_name: "",
      country_id: "",
      dni_type: "",
      dni_number: "",
      language: "",
      category: "",
      currency: "",
      operational: {
        erp_code: "",
        decimals: 0,
        logo_url: "",
      },
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile?.client?.name || "",
        country_id: profile?.client?.country_id || "",
        dni_type: profile?.client?.dni_type || "",
        dni_number: profile?.client?.dni_number || "",
        language: profile?.client?.language || "",
        category: profile?.client?.category || "",
        currency: profile?.client?.currency || "",
        operational: {
          erp_code: profile?.client?.operational?.erp_code || "",
          decimals:
            (profile?.client?.operational?.decimals as unknown as number) || 0,
          logo_url: profile?.client?.operational?.logo_url || "",
        },
      });
    }
  }, [profile, form]);

  const hasFormChanges = () => {
    const currentValues = form.getValues();
    const initialValues = {
      first_name: profile?.client?.name || "",
      country_id: profile?.client?.country_id || "",
      dni_type: profile?.client?.dni_type || "",
      dni_number: profile?.client?.dni_number || "",
      language: profile?.client?.language || "",
      category: profile?.client?.category || "",
      currency: profile?.client?.currency || "",
      operational: {
        erp_code: profile?.client?.operational?.erp_code || "",
        decimals:
          (profile?.client?.operational?.decimals as unknown as number) || 0,
        logo_url: profile?.client?.operational?.logo_url || "",
      },
    };

    return JSON.stringify(currentValues) !== JSON.stringify(initialValues);
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (!hasFormChanges()) {
        onNext();
        return;
      }

      setLoading(true);
      const { base64String } = useSettingsImageStore.getState();
      const formData = {
        ...data,
        operational: {
          ...data.operational,
          logo_url: base64String,
        },
      };
      console.log("Datos del formulario:", formData);
      const response = await updateDataClient(
        formData,
        profile?.client_id,
        session?.token
      );
      console.log("Respuesta del servidor:", response);
      if (!response.error) {
        await refreshProfile();
        onNext();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      toast.error(t("toast.updateError"));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(handleSubmit)();
    }
  };

  useEffect(() => {
    const fetchCountries = async () => {
      const countries = await getCountries(session?.token);
      setCountries(countries);
    };
    fetchCountries();
  }, [session?.token]);

  return (
    <StepLayout>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          onKeyDown={handleKeyDown}
          className="h-full  w-full space-y-6"
          autoComplete="off"
        >
          <div className="h-1/6">
            <Stepper
              steps={steps}
              currentStep={currentStep}
              onStepChange={onStepChange}
            />
          </div>
          <div className="h-4/6 max-h-4/6 overflow-y-auto space-y-4 border border-gray-200 rounded-md p-5">
            <TitleStep
              title={t("title")}
              icon={<Cog size={16} />}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("businessName")} <Required />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan López" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dni_type"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{tCommon("labels.documentType")}</FormLabel>
                    <FormControl>
                      <SearchInput
                        value={field.value}
                        onValueChange={(value) =>
                          form.setValue("dni_type", value)
                        }
                        options={typeDocuments.map((type) => ({
                          value: type,
                          label: type,
                        }))}
                        placeholder={tCommon("placeholders.selectDocumentType")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dni_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tCommon("labels.documentNumber")}
                      <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 180716106" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="country_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tCommon("labels.country")}
                      <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchInput
                        value={field.value}
                        onValueChange={(value) =>
                          form.setValue("country_id", value)
                        }
                        options={countries.map((country: any) => ({
                          value: country.id.toString(),
                          label: country.name,
                        }))}
                        placeholder={tCommon("placeholders.selectCountry")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tCommon("labels.language")}
                      <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchInput
                        value={field.value}
                        onValueChange={(value) =>
                          form.setValue("language", value)
                        }
                        options={languages.map((language: any) => ({
                          value: language.code,
                          label: language.name,
                        }))}
                        placeholder={tCommon("placeholders.selectLanguage")}
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
                    <FormLabel>
                      {tCommon("labels.category")}
                      <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchInput
                        value={field.value}
                        onValueChange={(value) =>
                          form.setValue("category", value)
                        }
                        options={categories.map((category: any) => ({
                          value: category,
                          label: category,
                        }))}
                        placeholder={tCommon("placeholders.selectCategory")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tCommon("labels.currency")}
                      <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchInput
                        value={field.value}
                        onValueChange={(value) =>
                          form.setValue("currency", value)
                        }
                        options={currencies.map((currency: any) => ({
                          value: currency.code,
                          label: `${currency.name} (${currency.symbol})`,
                        }))}
                        placeholder={tCommon("placeholders.selectCurrency")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="operational.decimals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tCommon("labels.decimals")}
                      <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 2"
                        type="number"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="operational.erp_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("erpCode")}
                      <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-start items-center gap-4 mb-10">
              {!previewUrl ? (
                <div className="bg-[#F1F5F9] rounded-lg flex justify-center items-center h-40 w-40 min-w-40 text-gray-400 gap-2">
                  <ImagePlus className="w-10 h-10 " /> {t("logo")}
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <Image
                      src={previewUrl}
                      alt="logo"
                      className="w-40 h-40 min-w-40 max-w-40 rounded-lg border border-gray-300 object-contain"
                      width={160}
                      height={160}
                      unoptimized
                    />
                    <Button
                      type="button"
                      onClick={() => clearImage()}
                      variant="outline"
                      className="rounded-full w-8 h-8 flex justify-center items-center -mt-10 bg-red-500 text-white"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
              <ImageUploader />
            </div>
          </div>
          <div
            className={`h-1/6 mt-6 flex items-center ${isFirstStep ? "justify-end" : "justify-between"}`}
          >
            {!isFirstStep && (
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="px-6 py-2"
              >
                <ArrowLeftIcon className="w-4 h-4" /> {tCommon("buttons.back")}
              </Button>
            )}
            <Button
              type="submit"
              className="px-6 py-2"
              disabled={loading || !form.formState.isValid}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" /> {tCommon("loading.submitting")}
                </div>
              ) : (
                <>
                  {tCommon("buttons.continue")} <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </StepLayout>
  );
};

export default StepEntity;
