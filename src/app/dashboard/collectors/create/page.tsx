"use client";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import Language from "@/components/ui/language";
import { Switch } from "@/components/ui/switch";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cog } from "lucide-react";
import { useSession } from "next-auth/react";
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
  status: z.boolean().default(true),
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
        frequency: z.enum(["DAILY", "SEVEN_DAYS", "BIWEEKLY", "MONTHLY"]),
        schedule: z.object({
          preferred_time: z.string().min(1, "El horario es requerido"),
          preferred_days: z
            .array(z.string())
            .min(1, "Selecciona al menos un día de envío"),
        }),
      })
    )
    .min(1, "Debes agregar al menos un segmento"),
});

type FormValues = z.infer<typeof formSchema>;

const PageCreateCollector = () => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const [activeSegment, setActiveSegment] = useState<string>("segment-0");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: true,
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

  const onSubmit = async (data: FormValues) => {
    try {
      // const session = await fetch("/api/auth/session").then((res) =>
      //   res.json()
      // );

      // if (!session?.token) {
      //   toast.error("No se encontró la sesión");
      //   return;
      // }

      // const clientId = session.client?.id;
      // if (!clientId) {
      //   toast.error("No se encontró el ID del cliente");
      //   return;
      // }

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

      const weekendDays = ["S", "D"];

      const requestPayload: CreateCollectorRequest = {
        name: data.name,
        description: data.description,
        frequency: data.segmentations[0]?.frequency || "DAILY",
        channel: channelMapping[data.channel.toLowerCase()] || "EMAIL",
        status: data.status,
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

      console.log("Payload to send:", requestPayload);
      await create(session.token, requestPayload, profile.client_id);
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
