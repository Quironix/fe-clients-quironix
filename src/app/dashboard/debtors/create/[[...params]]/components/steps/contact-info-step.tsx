"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TranslatedFormMessage } from "@/components/ui/translated-form-message";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import TitleStep from "@/app/dashboard/settings/components/title-step";
import { StepProps } from "@/app/dashboard/settings/types";
import { getCountries } from "@/app/services";
import Stepper from "@/components/Stepper";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileContext } from "@/context/ProfileContext";
import type { E164Number } from "libphonenumber-js/core";
import { Mail, Plus, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebtorsStore } from "../../../../store";
import { ContactsSummary } from "@/app/dashboard/debtors/components/technical-file/contacts-summary";
import { CollectorCoverageAlert } from "@/app/dashboard/debtors/components/technical-file/collector-coverage-alert";
import { ContactFunctionField } from "@/app/dashboard/debtors/components/technical-file/contact-function-field";
import { ContactRoleField } from "@/app/dashboard/debtors/components/technical-file/contact-role-field";
import { SharedContactActions } from "@/app/dashboard/debtors/components/technical-file/shared-contact-actions";
import { getSharedContactImpact } from "@/app/dashboard/debtors/services/technical-file";
import { isSavedContact } from "@/app/dashboard/debtors/utils/technical-file";

import { NextBackButtons } from "@/app/dashboard/debtors/components/next-back-buttons";
import { contactSchema } from "@/app/dashboard/debtors/schemas/contact.schema";
import ContactCollectorSubscriptions from "@/app/dashboard/components/contact-collector-subscriptions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const debtorFormSchema = z.object({
  contact_info: z.array(contactSchema),
});

type DebtorFormValues = z.infer<typeof debtorFormSchema>;

const ContactHeader = ({
  index,
  contact,
}: {
  index: number;
  contact: {
    name?: string;
    role?: string;
    default?: boolean;
    enabled?: boolean;
    contact_group_id?: string | null;
  };
}) => {
  const t = useTranslations("debtors.technicalFile");
  return (
    <span className="flex flex-wrap items-center gap-2 text-left">
      <span className="font-medium">
        {contact?.name || t("contactFallbackName", { number: index + 1 })}
      </span>
      {contact?.role && (
        <span className="text-sm font-normal text-muted-foreground">
          {contact.role}
        </span>
      )}
      {contact?.default && (
        <Badge variant="secondary">{t("badgeDefault")}</Badge>
      )}
      {contact?.enabled === false && (
        <Badge variant="outline">{t("badgeInactive")}</Badge>
      )}
      {contact?.contact_group_id && (
        <Badge variant="outline">{t("badgeShared")}</Badge>
      )}
    </span>
  );
};

