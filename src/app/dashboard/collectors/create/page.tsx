"use client";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import Language from "@/components/ui/language";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cog } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import { GeneralInformationSection } from "../components/general-information-section";
import { MessageContentSection } from "../components/message-content-section";
import { SegmentationSection } from "../components/segmentation-section";
import { create } from "../services";
import type { CreateCollectorRequest } from "../services/types";

const formSchema = z.object({
  isActive: z.boolean().default(true),
  collectorName: z.string().min(1, "El nombre del collector es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  debtPhases: z
    .array(z.string())
    .min(1, "Selecciona al menos una fase de deuda"),
  communicationChannel: z.enum(["email", "whatsapp", "sms"], {
    required_error: "Selecciona un canal de comunicación",
  }),
  subject: z.string().min(1, "El asunto es requerido"),
  messageBody: z.string().min(1, "El cuerpo del mensaje es requerido"),
  attachInvoice: z.boolean().default(false),
  segments: z
    .array(
      z.object({
        applicableSegment: z
          .string()
          .min(1, "El segmento aplicable es requerido"),
        minimumDaysOverdue: z
          .string()
          .min(1, "Los días de atraso son requeridos"),
        exclusions: z.array(z.string()).default([]),
        frequency: z.string().min(1, "La frecuencia es requerida"),
        schedule: z.string().min(1, "El horario es requerido"),
        sendingDays: z
          .array(z.string())
          .min(1, "Selecciona al menos un día de envío"),
      })
    )
    .min(1, "Debes agregar al menos un segmento"),
});

type FormValues = z.infer<typeof formSchema>;

const PageCreateCollector = () => {
  const [activeSegment, setActiveSegment] = useState<string>("segment-0");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isActive: true,
      collectorName: "",
      description: "",
      debtPhases: [],
      communicationChannel: "email",
      subject: "",
      messageBody: "",
      attachInvoice: false,
      segments: [
        {
          applicableSegment: "",
          minimumDaysOverdue: "",
          exclusions: [],
          frequency: "",
          schedule: "",
          sendingDays: [],
        },
      ],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "segments",
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const session = await fetch("/api/auth/session").then((res) =>
        res.json()
      );

      if (!session?.token) {
        toast.error("No se encontró la sesión");
        return;
      }

      const clientId = session.client?.id;
      if (!clientId) {
        toast.error("No se encontró el ID del cliente");
        return;
      }

      const exclusionMapping: Record<
        string,
        keyof CreateCollectorRequest["segmentations"][0]["exclusions"]
      > = {
        cash_documents: "exclude_cash_documents",
        protested_checks: "exclude_protested_checks",
        promissory_notes: "exclude_promissory_notes",
        credit_notes: "exclude_credit_notes",
      };

      const channelMapping: Record<string, "EMAIL" | "WHATSAPP" | "SMS"> = {
        email: "EMAIL",
        whatsapp: "WHATSAPP",
        sms: "SMS",
      };

      const payload: CreateCollectorRequest = {
        name: data.collectorName,
        description: data.description,
        frequency: data.segments[0]?.frequency || "DAILY",
        channel: channelMapping[data.communicationChannel],
        status: data.isActive,
        debt_phases: data.debtPhases.map(Number),
        subject: data.subject,
        body_message: data.messageBody,
        send_associate_invoices: data.attachInvoice,
        segmentations: data.segments.map((segment) => {
          const weekendDays = ["S", "D"];
          const hasWeekendDays = segment.sendingDays.some((day) =>
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
            applicable_segment: segment.applicableSegment,
            min_delay_days: Number(segment.minimumDaysOverdue),
            frequency: segment.frequency,
            exclusions,
            schedule: {
              preferred_time: segment.schedule,
              timezone: "America/Santiago",
            },
          };
        }),
      };

      await create(session.token, payload, clientId);
      toast.success("Collector creado exitosamente");
    } catch (error) {
      console.error("Error creating collector:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear el collector"
      );
    }
  };
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Crear collectors"
          description="Aquí puedes crear un collectors."
          icon={<Cog color="white" />}
          subDescription="Collectors"
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="bg-blue-50 p-5 flex justify-between items-center rounded-md mb-5">
              <div className="flex flex-col gap-0">
                <span className="font-bold">Estado inicial</span>
                <span className="-mt-1 text-sm text-gray-600">
                  El collector enviará notificaciones automáticamente
                </span>
              </div>
              <FormField
                control={form.control}
                name="isActive"
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

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="submit">Crear collector</Button>
            </div>
          </form>
        </Form>
      </Main>
    </>
  );
};

export default PageCreateCollector;
