import { Mail } from "lucide-react";
import TitleStep from "../settings/components/title-step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TranslatedFormMessage } from "@/components/ui/translated-form-message";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSchema,
  type ContactFormValues,
} from "@/app/dashboard/debtors/schemas/contact.schema";
import { useDebtorsStore } from "../debtors/store";
import { PhoneInput } from "@/components/ui/phone-input";
import type { E164Number } from "libphonenumber-js/core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { functionsContact } from "../data";
import { useProfileContext } from "@/context/ProfileContext";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useState } from "react";

interface CreateContactFormProps {
  onSuccess?: () => void;
}

const CreateContactForm = ({ onSuccess }: CreateContactFormProps) => {
  const { session, profile } = useProfileContext();
  const { dataDebtor, updateDebtor, setDataDebtor } = useDebtorsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tCommon = useTranslations("common");

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema) as any,
    mode: "onBlur",
    defaultValues: {
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
    },
  });

  const handleSubmit = async (data: ContactFormValues): Promise<void> => {
    if (!dataDebtor?.id || !session?.token || !profile?.client?.id) {
      toast.error(tCommon("toast.error"));
      return;
    }

    setIsSubmitting(true);
    try {
      const newContact = {
        name: data.name,
        role: data.role,
        function: data.function,
        email: data.email,
        phone: data.phone,
        channel: data.channel,
        default: data.default ?? false,
        enabled: data.enabled ?? true,
        send_pdf: data.send_pdf ?? false,
        overdue_invoices: data.overdue_invoices ?? false,
      };

      // Si el nuevo contacto queda marcado como preferente, desmarcar los demás
      // (solo puede existir un contacto preferente por deudor a la vez)
      const existingContacts = newContact.default
        ? (dataDebtor.contacts || []).map((c: any) => ({
            ...c,
            default: false,
          }))
        : dataDebtor.contacts || [];

      // Agregar el nuevo contacto al array existente de contactos
      const updatedContacts = [...existingContacts, newContact];

      // Actualizar el deudor con los contactos actualizados
      const updatedDebtor = {
        ...dataDebtor,
        contacts: updatedContacts,
      };

      // Actualizar el store localmente primero (optimistic update)
      setDataDebtor(updatedDebtor);

      // Luego hacer el update en el backend
      await updateDebtor(session.token, profile.client.id, updatedDebtor);

      toast.success(tCommon("toast.success"));
      form.reset();

      // Llamar al callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error al agregar contacto:", error);
      toast.error(tCommon("toast.error"));

      // Revertir el cambio optimista en caso de error
      // Recargar el deudor original
      setDataDebtor(dataDebtor);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-md p-5 space-y-3 w-full">
      <div className="flex flex-col items-start gap-5">
        <TitleStep
          title={tCommon("labels.contactInfo")}
          icon={<Mail className="w-5 h-5" />}
        />
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full space-y-6"
            autoComplete="off"
          >
            <div className="grid gap-6 w-full">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tCommon("labels.name")} </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tCommon("labels.role")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="function"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tCommon("labels.function")}</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={tCommon("placeholders.selectFunction")} />
                          </SelectTrigger>
                          <SelectContent>
                            {functionsContact.map((func) => (
                              <SelectItem key={func.value} value={func.value}>
                                {func.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tCommon("labels.channelPreferred")}</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.trigger(["email", "phone"]);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={tCommon("placeholders.selectChannel")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">{tCommon("labels.phone")}</SelectItem>
                            <SelectItem value="whatsapp">Whatsapp</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <TranslatedFormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tCommon("labels.phone")}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          placeholder="Ej: +56 9 9891 8080"
                          defaultCountry="CL"
                          value={field.value as E164Number}
                          onChange={(value: E164Number | undefined) =>
                            field.onChange(value || "")
                          }
                          error={!!form.formState.errors.phone}
                        />
                      </FormControl>
                      <TranslatedFormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="default"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 w-fit">
                        <FormLabel className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Preferente
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
                  name="enabled"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 w-fit">
                        <FormLabel className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Habilitado
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value ?? true}
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
                  name="send_pdf"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 w-fit">
                        <FormLabel className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Envía PDF de facturas
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
                  name="overdue_invoices"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 w-fit">
                        <FormLabel className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Facturas vencidas
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
              </div>
            </div>
            <div className="flex justify-end w-full">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? tCommon("loading.saving") : tCommon("saveContact")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default CreateContactForm;
