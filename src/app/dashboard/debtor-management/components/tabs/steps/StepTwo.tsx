"use client";

import { DatePopover } from "@/app/dashboard/components/date-popover";
import { TimePopover } from "@/app/dashboard/components/time-popover";
import {
  DebtorContact,
  ManagementFormData,
} from "@/app/dashboard/debtor-management/components/tabs/add-management-tab";
import {
  CONTACT_TYPE_OPTIONS,
  FieldConfig,
  getExecutiveCommentOptions,
  getManagementCombination,
  MANAGEMENT_TYPES,
} from "@/app/dashboard/debtor-management/config/management-types";
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
import { Textarea } from "@/components/ui/textarea";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClock,
  ClipboardList,
  MessageSquare,
  Phone,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Invoice } from "@/app/dashboard/payment-plans/store";

interface StepTwoProps {
  dataDebtor: any;
  formData: ManagementFormData;
  onFormChange: (data: Partial<ManagementFormData>) => void;
  selectedInvoices?: Invoice[];
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Genera esquema de validación dinámico
 */
const createFormSchema = (hasCompleteSelection: boolean, selectedCombination: any) => {
  const baseSchema: any = {
    managementType: z.string().min(1, "Debe seleccionar un tipo de gestión"),
    debtorComment: z
      .string()
      .min(1, "Debe seleccionar un comentario del deudor"),
    executiveComment: z
      .string()
      .min(1, "Debe seleccionar un comentario del ejecutivo"),
  };

  // Solo validar otros campos si la selección está completa
  if (hasCompleteSelection) {
    baseSchema.contactType = z
      .string()
      .min(1, "Debe seleccionar un tipo de contacto");
    baseSchema.contactValue = z
      .string()
      .min(1, "Debe ingresar el valor de contacto");
    baseSchema.observation = z.string().optional();
    baseSchema.nextManagementDate = z
      .union([z.string(), z.date()])
      .refine((val) => val !== "" && val !== null, {
        message: "Debe seleccionar una fecha",
      });
    baseSchema.nextManagementTime = z
      .string()
      .min(1, "Debe seleccionar una hora");

    // Validar caseData para componentes de tipo litigio
    if (selectedCombination?.executive_comment === "DOCUMENT_IN_LITIGATION") {
      baseSchema.caseData = z.object({
        litigationData: z.object({
          litigations: z.array(z.object({
            selectedInvoiceIds: z.array(z.string()).min(1, "Debe seleccionar al menos una factura"),
            litigationAmount: z.string().optional(),
            reason: z.string().min(1, "El motivo es requerido"),
            subreason: z.string().min(1, "El submotivo es requerido"),
          })).min(1, "Debe crear al menos un litigio"),
          _isValid: z.boolean().optional(),
        }).refine((data) => data._isValid !== false, {
          message: "Debe completar todos los campos requeridos del litigio",
        }),
      });
    } else if (selectedCombination?.fields && selectedCombination.fields.length > 0) {
      // Validar campos dinámicos según su configuración
      const caseDataSchema: any = {};

      selectedCombination.fields.forEach((field: FieldConfig) => {
        if (field.required) {
          if (field.type === "number") {
            caseDataSchema[field.name] = z.coerce.number().min(1, `${field.label} es requerido`);
          } else if (field.type === "date") {
            caseDataSchema[field.name] = z
              .union([z.string(), z.date()])
              .refine((val) => val !== "" && val !== null, {
                message: `${field.label} es requerido`,
              });
          } else if (field.type === "time") {
            caseDataSchema[field.name] = z.string().min(1, `${field.label} es requerido`);
          } else {
            caseDataSchema[field.name] = z.string().min(1, `${field.label} es requerido`);
          }
        } else {
          caseDataSchema[field.name] = z.any().optional();
        }
      });

      baseSchema.caseData = z.object(caseDataSchema);
    } else {
      baseSchema.caseData = z.any().optional();
    }
  } else {
    baseSchema.contactType = z.string().optional();
    baseSchema.contactValue = z.string().optional();
    baseSchema.observation = z.string().optional();
    baseSchema.nextManagementDate = z.union([z.string(), z.date()]).optional();
    baseSchema.nextManagementTime = z.string().optional();
    baseSchema.caseData = z.any().optional();
  }

  return z.object(baseSchema);
};

/**
 * Renderiza un campo dinámicamente según su configuración
 */
const DynamicField = ({
  field,
  control,
  dataDebtor,
  selectedInvoices,
}: {
  field: FieldConfig;
  control: any;
  dataDebtor?: any;
  selectedInvoices?: Invoice[];
}) => {
  const fieldName = `caseData.${field.name}` as any;
  const { data: session } = useSession();
  const { profile } = useProfileContext();

  if (field.type === "component" && field.component) {
    const CustomComponent = field.component;
    return (
      <FormField
        control={control}
        name={fieldName}
        render={({ field: formField }) => (
          <FormItem className="col-span-2">
            <CustomComponent
              value={formField.value}
              onChange={formField.onChange}
              selectedInvoices={selectedInvoices}
              {...(field.componentProps || {})}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (field.type === "date") {
    return (
      <FormField
        control={control}
        name={fieldName}
        render={({ field: formField }) => (
          <DatePopover
            field={formField}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
          />
        )}
      />
    );
  }

  if (field.type === "time") {
    return (
      <FormField
        control={control}
        name={fieldName}
        render={({ field: formField }) => (
          <TimePopover
            field={formField}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
          />
        )}
      />
    );
  }

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {field.type === "select" ? (
              <Select
                onValueChange={formField.onChange}
                value={formField.value || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "textarea" ? (
              <Textarea
                placeholder={field.placeholder}
                value={formField.value || ""}
                onChange={formField.onChange}
                className="min-h-[100px] resize-none"
              />
            ) : (
              <Input
                type={field.type}
                placeholder={field.placeholder}
                value={formField.value || ""}
                onChange={formField.onChange}
                className="w-full"
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const StepTwo = ({
  dataDebtor,
  formData,
  onFormChange,
  selectedInvoices = [],
  onValidationChange,
}: StepTwoProps) => {
  // Usar refs para callbacks para evitar re-renders infinitos
  const onValidationChangeRef = useRef(onValidationChange);
  const onFormChangeRef = useRef(onFormChange);
  const previousIsValidRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  useEffect(() => {
    onFormChangeRef.current = onFormChange;
  }, [onFormChange]);

  // Opciones filtradas para cascada
  const executiveCommentOptions = useMemo(
    () => getExecutiveCommentOptions(formData.debtorComment),
    [formData.debtorComment]
  );

  // Obtener combinación completa si las 3 selecciones están hechas
  const selectedCombination = useMemo(() => {
    if (
      formData.managementType &&
      formData.debtorComment &&
      formData.executiveComment
    ) {
      return getManagementCombination(
        formData.managementType,
        formData.debtorComment,
        formData.executiveComment
      );
    }
    return null;
  }, [
    formData.managementType,
    formData.debtorComment,
    formData.executiveComment,
  ]);

  const hasCompleteSelection = !!selectedCombination;

  // Crear esquema dinámico
  const formSchema = useMemo(
    () => createFormSchema(hasCompleteSelection, selectedCombination),
    [hasCompleteSelection, selectedCombination]
  );

  // Obtener contactos del deudor para selector
  const debtorContacts = useMemo<DebtorContact[]>(() => {
    if (!dataDebtor?.contacts) return [];

    console.log("🔍 Raw contacts from dataDebtor:", dataDebtor.contacts);

    const mappedContacts = dataDebtor.contacts.map(
      (contact: any, idx: number): DebtorContact => ({
        id: contact.id || `contact-${idx}`,
        type: contact.channel?.toUpperCase() || "EMAIL",
        value: contact.email || contact.phone || "",
        label: `${contact.name} - ${contact.email || contact.phone}`,
        name: contact.name || "",
      })
    );

    console.log("🔍 Mapped debtorContacts:", mappedContacts);

    return mappedContacts;
  }, [dataDebtor]);

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      managementType: formData.managementType || "CALL_OUT",
      debtorComment: formData.debtorComment || "",
      executiveComment: formData.executiveComment || "",
      contactType: formData.contactType || "",
      contactValue: formData.contactValue || "",
      selectedContact: formData.selectedContact || null,
      observation: formData.observation || "",
      nextManagementDate: formData.nextManagementDate || "",
      nextManagementTime: formData.nextManagementTime || "",
      caseData: formData.caseData || {},
    },
  });

  // Sincronizar valores cuando cambie formData desde el padre
  useEffect(() => {
    const currentValues = form.getValues();
    const hasChanges = JSON.stringify({
      managementType: formData.managementType || "CALL_OUT",
      debtorComment: formData.debtorComment || "",
      executiveComment: formData.executiveComment || "",
      contactType: formData.contactType || "",
      contactValue: formData.contactValue || "",
      observation: formData.observation || "",
      nextManagementDate: formData.nextManagementDate || "",
      nextManagementTime: formData.nextManagementTime || "",
      caseData: formData.caseData || {},
    }) !== JSON.stringify({
      ...currentValues,
      selectedContact: undefined,
    });

    if (hasChanges) {
      form.reset({
        managementType: formData.managementType || "CALL_OUT",
        debtorComment: formData.debtorComment || "",
        executiveComment: formData.executiveComment || "",
        contactType: formData.contactType || "",
        contactValue: formData.contactValue || "",
        selectedContact: formData.selectedContact || null,
        observation: formData.observation || "",
        nextManagementDate: formData.nextManagementDate || "",
        nextManagementTime: formData.nextManagementTime || "",
        caseData: formData.caseData || {},
      }, { keepErrors: true, keepDirty: false, keepTouched: true });
    }
  }, [formData, form]);

  // Revalidar cuando cambie el esquema o la selección
  useEffect(() => {
    if (hasCompleteSelection) {
      const timeoutId = setTimeout(() => {
        form.trigger();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [hasCompleteSelection, form.trigger]);

  // Sincronizar cambios del formulario con el componente padre
  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormChangeRef.current({
        managementType: value.managementType || "CALL_OUT",
        debtorComment: value.debtorComment || "",
        executiveComment: value.executiveComment || "",
        contactType: value.contactType || "",
        contactValue: value.contactValue || "",
        selectedContact: value.selectedContact || null,
        observation: value.observation || "",
        nextManagementDate: value.nextManagementDate || "",
        nextManagementTime: value.nextManagementTime || "",
        caseData: value.caseData || {},
      });
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Notificar estado de validación solo cuando cambie
  useEffect(() => {
    const isValid = form.formState.isValid;

    // Solo notificar si el valor cambió
    if (previousIsValidRef.current !== isValid) {
      previousIsValidRef.current = isValid;
      onValidationChangeRef.current?.(isValid);
    }
  }, [form.formState.isValid]);

  return (
    <div className="space-y-5">
      <Form {...form}>
        <form className="space-y-5">
          <Accordion
            type="multiple"
            defaultValue={["seleccion-gestion", "datos-gestion", "detalles-especificos"]}
            className="w-full space-y-5"
          >
            {/* ISLA 1: Selección de Gestión (3 selectores en cascada) */}
            <AccordionItem
              key="seleccion-gestion"
              value="seleccion-gestion"
              className="border border-gray-200 rounded-md px-4 py-2 mb-5"
            >
              <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                <AccordionTrigger className="flex items-center justify-between h-full">
                  <TitleStep
                    title="Selección de Gestión"
                    icon={<ClipboardList className="w-5 h-5" />}
                  />
                </AccordionTrigger>
              </div>
              <AccordionContent className="grid grid-cols-3 gap-4 text-balance px-1 py-4">
                {/* Nivel 1: Management Type */}
                <FormField
                  control={form.control}
                  name="managementType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipo de gestión <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Limpiar selecciones posteriores
                          form.setValue("debtorComment", "");
                          form.setValue("executiveComment", "");
                          form.setValue("caseData", {});
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un tipo de gestión" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CALL_OUT">
                            Llamada saliente
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nivel 2: Debtor Comment */}

                <FormField
                  control={form.control}
                  name="debtorComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Comentario del deudor{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Limpiar selección posterior
                          form.setValue("executiveComment", "");
                          form.setValue("caseData", {});
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona comentario del deudor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MANAGEMENT_TYPES.map((type) => (
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

                {/* Nivel 3: Executive Comment */}
                <FormField
                  control={form.control}
                  name="executiveComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Comentario del ejecutivo{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!formData.debtorComment}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona comentario del ejecutivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* {debtorCommentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))} */}
                          {executiveCommentOptions.map((option) => (
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

            {/* ISLA 2: Datos de la Gestión (campos comunes a TODOS los casos) */}
            {hasCompleteSelection && (
              <AccordionItem
                key="datos-gestion"
                value="datos-gestion"
                className="border border-gray-200 rounded-md px-4 py-2 mb-5"
              >
                <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                  <AccordionTrigger className="flex items-center justify-between h-full">
                    <TitleStep
                      title="Datos de la gestión"
                      icon={<Phone className="w-5 h-5" />}
                    />
                  </AccordionTrigger>
                </div>
                <AccordionContent className="flex flex-col gap-6 text-balance px-1 py-4">
                  {/* Contacto */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Contacto
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <FormField
                        control={form.control}
                        name="contactType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Tipo de Contacto{" "}
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
                                {CONTACT_TYPE_OPTIONS.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Contacto <span className="text-red-500">*</span>
                            </FormLabel>
                            {debtorContacts.length > 0 ? (
                              <Select
                                onValueChange={(value) => {
                                  if (value === "__manual__") {
                                    field.onChange("");
                                    form.setValue("selectedContact", null);
                                    form.setValue("contactType", "");
                                  } else {
                                    const contact = debtorContacts.find(
                                      (c) => c.id === value
                                    );
                                    if (contact) {
                                      field.onChange(contact.value);
                                      form.setValue("selectedContact", contact);
                                      form.setValue(
                                        "contactType",
                                        contact.type
                                      );
                                    }
                                  }
                                }}
                                value={
                                  formData.selectedContact?.id ||
                                  (field.value ? "__manual__" : "")
                                }
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un contacto" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {debtorContacts.map((contact) => (
                                    <SelectItem
                                      key={contact.id}
                                      value={contact.id}
                                    >
                                      {contact.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <FormControl>
                                <Input
                                  placeholder="+56912345678 o email@example.com"
                                  {...field}
                                  className="w-full"
                                />
                              </FormControl>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Observación */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Observación
                    </h4>
                    <FormField
                      control={form.control}
                      name="observation"
                      disabled
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Descripción de la interacción
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Texto será generado por IA según la interacción"
                              {...field}
                              className="min-h-[120px] resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Próxima Gestión */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <CalendarClock className="w-4 h-4" />
                      Próxima Gestión
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <FormField
                        control={form.control}
                        name="nextManagementDate"
                        render={({ field }) => (
                          <DatePopover field={field} label="Fecha" required />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nextManagementTime"
                        render={({ field }) => (
                          <TimePopover
                            field={field}
                            label="Hora de la gestión"
                            required
                          />
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* ISLA 3: Detalles Específicos (solo si hay campos en case_data) */}
            {hasCompleteSelection && selectedCombination.fields.length > 0 && (
              <AccordionItem
                key="detalles-especificos"
                value="detalles-especificos"
                className="border border-gray-200 rounded-md px-4 py-2 mb-5"
              >
                <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                  <AccordionTrigger className="flex items-center justify-between h-full">
                    <TitleStep
                      title={`${selectedCombination.label}`}
                      icon={<MessageSquare className="w-5 h-5" />}
                    />
                  </AccordionTrigger>
                </div>
                <AccordionContent className="flex flex-col gap-4 text-balance px-1 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {selectedCombination.fields.map((field) => (
                      <DynamicField
                        key={field.name}
                        field={field}
                        control={form.control}
                        dataDebtor={dataDebtor}
                        selectedInvoices={selectedInvoices}
                      />
                    ))}
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
