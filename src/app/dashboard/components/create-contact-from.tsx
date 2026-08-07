import { Mail } from "lucide-react";
import TitleStep from "../settings/components/title-step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
  // Schema para un solo contacto
  const contactFormSchema = z.object({
    name: z.string().min(1, tCommon("validation.required")),
    role: z.string().min(1, tCommon("validation.required")),
    function: z.string().min(1, tCommon("validation.required")),
    email: z.string().email(tCommon("validation.invalidEmail")),
    phone: z
      .string()
      .min(8, tCommon("validation.fieldRequired"))
      .max(15, tCommon("validation.maxLength", { max: "15" }))
      .transform((value) => {
        // Normalizar el número agregando + si no lo tiene
        if (!value) return value;
        return value.startsWith("+") ? value : `+${value}`;
      })
      .refine((value) => /^\+?[1-9]\d{1,14}$/.test(value), {
        message: tCommon("validation.invalidPhone"),
      }),
    channel: z.string().min(1, tCommon("validation.required")),
  });

  type ContactFormValues = z.infer<typeof contactFormSchema>;

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

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "",
      role: "",
      function: "",
      email: "",
      phone: "",
      channel: "",
    },
  });

  const handleSubmit = async (data: ContactFormValues): Promise<void> => {
    if (!dataDebtor?.id || !session?.token || !profile?.client?.id) {
      toast.error(tCommon("toast.error"));
      return;
    }

    setIsSubmitting(true);
    try {
      // Normalizar el teléfono del nuevo contacto
      const newContact = {
        name: data.name,
        role: data.role,
        function: data.function,
        email: data.email,
        phone: normalizePhoneNumber(data.phone),
        channel: data.channel,
      };

      // Agregar el nuevo contacto al array existente de contactos
      const updatedContacts = [...(dataDebtor.contacts || []), newContact];

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
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={tCommon("placeholders.selectChannel")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Teléfono</SelectItem>
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
                      <FormMessage />
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
                      <FormMessage />
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
