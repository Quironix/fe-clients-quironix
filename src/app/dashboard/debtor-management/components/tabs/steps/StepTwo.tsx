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
import { getLitigationsByDebtor } from "@/app/dashboard/litigation/services";
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
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
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

const createFormSchema = (
  hasCompleteSelection: boolean,
  selectedCombination: any,
  t: (key: string, values?: Record<string, string>) => string
) => {
  const baseSchema: any = {
    managementType: z.string().min(1, t("validationManagementType")),
    debtorComment: z
      .string()
      .min(1, t("validationDebtorComment")),
    executiveComment: z
      .string()
      .min(1, t("validationExecutiveComment")),
  };

  if (hasCompleteSelection) {
    baseSchema.contactType = z
      .string()
      .min(1, t("validationContactType"));
    baseSchema.contactValue = z
      .string()
      .min(1, t("validationContactValue"));
    baseSchema.observation = z.string().optional();
    baseSchema.nextManagementDate = z
      .union([z.string(), z.date()])
      .refine((val) => val !== "" && val !== null, {
        message: t("validationDate"),
      });
    baseSchema.nextManagementTime = z
      .string()
      .min(1, t("validationTime"));

    if (selectedCombination?.executive_comment === "DOCUMENT_IN_LITIGATION") {
      baseSchema.caseData = z.object({
        litigationData: z
          .object({
            litigations: z
              .array(
                z.object({
                  selectedInvoiceIds: z
                    .array(z.string())
                    .min(1, t("validationInvoice")),
                  litigationAmount: z.string().optional(),
                  reason: z.string().min(1, t("validationReason")),
                  subreason: z.string().min(1, t("validationSubreason")),
                })
              )
              .min(1, t("validationLitigation")),
            _isValid: z.boolean().optional(),
          })
          .refine((data) => data._isValid !== false, {
            message: t("validationLitigationFields"),
          }),
      });
    } else if (
      selectedCombination?.executive_comment === "LITIGATION_NORMALIZATION"
    ) {
      baseSchema.caseData = z.object({
        litigationData: z
          .object({
            selectedInvoiceIds: z
              .array(z.string())
              .min(1, t("validationInvoice")),
            litigationIds: z.array(z.string()).optional(),
            reason: z.string().min(1, t("validationNormalizationReason")),
            comment: z.string().min(1, t("validationNormalizationComment")),
            totalAmount: z.number().optional(),
            _isValid: z.boolean().optional(),
          })
          .refine((data) => data._isValid !== false, {
            message: t("validationNormalizationFields"),
          }),
      });
    } else if (
      selectedCombination?.executive_comment === "PAYMENT_PLAN_APPROVAL_REQUEST"
    ) {
      baseSchema.caseData = z.object({
        paymentPlanData: z
          .object({
            downPayment: z.number().min(0, t("validationDownPayment")),
            numberOfInstallments: z.number().min(1, t("validationInstallments")),
            annualInterestRate: z.number().min(0, t("validationDownPayment")),
            paymentMethod: z.string().min(1, t("validationPaymentMethod")),
            paymentFrequency: z.string().min(1, t("validationPaymentFrequency")),
            startDate: z.date({ message: t("validationPaymentDate") }),
            comments: z.string().optional(),
            _isValid: z.boolean().optional(),
          })
          .refine((data) => data._isValid !== false, {
            message: t("validationPaymentPlanFields"),
          }),
      });
    } else if (
      selectedCombination?.fields &&
      selectedCombination.fields.length > 0
    ) {
      const caseDataSchema: any = {};

      selectedCombination.fields.forEach((field: FieldConfig) => {
        if (field.required) {
          if (field.type === "number") {
            caseDataSchema[field.name] = z.coerce
              .number()
              .min(1, t("validationRequired", { field: field.label }));
          } else if (field.type === "date") {
            caseDataSchema[field.name] = z
              .union([z.string(), z.date()])
              .refine((val) => val !== "" && val !== null, {
                message: t("validationRequired", { field: field.label }),
              });
          } else if (field.type === "time") {
            caseDataSchema[field.name] = z
              .string()
              .min(1, t("validationRequired", { field: field.label }));
          } else {
            caseDataSchema[field.name] = z
              .string()
              .min(1, t("validationRequired", { field: field.label }));
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

const DynamicField = ({
  field,
  control,
  dataDebtor,
  selectedInvoices,
  litigations,
  totalizeSelectedInvoices,
  t,
}: {
  field: FieldConfig;
  control: any;
  dataDebtor?: any;
  selectedInvoices?: Invoice[];
  litigations?: any[];
  totalizeSelectedInvoices?: number;
  t: (key: string) => string;
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
              litigations={litigations}
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
      render={({ field: formField }) => {
        const isAutoFillField = field.name === "amount" || field.name === "paymentAmount";
        const fieldValue =
          isAutoFillField && totalizeSelectedInvoices
            ? totalizeSelectedInvoices.toString()
            : formField.value || "";

        return (
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
                    <SelectValue placeholder={t("selectOptionPlaceholder")} />
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
                  value={fieldValue}
                  onChange={formField.onChange}
                  className="min-h-25 resize-none"
                />
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={fieldValue}
                  onChange={formField.onChange}
                  className="w-full"
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
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
  const t = useTranslations("debtorManagement.stepTwo");

  const managementTypeLabels: Record<string, string> = {
    CALL_OUT: t("callOut"),
    CALL_IN: t("callIn"),
    MAIL_OUT: t("mailOut"),
    MAIL_IN: t("mailIn"),
    SUPPLIER_PORTAL: t("supplierPortal"),
    WHATSAPP: t("whatsapp"),
  };

  const totalizeSelectedInvoices = useMemo(() => {
    const invoices = selectedInvoices || [];
    return invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  }, [selectedInvoices]);

  const { data: session } = useSession();
  const { profile } = useProfileContext();

  const [debtorLitigations, setDebtorLitigations] = useState<any[]>([]);
  const [loadingLitigations, setLoadingLitigations] = useState(false);

  const onValidationChangeRef = useRef(onValidationChange);
  const onFormChangeRef = useRef(onFormChange);
  const previousIsValidRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  useEffect(() => {
    onFormChangeRef.current = onFormChange;
  }, [onFormChange]);

  const executiveCommentOptions = useMemo(
    () => getExecutiveCommentOptions(formData.debtorComment),
    [formData.debtorComment]
  );

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

  useEffect(() => {
    const fetchLitigations = async () => {
      if (
        selectedCombination?.executive_comment === "LITIGATION_NORMALIZATION" &&
        dataDebtor?.id &&
        session?.token &&
        profile?.client_id
      ) {
        setLoadingLitigations(true);
        try {
          const response = await getLitigationsByDebtor(
            session.token,
            profile.client_id,
            dataDebtor.id
          );
          if (response.success) {
            setDebtorLitigations(response.data || []);
          } else {
            setDebtorLitigations([]);
            console.error("Error fetching litigations:", response.message);
          }
        } catch (error) {
          console.error("Error fetching litigations:", error);
          setDebtorLitigations([]);
        } finally {
          setLoadingLitigations(false);
        }
      } else {
        setDebtorLitigations([]);
      }
    };

    fetchLitigations();
  }, [
    selectedCombination?.executive_comment,
    dataDebtor?.id,
    session?.token,
    profile?.client_id,
  ]);

  const formSchema = useMemo(
    () => createFormSchema(hasCompleteSelection, selectedCombination, t),
    [hasCompleteSelection, selectedCombination, t]
  );

  const debtorContacts = useMemo<DebtorContact[]>(() => {
    if (!dataDebtor?.contacts) return [];

    console.log("Raw contacts from dataDebtor:", dataDebtor.contacts);

    const mappedContacts = dataDebtor.contacts
      .filter((contact: any) => contact.email)
      .map(
        (contact: any, idx: number): DebtorContact => ({
          id: contact.id || `contact-${idx}`,
          type: contact.channel?.toUpperCase() || "EMAIL",
          value: contact.email,
          label: `${contact.name} - ${contact.email}`,
          name: contact.name || "",
        })
      );

    console.log("Mapped debtorContacts (only with email):", mappedContacts);

    return mappedContacts;
  }, [dataDebtor]);

  const form = useForm<any>({
    resolver: zodResolver(formSchema) as any,
    mode: "onSubmit",
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

  useEffect(() => {
    const currentValues = form.getValues();
    const hasChanges =
      JSON.stringify({
        managementType: formData.managementType || "CALL_OUT",
        debtorComment: formData.debtorComment || "",
        executiveComment: formData.executiveComment || "",
        contactType: formData.contactType || "",
        contactValue: formData.contactValue || "",
        observation: formData.observation || "",
        nextManagementDate: formData.nextManagementDate || "",
        nextManagementTime: formData.nextManagementTime || "",
        caseData: formData.caseData || {},
      }) !==
      JSON.stringify({
        ...currentValues,
        selectedContact: undefined,
      });

    if (hasChanges) {
      form.reset(
        {
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
        { keepErrors: false, keepDirty: false, keepTouched: false }
      );
    }
  }, [formData, form]);

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

  useEffect(() => {
    if (
      hasCompleteSelection &&
      selectedCombination?.fields &&
      totalizeSelectedInvoices > 0
    ) {
      const autoFillFields = ["amount", "paymentAmount"];

      autoFillFields.forEach((fieldName) => {
        const field = selectedCombination.fields.find(
          (f) => f.name === fieldName
        );
        if (field) {
          const currentValue = form.getValues(`caseData.${fieldName}`);
          const newValue =
            field.type === "number"
              ? totalizeSelectedInvoices
              : totalizeSelectedInvoices.toString();

          if (currentValue !== newValue) {
            form.setValue(`caseData.${fieldName}`, newValue, {
              shouldValidate: false,
              shouldDirty: false,
            });
          }
        }
      });
    }
  }, [
    hasCompleteSelection,
    selectedCombination?.fields,
    totalizeSelectedInvoices,
    form,
  ]);

  useEffect(() => {
    const isValid = form.formState.isValid;

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
            defaultValue={[
              "seleccion-gestion",
              "datos-gestion",
              "detalles-especificos",
            ]}
            className="w-full space-y-5"
          >
            <AccordionItem
              key="seleccion-gestion"
              value="seleccion-gestion"
              className="border border-gray-200 rounded-md px-4 py-2 mb-5"
            >
              <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                <AccordionTrigger className="flex items-center justify-between h-full">
                  <TitleStep
                    title={t("managementSelection")}
                    icon={<ClipboardList className="w-5 h-5" />}
                  />
                </AccordionTrigger>
              </div>
              <AccordionContent className="grid grid-cols-3 gap-4 text-balance px-1 py-4">
                <FormField
                  control={form.control}
                  name="managementType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("managementType")} <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("debtorComment", "");
                          form.setValue("executiveComment", "");
                          form.setValue("caseData", {});
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("selectManagementType")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(managementTypeLabels).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="debtorComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("debtorComment")}{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("executiveComment", "");
                          form.setValue("caseData", {});
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("selectDebtorComment")} />
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

                <FormField
                  control={form.control}
                  name="executiveComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("executiveComment")}{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!formData.debtorComment}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("selectExecutiveComment")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

            {hasCompleteSelection && (
              <AccordionItem
                key="datos-gestion"
                value="datos-gestion"
                className="border border-gray-200 rounded-md px-4 py-2 mb-5"
              >
                <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                  <AccordionTrigger className="flex items-center justify-between h-full">
                    <TitleStep
                      title={t("managementData")}
                      icon={<Phone className="w-5 h-5" />}
                    />
                  </AccordionTrigger>
                </div>
                <AccordionContent className="flex flex-col gap-6 text-balance px-1 py-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">
                      {t("contact")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
                      <FormField
                        control={form.control}
                        name="contactType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("contactType")}{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={t("selectOption")} />
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
                              {t("contactLabel")} <span className="text-red-500">*</span>
                            </FormLabel>
                            {debtorContacts.length > 0 ? (
                              <Select
                                onValueChange={(value) => {
                                  if (value === "__manual__") {
                                    field.onChange("");
                                    form.setValue("selectedContact", null);
                                  } else {
                                    const contact = debtorContacts.find(
                                      (c) => c.id === value
                                    );
                                    if (contact) {
                                      field.onChange(contact.value);
                                      form.setValue("selectedContact", contact);
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
                                    <SelectValue placeholder={t("selectContact")} />
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
                                  placeholder={t("contactPlaceholder")}
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

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">
                      {t("observation")}
                    </h4>
                    <FormField
                      control={form.control}
                      name="observation"
                      disabled
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("interactionDescription")}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("aiGeneratedText")}
                              {...field}
                              className="min-h-[120px] resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <CalendarClock className="w-4 h-4" />
                      {t("nextManagement")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
                      <FormField
                        control={form.control}
                        name="nextManagementDate"
                        render={({ field }) => (
                          <DatePopover field={field} label={t("dateLabel")} required />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nextManagementTime"
                        render={({ field }) => (
                          <TimePopover
                            field={field}
                            label={t("managementTime")}
                            required
                          />
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

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
                <AccordionContent className="flex flex-col gap-4 text-balance px-1 py-4 items-start">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
                    {selectedCombination.fields.map((field) => (
                      <DynamicField
                        key={field.name}
                        field={field}
                        control={form.control}
                        dataDebtor={dataDebtor}
                        selectedInvoices={selectedInvoices}
                        litigations={debtorLitigations}
                        totalizeSelectedInvoices={totalizeSelectedInvoices}
                        t={t}
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
