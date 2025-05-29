"use client";
import Stepper from "@/components/Stepper";
import { StepProps } from "../../types";
import StepLayout from "../StepLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Cog,
  ImagePlus,
  Loader,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import TitleStep from "../title-step";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageUploader from "./image-uploader";
import { useSettingsImageStore } from "../../store";
import Image from "next/image";
import {
  categories,
  currencies,
  languages,
  typeDocuments,
} from "@/app/dashboard/data";
import { getCountries } from "@/app/services";
import { useProfileContext } from "@/context/ProfileContext";
import { SearchInput } from "@/components/ui/search-input";
import { updateDataClient } from "../../services";
import { toast } from "sonner";

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
    first_name: z.string().min(1, "El nombre es requerido"),
    dni_type: z.string().min(1, "El tipo de documento es requerido"),
    dni_number: z.string().min(1, "El número de documento es requerido"),
    operational: z.object({
      logo_url: z.string().optional(),
      decimals: z.number().min(0, "Los decimales son requeridos"),
      erp_code: z.string().min(1, "El código ERP es requerido"),
    }),
    language: z.string().min(1, "El idioma es requerido"),
    category: z.string().min(1, "El rubro es requerido"),
    currency: z.string().min(1, "La moneda es requerida"),
    country_id: z.string().min(1, "El país es requerido"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
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
      toast.error("Error al actualizar los datos");
    } finally {
      setLoading(false);
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
          className="h-full w-full space-y-6"
          autoComplete="off"
        >
          <section className="h-full">
            <div className="h-1/6">
              <Stepper
                steps={steps}
                currentStep={currentStep}
                onStepChange={onStepChange}
              />
            </div>
            <div className="h-4/6 space-y-4  border border-gray-200 rounded-md p-5">
              <TitleStep
                title="Configuración de entidad"
                icon={<Cog size={16} />}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre<span className="text-orange-500">*</span>
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
                      <FormLabel>Tipo de documento</FormLabel>
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
                          placeholder="Selecciona un tipo de documento"
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
                        Número de documento
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
                        País
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
                          placeholder="Selecciona un país"
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
                        Idioma
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
                          placeholder="Selecciona un idioma"
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
                        Rubro
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
                          placeholder="Selecciona un rubro"
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
                        Moneda
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
                          placeholder="Selecciona una moneda"
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
                        Decimales
                        <span className="text-orange-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 2" {...field} />
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
                        Código ERP
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
                    <ImagePlus className="w-10 h-10 " /> Logo
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
              className={`h-1/6 flex items-center ${isFirstStep ? "justify-end" : "justify-between"}`}
            >
              {!isFirstStep && (
                <Button
                  type="button"
                  onClick={onBack}
                  variant="outline"
                  className="px-6 py-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" /> Volver
                </Button>
              )}
              <Button
                type="submit"
                className="px-6 py-2"
                disabled={loading || !form.formState.isValid}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" /> Cargando
                  </div>
                ) : (
                  <>
                    Continuar <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </section>
        </form>
      </FormProvider>
    </StepLayout>
  );
};

export default StepEntity;
