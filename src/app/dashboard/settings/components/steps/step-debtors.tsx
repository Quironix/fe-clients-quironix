"use client";
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
import InputNumberCart from "@/components/ui/input-number-cart";
import { Switch } from "@/components/ui/switch";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Calculator,
  Loader,
  Settings2,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateDataClient } from "../../services";
import { StepProps } from "../../types";
import StepLayout from "../StepLayout";
import TitleStep from "../title-step";

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
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { session, refreshProfile } = useProfileContext();

  const debtorsSchema = z.object({
    operational: z
      .object({
        segmentation: z
          .object({
            low: z
              .number()
              .min(0, "El valor mínimo debe ser mayor o igual a 0"),
            medium: z
              .number()
              .min(0, "El valor medio debe ser mayor o igual a 0"),
            high: z.number().min(0, "El valor alto debe ser mayor o igual a 0"),
          })
          .superRefine((data, ctx) => {
            if (data.low === 0 && data.medium === 0 && data.high === 0) return;

            if (data.low >= data.medium) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El valor bajo debe ser menor que el valor medio",
                path: ["low"],
              });
            }

            if (data.medium >= data.high) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El valor medio debe ser menor que el valor alto",
                path: ["medium"],
              });
            }
          }),
        dbt: z
          .object({
            low: z
              .number()
              .min(0, "El valor mínimo debe ser mayor o igual a 0"),
            medium: z
              .number()
              .min(0, "El valor medio debe ser mayor o igual a 0"),
            high: z.number().min(0, "El valor alto debe ser mayor o igual a 0"),
          })
          .superRefine((data, ctx) => {
            if (data.low === 0 && data.medium === 0 && data.high === 0) return;

            if (data.low >= data.medium) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El valor bajo debe ser menor que el valor medio",
                path: ["low"],
              });
            }

            if (data.medium >= data.high) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El valor medio debe ser menor que el valor alto",
                path: ["medium"],
              });
            }
          }),
        automatic_nettings_process: z.boolean(),
        amount_from: z
          .number()
          .min(0, "El monto inicial debe ser mayor o igual a 0"),
        amount_to: z
          .number()
          .min(0, "El monto final debe ser mayor o igual a 0"),
        committed_amount_tolerance: z
          .number()
          .min(0, "La tolerancia debe ser mayor o igual a 0")
          .max(100, "La tolerancia no puede ser mayor a 100%"),
        days_tolerance: z
          .number()
          .min(0, "Los días de tolerancia deben ser mayor o igual a 0"),
      })
      .refine(
        (data) => {
          if (data.amount_from === 0 && data.amount_to === 0) return true;
          return data.amount_from < data.amount_to;
        },
        {
          message: "El monto inicial debe ser menor al monto final",
          path: ["amount_from"],
        }
      ),
  });

  type DebtorsFormType = z.infer<typeof debtorsSchema>;

  const form = useForm<DebtorsFormType>({
    resolver: zodResolver(debtorsSchema),
    defaultValues: {
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
          profile?.client?.operational?.committed_amount_tolerance || 20,
        days_tolerance: profile?.client?.operational?.days_tolerance || 0,
      },
    },
    mode: "onChange",
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

  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Estado del formulario actualizado:", {
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
        values: value,
        hasChanges: hasFormChanges(),
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const hasFormChanges = () => {
    const currentValues = form.getValues();
    const initialValues = {
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
    };

    return JSON.stringify(currentValues) !== JSON.stringify(initialValues);
  };

  useEffect(() => {
    if (!profile || !session) {
      toast.error("No se pudo cargar la información del perfil");
      return;
    }
    setIsLoadingProfile(false);
  }, [profile, session]);

  const handleSubmit = async (data: z.infer<typeof debtorsSchema>) => {
    try {
      if (!profile?.client_id || !session?.token) {
        toast.error("No se encontró la información necesaria para actualizar");
        return;
      }

      if (!hasFormChanges()) {
        onNext();
        return;
      }

      setLoading(true);

      const formData = {
        operational: {
          ...data.operational,
        },
      };

      const response = await updateDataClient(
        formData,
        profile.client_id,
        session.token
      );

      if (!response.error) {
        await refreshProfile();
        toast.success("Datos actualizados correctamente");
        onNext();
      } else {
        toast.error(response.message || "Error al actualizar los datos");
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar los datos"
      );
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

  if (isLoadingProfile) {
    return (
      <StepLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Cargando información...</span>
          </div>
        </div>
      </StepLayout>
    );
  }

  return (
    <StepLayout>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          onKeyDown={handleKeyDown}
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
            <div className="h-4/6 overflow-y-auto space-y-4">
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
                              value={Number(field.value) || 0}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                              value={Number(field.value) || 0}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                              value={Number(field.value) || 0}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                              value={Number(field.value) || 0}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                              value={Number(field.value) || 0}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                              value={Number(field.value) || 0}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                      name="operational.amount_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Monto hasta
                            <span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <InputNumberCart
                              value={field.value ?? 0}
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
                </div>
              </div>

              <div className="border border-gray-200 rounded-md p-5 space-y-3 w-full">
                <TitleStep
                  title="Criterios de incumplimiento"
                  icon={<ShieldAlert size={16} />}
                />
                <div className="space-y-2 w-full mt-1">
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="operational.committed_amount_tolerance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Tolerancia monto comprometido (%)
                            <span className="text-orange-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <InputNumberCart
                              value={field.value ?? 0}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 20%"
                              min={0}
                              max={100}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operational.days_tolerance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Tolerancia en días
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
              className={`h-1/6 flex items-center mt-6 ${isFirstStep ? "justify-end" : "justify-between"}`}
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
                disabled={
                  loading || (form.formState.isDirty && !form.formState.isValid)
                }
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
