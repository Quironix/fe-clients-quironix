"use client";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { create, update } from "../services";
import type {
  CollectorResponse,
  CreateCollectorRequest,
} from "../services/types";
import { GeneralInformationSection } from "./general-information-section";
import { MessageContentSection } from "./message-content-section";
import { SegmentationSection } from "./segmentation-section";

const formSchema = z.object({
  status: z.boolean().default(true),
  send_now: z.boolean().default(false).optional(),
  name: z.string().min(1, "El nombre del collector es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  debt_phases: z
    .array(z.string())
    .min(1, "Selecciona al menos una fase de deuda"),
  channel: z.enum(["EMAIL", "WHATSAPP", "SMS"], {
    required_error: "Selecciona un canal de comunicación",
  }),
  subject: z.string().min(1, "El asunto es requerido"),
  body_message: z.string().min(1, "El cuerpo del mensaje es requerido"),
  send_associate_invoices: z.boolean().default(false),
  segmentations: z
    .array(
      z.object({
        applicable_segment: z
          .string()
          .min(1, "El segmento aplicable es requerido"),
        min_delay_days: z.string().min(1, "Los días de atraso son requeridos"),
        exclusions: z.array(z.string()).default([]),
        frequency: z.enum(["DAILY", "SEVEN_DAYS", "BIWEEKLY", "MONTHLY"], {
          required_error: "La frecuencia de envío es requerida",
          invalid_type_error: "Selecciona una frecuencia válida",
        }),
        schedule: z.object({
          preferred_time: z.string().min(1, "El horario es requerido"),
          preferred_days: z
            .array(z.string())
            .min(1, "Selecciona al menos un día de envío"),
        }),
      })
    )
    .min(1, "Debes agregar al menos un segmento")
    .refine(
      (segments) => {
        const applicableSegments = segments.map((s) => s.applicable_segment);
        return new Set(applicableSegments).size === applicableSegments.length;
      },
      {
        message:
          "No puedes tener segmentos duplicados con el mismo segmento aplicable",
      }
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface CollectorFormProps {
  mode: "create" | "edit";
  initialData?: CollectorResponse;
  accessToken: string;
  clientId: string;
}

export const CollectorForm = ({
  mode,
  initialData,
  accessToken,
  clientId,
}: CollectorFormProps) => {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState<string>("segment-0");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: true,
      send_now: false,
      name: "",
      description: "",
      debt_phases: [],
      channel: "EMAIL",
      subject: "",
      body_message: "",
      send_associate_invoices: false,
      segmentations: [
        {
          applicable_segment: "",
          min_delay_days: "",
          exclusions: [],
          frequency: "MONTHLY",
          schedule: {
            preferred_time: "",
            preferred_days: [],
          },
        },
      ],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "segmentations",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        status: initialData.status,
        send_now: initialData.send_now || false,
        name: initialData.name,
        description: initialData.description,
        debt_phases: initialData.debtPhases.map(String),
        channel: initialData.channel as "EMAIL" | "WHATSAPP" | "SMS",
        subject: initialData.subject,
        body_message: initialData.bodyMessage,
        send_associate_invoices: initialData.sendAssociateInvoices,
        segmentations: initialData.segmentations.map((seg) => {
          const exclusions: string[] = [];
          if (seg.exclusions.exclude_cash_documents)
            exclusions.push("cash_documents");
          if (seg.exclusions.exclude_protested_checks)
            exclusions.push("protested_checks");
          if (seg.exclusions.exclude_promissory_notes)
            exclusions.push("promissory_notes");
          if (seg.exclusions.exclude_credit_notes)
            exclusions.push("credit_notes");

          return {
            applicable_segment: seg.applicable_segment,
            min_delay_days: String(seg.min_delay_days),
            exclusions,
            frequency: seg.frequency as
              | "DAILY"
              | "SEVEN_DAYS"
              | "BIWEEKLY"
              | "MONTHLY",
            schedule: {
              preferred_time: seg.schedule.preferred_time,
              preferred_days: seg.schedule.preferred_days || [],
            },
          };
        }),
      });
    }
  }, [mode, initialData, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const exclusionMapping: Record<
        string,
        keyof CreateCollectorRequest["segmentations"][0]["exclusions"]
      > = {
        cash_documents: "exclude_cash_documents",
        protested_checks: "exclude_protested_checks",
        promissory_notes: "exclude_promissory_notes",
        credit_notes: "exclude_credit_notes",
      };

      const weekendDays = ["S", "D"];

      const requestPayload: CreateCollectorRequest = {
        name: data.name,
        description: data.description,
        frequency: data.segmentations[0]?.frequency || "DAILY",
        channel: data.channel,
        status: data.status,
        send_now: data.send_now,
        debt_phases: data.debt_phases.map(Number),
        subject: data.subject,
        body_message: data.body_message,
        send_associate_invoices: data.send_associate_invoices,
        segmentations: data.segmentations.map((segment) => {
          const hasWeekendDays = segment.schedule.preferred_days.some((day) =>
            weekendDays.includes(day)
          );

          const exclusions: CreateCollectorRequest["segmentations"][0]["exclusions"] =
            {};

          segment.exclusions.forEach((exclusion) => {
            const mappedKey = exclusionMapping[exclusion];
            if (mappedKey) {
              exclusions[mappedKey] = true;
            }
          });

          if (!hasWeekendDays) {
            exclusions.exclude_weekends = true;
          }

          return {
            applicable_segment: segment.applicable_segment,
            min_delay_days: Number(segment.min_delay_days),
            frequency: segment.frequency,
            exclusions,
            schedule: {
              preferred_time: segment.schedule.preferred_time,
              preferred_days: segment.schedule.preferred_days,
            },
          };
        }),
      };

      if (mode === "create") {
        await create(accessToken, requestPayload, clientId);
        toast.success("Collector creado exitosamente");
        router.push("/dashboard/collectors");
      } else {
        await update(accessToken, initialData!.id, requestPayload, clientId);
        toast.success("Collector actualizado exitosamente");
        router.push("/dashboard/collectors");
      }
    } catch (error) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} collector:`,
        error
      );
      toast.error(
        error instanceof Error
          ? error.message
          : `Error al ${mode === "create" ? "crear" : "actualizar"} el collector`
      );
    }
  };

  const onError = (errors: any) => {
    if (errors.segmentations?.root?.message) {
      toast.error(errors.segmentations.root.message);
    } else if (errors.segmentations?.message) {
      toast.error(errors.segmentations.message);
    } else if (errors.segmentations) {
      const firstError = Object.values(errors.segmentations).find(
        (err: any) => err?.message
      );
      if (
        firstError &&
        typeof firstError === "object" &&
        "message" in firstError
      ) {
        toast.error(firstError.message as string);
      } else {
        toast.error(
          "Por favor, completa todos los campos requeridos en los segmentos"
        );
      }
    }
  };

  const isSendNow = form.watch("send_now");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-5"
      >
        <div className="bg-blue-50 p-5 flex justify-between items-center rounded-md mb-5">
          <div className="flex flex-col gap-0">
            <span className="font-bold">Estado inicial</span>
            <span className="-mt-1 text-sm text-gray-600">
              El collector enviará notificaciones automáticamente
            </span>
          </div>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Accordion
          type="multiple"
          defaultValue={["general-information"]}
          className="w-full space-y-5"
        >
          <GeneralInformationSection form={form} />
          <MessageContentSection form={form} />
          <SegmentationSection
            form={form}
            fieldArray={fieldArray}
            activeSegment={activeSegment}
            setActiveSegment={setActiveSegment}
          />
        </Accordion>

        <div className="bg-amber-50 p-5 flex justify-between items-center rounded-md mb-5">
          <FormField
            control={form.control}
            name="send_now"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center space-x-2 w-full">
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                    <label
                      htmlFor="send_now"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <div className="flex flex-col gap-0">
                        <span className="font-bold">Enviar ahora</span>
                        <span className=" text-sm text-gray-600">
                          El collector enviará notificaciones a los clientes que
                          cumplan con los criterios establecidos inmediatamente
                          después de crear el collector.
                        </span>
                      </div>
                    </label>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/collectors")}
          >
            Cancelar
          </Button>
          <Button type="submit">
            {mode === "create"
              ? isSendNow
                ? "Guardar y enviar"
                : "Guardar"
              : "Actualizar collector"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
