"use client";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import InputNumberCart from "@/components/ui/input-number-cart";
import { Label } from "@/components/ui/label";
import Language from "@/components/ui/language";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Required from "@/components/ui/required";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileCog, FilePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Header from "../components/header";
import { InfoIcon } from "../components/info-icon";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import {
  getCashFlowConfiguration,
  updateCashFlowConfiguration,
} from "./services";

const formSchema = z.object({
  consider_litigation: z.boolean(),
  litigation: z.number().min(0),
  consider_commercial_agreement_invoices: z.boolean(),
  nc_cutoff_days: z.number().min(0),
  upper_range_percentage: z.number().min(0).max(100),
  lower_range_percentage: z.number().min(0).max(100),
  consider_average_n_months: z.boolean(),
  months: z.number().min(1).max(12),
  factor: z.number().min(0),
});

export default function CashFlowPage() {
  const { profile, session } = useProfileContext();
  const [cashFlowConfiguration, setCashFlowConfiguration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      consider_litigation: false,
      litigation: 0,
      consider_commercial_agreement_invoices: false,
      nc_cutoff_days: 0,
      upper_range_percentage: 0,
      lower_range_percentage: 0,
      consider_average_n_months: false,
      months: 1,
      factor: 0,
    },
  });

  useEffect(() => {
    if (profile?.client?.id) {
      getCashFlowConfiguration(session?.token, profile?.client?.id).then(
        (res) => {
          setCashFlowConfiguration(res);
          if (res) {
            form.reset({
              consider_litigation: res.consider_litigation ?? false,
              litigation: res.litigation ?? 0,
              consider_commercial_agreement_invoices:
                res.consider_commercial_agreement_invoices ?? false,
              nc_cutoff_days: res.nc_cutoff_days ?? 0,
              upper_range_percentage: res.upper_range_percentage ?? 0,
              lower_range_percentage: res.lower_range_percentage ?? 0,
              consider_average_n_months: res.consider_average_n_months ?? false,
              months: res.months ?? 1,
              factor: res.factor ?? 0,
            });
          }
        }
      );
    }
  }, [profile?.client?.id, session?.token, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!profile?.client?.id || !session?.token) {
      toast.error("No se pudo obtener la información del cliente");
      return;
    }

    setIsLoading(true);
    try {
      const updatedConfig = await updateCashFlowConfiguration(
        session.token,
        profile.client.id,
        {
          ...data,
          client_id: profile.client.id,
        }
      );

      setCashFlowConfiguration(updatedConfig);
      toast.success("Configuración actualizada exitosamente");
    } catch (error: any) {
      console.error("Error updating configuration:", error);
      toast.error(error.message || "Error al actualizar la configuración");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Flujo de caja"
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<FileCog color="white" />}
          subDescription="Configuración de la cartera"
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="px-6">
              <div className="p-6 flex flex-col gap-6 border-1 border-#E2E8F0 rounded-md">
                {/* Configuración de parámetro */}
                <div className="flex items-center gap-2">
                  <div className="bg-[#F1F5F9] rounded-full p-2 w-10 h-10 flex items-center justify-center">
                    <FilePlus className="text-primary w-8 h-8" />
                  </div>
                  <span className="text-sm font-bold">
                    Configuración de parámetro{" "}
                  </span>
                </div>
                {/* Primera fila */}
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-[500]">
                        Considera litigios <Required />
                      </span>
                      <InfoIcon
                        color="#FF8113"
                        tooltipContent="This is important information!"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="consider_litigation"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) =>
                                field.onChange(value === "true")
                              }
                              value={field.value ? "true" : "false"}
                              className="flex gap-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="true"
                                  id="consider-litigation-yes"
                                />
                                <Label htmlFor="consider-litigation-yes">
                                  Si
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="false"
                                  id="consider-litigation-no"
                                />
                                <Label htmlFor="consider-litigation-no">
                                  No
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-[500]">
                        Litigios <Required />
                      </span>
                      <InfoIcon
                        color="#FF8113"
                        tooltipContent="This is important information!"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="litigation"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputNumberCart
                              value={field.value}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 5000"
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-[500]">
                        ¿Considera facturas de acuerdos comerciales?{" "}
                        <Required />
                      </span>
                      <InfoIcon
                        color="#FF8113"
                        tooltipContent="This is important information!"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="consider_commercial_agreement_invoices"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) =>
                                field.onChange(value === "true")
                              }
                              value={field.value ? "true" : "false"}
                              className="flex gap-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="true"
                                  id="commercial-invoices-yes"
                                />
                                <Label htmlFor="commercial-invoices-yes">
                                  Si
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="false"
                                  id="commercial-invoices-no"
                                />
                                <Label htmlFor="commercial-invoices-no">
                                  No
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Segunda fila */}
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-[500]">
                        Días de corte NC <Required />
                      </span>
                      <InfoIcon
                        color="#FF8113"
                        tooltipContent="This is important information!"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="nc_cutoff_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputNumberCart
                              value={field.value}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 30"
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-[500]">
                        % de rango superior <Required />
                      </span>
                      <InfoIcon
                        color="#FF8113"
                        tooltipContent="This is important information!"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="upper_range_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputNumberCart
                              value={field.value}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 10"
                              min={0}
                              max={100}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-[500]">
                        % de rango inferior <Required />
                      </span>
                      <InfoIcon
                        color="#FF8113"
                        tooltipContent="This is important information!"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="lower_range_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputNumberCart
                              value={field.value}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 5"
                              min={0}
                              max={100}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Tercera fila */}
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-[500]">
                        ¿Considera promedio N meses? <Required />
                      </span>
                      <InfoIcon
                        color="#FF8113"
                        tooltipContent="This is important information!"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="consider_average_n_months"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) =>
                                field.onChange(value === "true")
                              }
                              value={field.value ? "true" : "false"}
                              className="flex gap-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="true"
                                  id="average-months-yes"
                                />
                                <Label htmlFor="average-months-yes">Si</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="false"
                                  id="average-months-no"
                                />
                                <Label htmlFor="average-months-no">No</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-[500]">
                        Meses <Required />
                      </span>
                      <InfoIcon
                        color="#FF8113"
                        tooltipContent="This is important information!"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="months"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputNumberCart
                              value={field.value}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 3"
                              min={1}
                              max={12}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-[500]">
                        Factor <Required />
                      </span>
                      <InfoIcon
                        color="#FF8113"
                        tooltipContent="This is important information!"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="factor"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputNumberCart
                              value={field.value}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 1"
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center mt-4 border-t-2 border-primary pt-4">
                <Button
                  type="submit"
                  className="bg-primary text-white w-[50%] h-[40px]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader size={20} className="text-white" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </div>
            </Card>
          </form>
        </Form>
      </Main>
    </>
  );
}