const ContactInfoStep: React.FC<StepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  const t = useTranslations("debtors.contactStep");
  const tTechnicalFile = useTranslations("debtors.technicalFile");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState("item-0");
  const [countries, setCountries] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const { session } = useProfileContext();
  const { dataDebtor, updateDebtor, setDataDebtor } = useDebtorsStore();
  const router = useRouter();

  // Función para normalizar el número de teléfono
  const normalizePhoneNumber = (phone: string): string => {
    if (!phone) return "";

    // Si el teléfono ya tiene el símbolo +, lo dejamos tal como está
    if (phone.startsWith("+")) {
      return phone;
    }

    // Si no tiene el símbolo +, se lo agregamos
    return `+${phone}`;
  };

  // Función para procesar los contactos y normalizar los teléfonos
  const processContacts = (contacts: any[]) => {
    return contacts.map((contact) => ({
      id: contact?.id,
      contact_group_id: contact?.contact_group_id ?? null,
      name: contact?.name || "",
      role: contact?.role || "",
      function: contact?.function || "",
      email: contact?.email || "",
      phone: normalizePhoneNumber(contact?.phone || ""),
      channel: contact?.channel || "",
      default: contact?.default ?? false,
      enabled: contact?.enabled ?? true,
      send_pdf: contact?.send_pdf ?? false,
      overdue_invoices: contact?.overdue_invoices ?? false,
      collector_ids: contact?.collector_ids ?? [],
    }));
  };

  const form = useForm<DebtorFormValues>({
    resolver: zodResolver(debtorFormSchema) as any,
    mode: "onBlur",
    defaultValues: {
      contact_info:
        dataDebtor?.contacts && dataDebtor.contacts.length > 0
          ? processContacts(dataDebtor.contacts)
          : [
              {
                name: "",
                role: "",
                function: "",
                email: "",
                phone: "",
                channel: "",
                default: false,
                enabled: true,
                send_pdf: false,
                overdue_invoices: false,
                collector_ids: [],
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contact_info",
  });

  const addContact = () => {
    const newIndex = fields.length;
    append({
      name: "",
      role: "",
      function: "",
      email: "",
      phone: "",
      channel: "",
      default: false,
      enabled: true,
      send_pdf: false,
      overdue_invoices: false,
      collector_ids: [],
    });
    // Abrir automáticamente el accordion del nuevo contacto
    setActiveAccordion(`item-${newIndex}`);
  };
  const warnSharedImpact = async (index: number, enabled: boolean) => {
    const contact = form.getValues(`contact_info.${index}`);
    if (enabled || !contact.contact_group_id || !contact.id) return;
    try {
      const impact = await getSharedContactImpact(
        session?.token,
        profile?.client?.id,
        dataDebtor.id,
        contact.id,
      );
      toast.warning(
        tTechnicalFile("impactOnDisable", { count: impact.affected_debtors }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const removeContact = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error(t("minOneContact"));
    }
  };
  // Cargar países cuando el componente se monta
  useEffect(() => {
    const fetchCountries = async () => {
      if (!session?.token) return;

      try {
        const countriesData = await getCountries(session.token);
        setCountries(countriesData || []);
      } catch (error) {
        console.error("Error al cargar países:", error);
      }
    };

    fetchCountries();
  }, [session?.token]);

  const handleSubmit = async (data: DebtorFormValues): Promise<void> => {
    setSubmitAttempted(true);
    try {
      if (data.contact_info.length > 0 && dataDebtor?.id) {
        // Normalizar los números de teléfono antes de guardar
        const normalizedContacts = data.contact_info.map((contact) => ({
          id: contact.id,
          contact_group_id: contact.contact_group_id ?? null,
          name: contact.name || "",
          role: contact.role || "",
          email: contact.email || "",
          phone: normalizePhoneNumber(contact.phone),
          channel: contact.channel,
          function: contact.function,
          default: contact.default ?? false,
          enabled: contact.enabled ?? true,
          send_pdf: contact.send_pdf ?? false,
          overdue_invoices: contact.overdue_invoices ?? false,
          collector_ids: contact.collector_ids ?? [],
        }));

        dataDebtor.contacts = normalizedContacts;
        await updateDebtor(session?.token, profile?.client?.id, dataDebtor);
      }
      toast.success(t("saveSuccess"));
      router.push("/dashboard/debtors");
      router.refresh();
    } catch (error) {
      toast.error(t("saveError"));
    }
  };

  return (
    <section className="space-y-6">
      <div className="mb-6">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={onStepChange}
        />
      </div>
      <div className="space-y-4 border border-gray-200 rounded-md p-5">
        <div className="flex justify-between items-center">
          <TitleStep title={t("title")} icon={<Mail size={16} />} />
          <Button
            type="button"
            onClick={addContact}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-2 text-sm border-orange-500 hover:bg-orange-100 bg-white"
          >
            <Plus className="w-4 h-4 text-orange-500" />
            {t("addContact")}
          </Button>
        </div>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full space-y-6"
            autoComplete="off"
          >
            <ContactsSummary contacts={form.watch("contact_info") as any} />
            <CollectorCoverageAlert
              contacts={form.watch("contact_info") as any}
            />
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-3"
              value={activeAccordion}
              onValueChange={setActiveAccordion}
            >
              {fields.map((field, index) => (
                <AccordionItem
                  key={field.id}
                  value={`item-${index}`}
                  className="border border-gray-200 rounded-md px-3 py-1 mb-1"
                >
                  <div className="flex items-center gap-2 min-h-[48px]">
                    <AccordionTrigger className="flex-1 py-2 hover:no-underline">
                      <ContactHeader
                        index={index}
                        contact={form.watch(`contact_info.${index}`)}
                      />
                    </AccordionTrigger>
                    {!isSavedContact(form.getValues(`contact_info.${index}`)) &&
                      fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeContact(index)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                  </div>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <div className="grid gap-6">
                      <div className="grid grid-cols-3 items-start gap-x-6 gap-y-5">
                        <FormField
                          control={form.control}
                          name={`contact_info.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("name")} </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`contact_info.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("role")}</FormLabel>
                              <FormControl>
                                <ContactRoleField
                                  value={field.value}
                                  onChange={(role, derivedFunction) => {
                                    field.onChange(role);
                                    form.setValue(
                                      `contact_info.${index}.function`,
                                      derivedFunction,
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormItem>
                          <FormLabel>{t("function")}</FormLabel>
                          <ContactFunctionField
                            role={form.watch(`contact_info.${index}.role`)}
                          />
                        </FormItem>
                        <FormField
                          control={form.control}
                          name={`contact_info.${index}.channel`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("channel")}</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    form.trigger([
                                      `contact_info.${index}.email`,
                                      `contact_info.${index}.phone`,
                                    ] as const);
                                  }}
                                  value={field.value}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue
                                      placeholder={t("selectChannel")}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="email">
                                      {t("channelEmail")}
                                    </SelectItem>
                                    <SelectItem value="phone">
                                      {t("channelPhone")}
                                    </SelectItem>
                                    <SelectItem value="whatsapp">
                                      {t("channelWhatsapp")}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`contact_info.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("email")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <TranslatedFormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`contact_info.${index}.phone`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("phone")}</FormLabel>
                              <FormControl>
                                <PhoneInput
                                  placeholder={t("phonePlaceholder")}
                                  defaultCountry="CL"
                                  value={field.value as E164Number}
                                  onChange={(value: E164Number | undefined) =>
                                    field.onChange(value || "")
                                  }
                                  error={
                                    !!form.formState.errors.contact_info?.[0]
                                      ?.phone
                                  }
                                />
                              </FormControl>
                              <TranslatedFormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="col-span-3 flex flex-wrap gap-4">
                          <FormField
                            control={form.control}
                            name={`contact_info.${index}.default`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 w-fit">
                                  <FormLabel className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    {t("defaultContact")}
                                  </FormLabel>
                                  <FormControl>
                                    <Switch
                                      checked={field.value ?? false}
                                      onCheckedChange={field.onChange}
                                      className="data-[state=checked]:bg-orange-500"
                                    />
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`contact_info.${index}.enabled`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 w-fit">
                                  <FormLabel className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    {t("enabledContact")}
                                  </FormLabel>
                                  <FormControl>
                                    <Switch
                                      checked={field.value ?? true}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        warnSharedImpact(index, checked);
                                      }}
                                      className="data-[state=checked]:bg-orange-500"
                                    />
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      {dataDebtor?.id &&
                        form.getValues(`contact_info.${index}.id`) && (
                          <SharedContactActions
                            debtorId={dataDebtor.id}
                            contactId={
                              form.getValues(
                                `contact_info.${index}.id`,
                              ) as string
                            }
                          />
                        )}
                      <FormField
                        control={form.control}
                        name={`contact_info.${index}.collector_ids`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ContactCollectorSubscriptions
                                value={field.value ?? []}
                                onChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="flex justify-end gap-2">
              {submitAttempted &&
                Object.keys(form.formState.errors).length > 0 && (
                  <div className="text-red-500 text-xs self-center mr-2">
                    {t("requiredFields")}
                  </div>
                )}
              <NextBackButtons
                loading={form.formState.isSubmitting}
                currentStep={currentStep}
                onBack={onBack}
                onNext={() => {
                  if (Object.keys(form.formState.errors).length > 0) {
                    setSubmitAttempted(true);
                  }
                }}
                steps={steps}
              />
            </div>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export default ContactInfoStep;
