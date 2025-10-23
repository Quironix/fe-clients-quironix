"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Language from "@/components/ui/language";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronsUpDown,
  CircleAlert,
  Cog,
  FileText,
  FolderTree,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import TitleStep from "../../settings/components/title-step";

const daysOfWeek = [
  { value: "L", label: "L" },
  { value: "M", label: "M" },
  { value: "X", label: "X" },
  { value: "J", label: "J" },
  { value: "V", label: "V" },
  { value: "S", label: "S" },
  { value: "D", label: "D" },
];

const debtPhaseOptions = [
  { value: "1", label: "Fase 1" },
  { value: "2", label: "Fase 2" },
  { value: "3", label: "Fase 3" },
  { value: "4", label: "Fase 4" },
  { value: "5", label: "Fase 5" },
  { value: "6", label: "Fase 6" },
  { value: "7", label: "Fase 7" },
  { value: "8", label: "Fase 8" },
];

const exclusionOptions = [
  { id: "cash_documents", label: "Documentos al contado" },
  { id: "protested_checks", label: "Cheques protestados" },
  { id: "promissory_notes", label: "Pagarés" },
  { id: "credit_notes", label: "Notas de crédito" },
];

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "segments",
  });

  const addSegment = () => {
    const newIndex = fields.length;
    append({
      applicableSegment: "",
      minimumDaysOverdue: "",
      exclusions: [],
      frequency: "",
      schedule: "",
      sendingDays: [],
    });
    setActiveSegment(`segment-${newIndex}`);
  };

  const removeSegment = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      toast.success("Segmento eliminado");
    } else {
      toast.error("Debe haber al menos un segmento");
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Form data:", data);
      toast.success("Collector creado exitosamente");
    } catch (error) {
      console.error("Error creating collector:", error);
      toast.error("Error al crear el collector");
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
              defaultValue={["general-information"]} // Expandir todos por defecto]}
              className="w-full space-y-5"
            >
              {/* ISLA 1: Información general */}
              <AccordionItem
                key="general-information"
                value="general-information"
                className="border border-gray-200 rounded-md px-4 py-2 mb-5"
              >
                <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                  <AccordionTrigger className="flex items-center justify-between h-full">
                    <TitleStep
                      title="Información general"
                      icon={<User className="w-5 h-5" />}
                    />
                  </AccordionTrigger>
                </div>
                <AccordionContent className="grid grid-cols-3 gap-4 text-balance px-1 py-4 items-start">
                  <FormField
                    control={form.control}
                    name="collectorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nombre del collector{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Completa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Descripción general{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Completa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="debtPhases"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Fases de la deuda{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value?.length &&
                                    "text-muted-foreground"
                                )}
                              >
                                {field.value?.length > 0
                                  ? `${field.value.length} fase${
                                      field.value.length > 1 ? "s" : ""
                                    } seleccionada${
                                      field.value.length > 1 ? "s" : ""
                                    }`
                                  : "Selecciona fases"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Buscar fase..." />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontró ninguna fase.
                                </CommandEmpty>
                                <CommandGroup>
                                  {debtPhaseOptions.map((phase) => (
                                    <CommandItem
                                      key={phase.value}
                                      onSelect={() => {
                                        const newValue = field.value?.includes(
                                          phase.value
                                        )
                                          ? field.value.filter(
                                              (val) => val !== phase.value
                                            )
                                          : [
                                              ...(field.value || []),
                                              phase.value,
                                            ];
                                        field.onChange(newValue);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value?.includes(phase.value)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {phase.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {field.value?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {[...field.value]
                              .sort((a, b) => Number(a) - Number(b))
                              .map((val) => {
                                const phase = debtPhaseOptions.find(
                                  (p) => p.value === val
                                );
                                return (
                                  <Badge
                                    key={val}
                                    variant="secondary"
                                    className="flex items-center gap-1 pr-1"
                                  >
                                    {phase?.label}
                                    <button
                                      type="button"
                                      className="ml-1 rounded-full  cursor-pointer"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        field.onChange(
                                          field.value.filter((v) => v !== val)
                                        );
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                );
                              })}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* ISLA 2: Contenido del mensaje adjunto */}
              <AccordionItem
                key="message-content"
                value="message-content"
                className="border border-gray-200 rounded-md px-4 py-2 mb-5"
              >
                <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                  <AccordionTrigger className="flex items-center justify-between h-full">
                    <TitleStep
                      title="Contenido del mensaje y adjuntos"
                      icon={<FileText className="w-5 h-5" />}
                    />
                  </AccordionTrigger>
                </div>
                <AccordionContent className="space-y-4 px-1 py-4">
                  <FormField
                    control={form.control}
                    name="communicationChannel"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          Canal de comunicación{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="email" id="email" />
                              <label htmlFor="email" className="cursor-pointer">
                                Correo electrónico
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="whatsapp" id="whatsapp" />
                              <label
                                htmlFor="whatsapp"
                                className="cursor-pointer"
                              >
                                WhatsApp
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sms" id="sms" />
                              <label htmlFor="sms" className="cursor-pointer">
                                Mensaje de texto
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-[1fr_300px] gap-4">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              Asunto <span className="text-red-500">*</span>{" "}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <CircleAlert
                                    fill="#FF8113"
                                    stroke="#fff"
                                    className="rotate-180"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>
                                    Agrega variables dínamicas al asunto
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: Tu factura de..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="messageBody"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Cuerpo del mensaje{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Completa"
                                rows={5}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="attachInvoice"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Adjuntar factura</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Enviar facturas asociadas
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border border-gray-200 rounded-md p-4 h-fit">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-sm">
                          Variables disponibles
                        </h4>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7"
                        >
                          + Variable
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-700">N° de factura</span>
                          <code className="text-xs text-blue-600">
                            [[num_factura]]
                          </code>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-700">Fecha</span>
                          <code className="text-xs text-blue-600">
                            [[fecha]]
                          </code>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-700">
                            Nombre de la empresa
                          </span>
                          <code className="text-xs text-blue-600">
                            [[empresa]]
                          </code>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-700">Monto total</span>
                          <code className="text-xs text-blue-600">
                            [[monto_total]]
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ISLA 3: Segmentación y lógica de envío */}
              <AccordionItem
                key="segmentation-logic"
                value="segmentation-logic"
                className="border border-gray-200 rounded-md px-4 py-2 mb-5"
              >
                <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                  <AccordionTrigger className="flex items-center justify-between h-full">
                    <TitleStep
                      title="Segmentación y lógica de envíos"
                      icon={<FolderTree className="w-5 h-5" />}
                    />
                  </AccordionTrigger>
                </div>
                <AccordionContent className="space-y-4 px-1 py-4">
                  {fields.map((field, index) => (
                    <Accordion
                      key={field.id}
                      type="single"
                      collapsible
                      value={activeSegment}
                      onValueChange={setActiveSegment}
                      className="border border-gray-200 rounded-md"
                    >
                      <AccordionItem
                        value={`segment-${index}`}
                        className="border-none"
                      >
                        <div className="px-4 py-2">
                          <div className="flex items-center justify-between">
                            <AccordionTrigger className="hover:no-underline py-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  Segmento {index + 1}
                                </span>
                              </div>
                            </AccordionTrigger>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSegment(index)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <AccordionContent className="px-4 pb-4">
                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`segments.${index}.applicableSegment`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Segmento aplicable{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Completa" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="all">Todos</SelectItem>
                                      <SelectItem value="vip">VIP</SelectItem>
                                      <SelectItem value="regular">
                                        Regular
                                      </SelectItem>
                                      <SelectItem value="high-risk">
                                        Alto riesgo
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`segments.${index}.minimumDaysOverdue`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Días de atraso mínimo{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="0">0 días</SelectItem>
                                      <SelectItem value="15">
                                        15 días
                                      </SelectItem>
                                      <SelectItem value="30">
                                        30 días
                                      </SelectItem>
                                      <SelectItem value="60">
                                        60 días
                                      </SelectItem>
                                      <SelectItem value="90">
                                        90 días
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`segments.${index}.exclusions`}
                              render={() => (
                                <FormItem>
                                  <FormLabel>Exclusiones</FormLabel>
                                  <div className="space-y-2">
                                    {exclusionOptions.map((option) => (
                                      <FormField
                                        key={option.id}
                                        control={form.control}
                                        name={`segments.${index}.exclusions`}
                                        render={({ field }) => {
                                          return (
                                            <FormItem
                                              key={option.id}
                                              className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value?.includes(
                                                    option.id
                                                  )}
                                                  onCheckedChange={(
                                                    checked
                                                  ) => {
                                                    return checked
                                                      ? field.onChange([
                                                          ...field.value,
                                                          option.id,
                                                        ])
                                                      : field.onChange(
                                                          field.value?.filter(
                                                            (value) =>
                                                              value !==
                                                              option.id
                                                          )
                                                        );
                                                  }}
                                                />
                                              </FormControl>
                                              <FormLabel className="font-normal">
                                                {option.label}
                                              </FormLabel>
                                            </FormItem>
                                          );
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`segments.${index}.frequency`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Frecuencia{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="daily">
                                        Diaria
                                      </SelectItem>
                                      <SelectItem value="weekly">
                                        Semanal
                                      </SelectItem>
                                      <SelectItem value="biweekly">
                                        Quincenal
                                      </SelectItem>
                                      <SelectItem value="monthly">
                                        Mensual
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`segments.${index}.schedule`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Horario{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="09:00">
                                        09:00 AM
                                      </SelectItem>
                                      <SelectItem value="12:00">
                                        12:00 PM
                                      </SelectItem>
                                      <SelectItem value="15:00">
                                        03:00 PM
                                      </SelectItem>
                                      <SelectItem value="18:00">
                                        06:00 PM
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`segments.${index}.sendingDays`}
                              render={() => (
                                <FormItem>
                                  <FormLabel>
                                    Días de envío{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <div className="flex gap-2">
                                    {daysOfWeek.map((day) => (
                                      <FormField
                                        key={day.value}
                                        control={form.control}
                                        name={`segments.${index}.sendingDays`}
                                        render={({ field }) => {
                                          return (
                                            <FormItem key={day.value}>
                                              <FormControl>
                                                <Button
                                                  type="button"
                                                  variant={
                                                    field.value?.includes(
                                                      day.value
                                                    )
                                                      ? "default"
                                                      : "outline"
                                                  }
                                                  size="sm"
                                                  className="w-10 h-10 p-0"
                                                  onClick={() => {
                                                    const isSelected =
                                                      field.value?.includes(
                                                        day.value
                                                      );
                                                    if (isSelected) {
                                                      field.onChange(
                                                        field.value.filter(
                                                          (v) => v !== day.value
                                                        )
                                                      );
                                                    } else {
                                                      field.onChange([
                                                        ...(field.value || []),
                                                        day.value,
                                                      ]);
                                                    }
                                                  }}
                                                >
                                                  {day.label}
                                                </Button>
                                              </FormControl>
                                            </FormItem>
                                          );
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSegment}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar segmento
                  </Button>
                </AccordionContent>
              </AccordionItem>
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
