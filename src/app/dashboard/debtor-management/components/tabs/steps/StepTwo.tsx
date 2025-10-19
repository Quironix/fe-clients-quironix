"use client";

import { ManagementFormData } from "@/app/dashboard/debtor-management/components/tabs/add-management-tab";
import TitleStep from "@/app/dashboard/settings/components/title-step";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, ClipboardList, HandCoins } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface StepTwoProps {
  dataDebtor: any;
  formData: ManagementFormData;
  onFormChange: (data: Partial<ManagementFormData>) => void;
}

// Tipos de gestión disponibles
const managementTypes = [
  { value: "outgoing_call", label: "Llamada saliente" },
  { value: "incoming_call", label: "Llamada entrante" },
  { value: "email", label: "Correo electrónico" },
  { value: "visit", label: "Visita" },
  { value: "letter", label: "Carta" },
  { value: "whatsapp", label: "WhatsApp" },
];

// Opciones para comentarios del deudor
const debtorCommentsOptions = [
  { value: "hara_pago", label: "Hará pago" },
  { value: "acepta_pago", label: "Acepta pago" },
  { value: "rechaza_pago", label: "Rechaza pago" },
  { value: "solicita_plazo", label: "Solicita plazo" },
  { value: "no_contesta", label: "No contesta" },
  { value: "otro", label: "Otro" },
];

// Opciones para comentarios del analista
const analystCommentsOptions = [
  { value: "con_compromiso_pago", label: "Con compromiso de pago" },
  { value: "deudor_contactado", label: "Deudor contactado" },
  { value: "sin_respuesta", label: "Sin respuesta" },
  { value: "requiere_seguimiento", label: "Requiere seguimiento" },
  { value: "otro", label: "Otro" },
];

// Configuración de campos condicionales
// Esta es la clave para hacer el componente escalable
const conditionalFieldsConfig = {
  // Si el analista selecciona "con_compromiso_pago", mostrar sección de compromiso
  paymentCommitment: {
    showWhen: (values: any) =>
      values.analystComments === "con_compromiso_pago" ||
      values.debtorComments === "hara_pago",
  },
  // Siempre mostrar próxima gestión cuando haya selecciones completas
  nextManagement: {
    showWhen: (values: any) =>
      values.managementType && values.debtorComments && values.analystComments,
  },
};

// Esquema de validación con Zod - dinámico
const createFormSchema = (showPaymentCommitment: boolean) => {
  const baseSchema = {
    managementType: z.string().min(1, "El tipo de gestión es requerido"),
    debtorComments: z
      .string()
      .min(1, "Los comentarios del deudor son requeridos"),
    analystComments: z
      .string()
      .min(1, "Los comentarios del analista son requeridos"),
  };

  // Agregar validaciones condicionales
  if (showPaymentCommitment) {
    return z.object({
      ...baseSchema,
      paymentCommitmentDate: z
        .string()
        .min(1, "La fecha de compromiso es requerida"),
      paymentCommitmentAmount: z
        .string()
        .min(1, "El monto es requerido")
        .regex(/^\d+$/, "El monto debe ser un número válido"),
      nextManagementDate: z.string().optional(),
      nextManagementTime: z.string().optional(),
    });
  }

  return z.object({
    ...baseSchema,
    paymentCommitmentDate: z.string().optional(),
    paymentCommitmentAmount: z.string().optional(),
    nextManagementDate: z.string().optional(),
    nextManagementTime: z.string().optional(),
  });
};

export const StepTwo = ({ formData, onFormChange }: StepTwoProps) => {
  // Determinar qué secciones mostrar basándose en los valores actuales
  const showPaymentCommitment = useMemo(
    () => conditionalFieldsConfig.paymentCommitment.showWhen(formData),
    [formData]
  );

  const showNextManagement = useMemo(
    () => conditionalFieldsConfig.nextManagement.showWhen(formData),
    [formData]
  );

  const formSchema = useMemo(
    () => createFormSchema(showPaymentCommitment),
    [showPaymentCommitment]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      managementType: formData.managementType || "",
      debtorComments: formData.debtorComments || "",
      analystComments: formData.analystComments || "",
      paymentCommitmentDate: formData.paymentCommitmentDate || "",
      paymentCommitmentAmount: formData.paymentCommitmentAmount || "",
      nextManagementDate: formData.nextManagementDate || "",
      nextManagementTime: formData.nextManagementTime || "",
    },
  });

  // Sincronizar cambios del formulario con el componente padre
  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormChange({
        managementType: value.managementType || "",
        debtorComments: value.debtorComments || "",
        analystComments: value.analystComments || "",
        paymentCommitmentDate: value.paymentCommitmentDate || "",
        paymentCommitmentAmount: value.paymentCommitmentAmount || "",
        nextManagementDate: value.nextManagementDate || "",
        nextManagementTime: value.nextManagementTime || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  return (
    <div className="space-y-3">
      <Form {...form}>
        <form className="space-y-3">
          {/* Sección 1: Gestión */}
          <Accordion
            type="multiple"
            defaultValue={["gestion"]}
            className="w-full space-y-3"
          >
            <AccordionItem
              value="gestion"
              className="border border-gray-200 rounded-md px-3 py-1"
            >
              <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                <AccordionTrigger className="flex items-center justify-between h-full">
                  <TitleStep
                    title="Gestión"
                    icon={<ClipboardList className="w-5 h-5" />}
                  />
                </AccordionTrigger>
              </div>
              <AccordionContent className="flex flex-col gap-4 text-balance px-1 py-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Tipo de Gestión */}
                  <FormField
                    control={form.control}
                    name="managementType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tipo de Gestión{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {managementTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Comentarios del Deudor */}
                  <FormField
                    control={form.control}
                    name="debtorComments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Comentarios del deudor{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {debtorCommentsOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Comentarios del Analista */}
                <FormField
                  control={form.control}
                  name="analystComments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Comentarios del analista{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {analystCommentsOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Sección 2: Compromiso de pago (Condicional) */}
            {showPaymentCommitment && (
              <AccordionItem
                value="compromiso-pago"
                className="border border-gray-200 rounded-md px-3 py-1 mt-5"
              >
                <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                  <AccordionTrigger className="flex items-center justify-between h-full">
                    <TitleStep
                      title="Compromiso de pago"
                      icon={<HandCoins className="w-5 h-5" />}
                    />
                  </AccordionTrigger>
                </div>
                <AccordionContent className="flex flex-col gap-4 text-balance px-1 py-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* Fecha */}
                    <FormField
                      control={form.control}
                      name="paymentCommitmentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Fecha <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              placeholder="DD/MM/AAAA"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Monto */}
                    <FormField
                      control={form.control}
                      name="paymentCommitmentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Monto <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="$500,000"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Sección 3: Próxima gestión (Condicional) */}
            {showNextManagement && (
              <AccordionItem
                value="proxima-gestion"
                className="border border-gray-200 rounded-md px-3 py-1 mt-5"
              >
                <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                  <AccordionTrigger className="flex items-center justify-between h-full">
                    <TitleStep
                      title="Próxima gestión"
                      icon={<CalendarClock className="w-5 h-5" />}
                    />
                  </AccordionTrigger>
                </div>
                <AccordionContent className="flex flex-col gap-4 text-balance px-1 py-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* Fecha */}
                    <FormField
                      control={form.control}
                      name="nextManagementDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Fecha <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              placeholder="DD/MM/AAAA"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Hora */}
                    <FormField
                      control={form.control}
                      name="nextManagementTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Hora <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              placeholder="Completa"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </form>
      </Form>
    </div>
  );
};
