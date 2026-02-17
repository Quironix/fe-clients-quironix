"use client";
import { InfoIcon } from "@/app/dashboard/components/info-icon";
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
        },
      ),
  });

  type DebtorsFormType = z.infer<typeof debtorsSchema>;

  const form = useForm<DebtorsFormType>({
    resolver: zodResolver(debtorsSchema) as any,
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
        session.token,
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
        error instanceof Error
          ? error.message
          : "Error al actualizar los datos",
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
                  title="Políticas de segmentación de deudores"
                  icon={<Calculator size={16} />}
                />
                <p className="text-sm">
                  Clasifica tus clientes en segmentos según su nivel de
                  facturación y su comportamiento de pago (DBT). La combinación
                  de Facturación y DBT le permitirá a Qurionix determinar la
                  prioridad de gestión, los cuadrantes de riesgo y la asignación
                  de tareas automáticas. Para que funcione correctamente, debes
                  definir los rangos que determinarán cada nivel:
                </p>
                <span className="text-sm font-bold flex justify-start gap-2">
                  Facturación{" "}
                  <InfoIcon
                    color="#FF8113"
                    tooltipContent={
                      <div>
                        <p>
                          Permite identificar el peso financiero de cada cliente
                          en tu cartera.
                        </p>
                        <ul>
                          <li>
                            - <strong>Alta:</strong> Clientes con mayor volumen
                            de facturación.
                          </li>
                          <li>
                            - <strong>Media:</strong> Clientes con facturación
                            intermedia.
                          </li>
                          <li>
                            - <strong>Baja:</strong> Clientes con bajo nivel de
                            facturación.
                          </li>
                        </ul>
                      </div>
                    }
                  />
                </span>
                <div className="space-y-2 w-full mt-1">
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="operational.segmentation.low"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Bajo<span className="text-orange-500">*</span>{" "}
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
                            Medio<span className="text-orange-500">*</span>{" "}
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

                <span className="text-sm font-bold mt-5 flex justify-start gap-2">
                  DBT (Days Beyond Terms){" "}
                  <InfoIcon
                    color="#FF8113"
                    tooltipContent={
                      <div>
                        <p>
                          Mide los días promedio que un cliente tarda en pagar
                          después del vencimiento.
                        </p>
                        <ul>
                          <li>
                            - <strong>Alto:</strong> Clientes que pagan muy por
                            encima del plazo acordado (ej. más de 15 días de
                            atraso).
                          </li>
                          <li>
                            - <strong>Medio:</strong> Clientes que pagan con
                            cierto retraso (ej. entre 8 y 15 días).
                          </li>
                          <li>
                            - <strong>Bajo:</strong> Clientes que pagan en
                            término o con poco atraso (menos de 7 días).
                          </li>
                        </ul>
                        <small>
                          Si los rangos no están correctamente definidos, la
                          priorización de la cartera puede no reflejar la
                          realidad financiera del negocio.
                        </small>
                      </div>
                    }
                  />
                </span>
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
                  title="Políticas para ajustes automáticos"
                  icon={<Settings2 size={16} />}
                />
                <p className="text-sm">
                  En esta sección defines las reglas bajo las cuales Quironix
                  podrá compensar o ajustar automáticamente diferencias entre
                  facturas y notas de crédito, sin intervención manual. Una
                  correcta configuración permite reducir tareas operativas y
                  mantener los saldos contables alineados con la realidad
                  financiera.
                </p>
                <div className="space-y-2 w-full mt-1">
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="operational.automatic_nettings_process"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Proceso automático Netting
                            <span className="text-orange-500">*</span>{" "}
                            <InfoIcon
                              color="#FF8113"
                              tooltipContent={
                                <span>
                                  Permite la compensación automática entre
                                  facturas y notas de crédito que estén
                                  correctamente <br />
                                  referenciadas entre sí. Si esta opción está
                                  desactivada, las compensaciones deberán
                                  gestionarse manualmente
                                </span>
                              }
                            />
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
                            <InfoIcon
                              color="#FF8113"
                              tooltipContent={
                                <span>
                                  Define el valor mínimo y máximo que puede
                                  tener una diferencia para que el sistema
                                  realice un ajuste automático. <br />
                                  Este rango controla el nivel de tolerancia
                                  frente a pequeñas diferencias (por ejemplo,
                                  redondeos o ajustes menores).
                                </span>
                              }
                            />
                          </FormLabel>
                          <FormControl>
                            <InputNumberCart
                              value={field.value ?? 0}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 5000"
                              min={0}
                              step={1000}
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
                              step={1000}
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
                  title="Políticas de incumplimiento"
                  icon={<ShieldAlert size={16} />}
                />
                <p className="text-sm">
                  En esta sección defines las reglas que permitirán a Quironix
                  determinar automáticamente cuándo un compromiso de pago debe
                  considerarse cumplido o incumplido. Estos parámetros son
                  fundamentales para medir la confiabilidad de tus deudores y
                  alimentar los indicadores de credibilidad, priorización y
                  gestión.
                </p>
                <div className="space-y-2 w-full mt-1">
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="operational.committed_amount_tolerance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Tolerancia monto comprometido (%)
                            <span className="text-orange-500">*</span>{" "}
                            <InfoIcon
                              color="#FF8113"
                              tooltipContent={
                                <div>
                                  <p>
                                    Define qué porcentaje del monto acordado
                                    debe ser efectivamente pagado para que el
                                    compromiso sea considerado cumplido.
                                  </p>
                                  <p>
                                    Ejemplo: si configuras 90%, un compromiso de
                                    $1.000.000 se considerará cumplido cuando el
                                    pago alcance al menos $900.000.
                                  </p>
                                </div>
                              }
                            />
                          </FormLabel>
                          <FormControl>
                            <InputNumberCart
                              value={field.value ?? 0}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 20%"
                              min={0}
                              max={100}
                              step={1}
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
                            <InfoIcon
                              color="#FF8113"
                              tooltipContent={
                                <div>
                                  <p>
                                    Establece cuántos días adicionales se
                                    otorgarán después de la fecha comprometida
                                    antes de marcar el compromiso como
                                    incumplido. <br />
                                    Si transcurre este plazo sin pago
                                    suficiente, el sistema clasificará
                                    automáticamente el compromiso como
                                    incumplido.
                                  </p>
                                  <br />
                                  <p>Estos criterios afectan:</p>
                                  <ul>
                                    <li>
                                      - El indicador de cumplimiento de
                                      compromisos
                                    </li>
                                    <li>
                                      - La medición de credibilidad del deudor
                                    </li>
                                    <li>
                                      - La priorización automática de gestión
                                    </li>
                                    <li>
                                      - La activación de alertas o acciones
                                      correctivas
                                    </li>
                                    <li></li>
                                  </ul>
                                  <small>
                                    Una configuración demasiado flexible puede
                                    ocultar riesgos reales. Una configuración
                                    demasiado estricta puede generar alertas
                                    innecesarias y distorsionar la evaluación de
                                    la cartera.
                                  </small>
                                </div>
                              }
                            />
                          </FormLabel>
                          <FormControl>
                            <InputNumberCart
                              value={field.value ?? 0}
                              onChange={(val) => field.onChange(val)}
                              placeholder="Ej: 100000"
                              min={0}
                              step={1}
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
