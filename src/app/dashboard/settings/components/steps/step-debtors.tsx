"use client";
import Stepper from "@/components/Stepper";
import { StepProps } from "../../types";
import StepLayout from "../StepLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Calculator,
  Cog,
  Loader,
  Settings2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TitleStep from "../title-step";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import InputNumberCart from "@/components/ui/input-number-cart";

const StepDebtors: React.FC<StepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  const [loading, setLoading] = useState(false);

  const debtorsSchema = z.object({
    operational: z.object({
      segmentation: z.object({
        low: z.number().min(0, "El valor mínimo es requerido"),
        medium: z.number().min(0, "El valor medio es requerido"),
        high: z.number().min(0, "El valor alto es requerido"),
      }),
      dbt: z.object({
        low: z.number().min(0, "El valor mínimo es requerido"),
        medium: z.number().min(0, "El valor medio es requerido"),
        high: z.number().min(0, "El valor alto es requerido"),
      }),
      automatic_nettings_process: z.boolean().default(false),
      amount_from: z.number().min(0, "El valor mínimo es requerido"),
      amount_to: z.number().min(0, "El valor máximo es requerido"),
      committed_amount_tolerance: z
        .number()
        .min(0, "El valor mínimo es requerido"),
      days_tolerance: z.number().min(0, "El valor mínimo es requerido"),
    }),
  });

  const form = useForm<z.infer<typeof debtorsSchema>>({
    resolver: zodResolver(debtorsSchema),
    defaultValues: {
      operational: {
        segmentation: {
          low: 0,
          medium: 0,
          high: 0,
        },
        dbt: {
          low: 0,
          medium: 0,
          high: 0,
        },
        automatic_nettings_process: false,
        amount_from: 0,
        amount_to: 0,
        committed_amount_tolerance: 0,
        days_tolerance: 0,
      },
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        operational: {
          segmentation: {
            low: profile?.client?.operational?.segmentation?.low || 0,
            medium: profile?.client?.operational?.segmentation?.medium || 0,
            high: profile?.client?.operational?.segmentation?.high || 0,
          },
          dbt: {
            low: profile?.client?.operational?.dbt?.low || 0,
            medium: profile?.client?.operational?.dbt?.medium || 0,
            high: profile?.client?.operational?.dbt?.high || 0,
          },
          automatic_nettings_process:
            profile?.client?.operational?.automatic_nettings_process || false,
          amount_from: profile?.client?.operational?.amount_from || 0,
          amount_to: profile?.client?.operational?.amount_to || 0,
          committed_amount_tolerance:
            profile?.client?.operational?.committed_amount_tolerance || 0,
          days_tolerance: profile?.client?.operational?.days_tolerance || 0,
        },
      });
    }
  }, [profile, form]);

  const handleSubmit = (data: z.infer<typeof debtorsSchema>) => {
    console.log(data);
  };

  return (
    <StepLayout>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="h-full w-full space-y-6"
          autoComplete="off"
        >
          <section className="h-full">
            <div className="h-1/6 ">
              <Stepper
                steps={steps}
                currentStep={currentStep}
                onStepChange={onStepChange}
              />
            </div>
            <div className="h-4/6 space-y-4">
              <div className="border border-gray-200 rounded-md p-5 space-y-3 w-full">
                <TitleStep
                  title="Criterios de segmentación de deudores"
                  icon={<Calculator size={16} />}
                />
                <span className="text-sm font-bold">Facturación</span>
                <div className="space-y-2 w-full mt-1">
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="operational.segmentation.low"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Bajo<span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operational.segmentation.medium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Medio<span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 2"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operational.segmentation.high"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Alto<span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 3"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <span className="text-sm font-bold mt-5">DBT</span>
                <div className="space-y-2 w-full mt-1">
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="operational.dbt.low"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Bajo<span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operational.dbt.medium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Medio<span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 2"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operational.dbt.high"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Alto<span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 3"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-md p-5 space-y-3 w-full">
                <TitleStep
                  title="Criterios para ajustes automáticos"
                  icon={<Settings2 size={16} />}
                />
                <div className="space-y-2 w-full mt-1">
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="operational.automatic_nettings_process"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Proceso automático Netting
                            <span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={(field.value as boolean) || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operational.amount_from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Monto desde
                            <span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <InputNumberCart
                              value={field.value ?? 0}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 100000"
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operational.amount_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Monto desde
                            <span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <InputNumberCart
                              value={field.value ?? 0}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 100000"
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
                onClick={onNext}
                className="px-6 py-2"
                disabled={loading}
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

export default StepDebtors;
