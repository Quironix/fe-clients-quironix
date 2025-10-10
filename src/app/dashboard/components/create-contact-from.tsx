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

const CreateContactForm = () => {
  const { dataDebtor, updateDebtor, setDataDebtor } = useDebtorsStore();
  const debtorFormSchema = z.object({
    contact_info: z.array(
      z.object({
        name: z.string().min(1, "Nombre es requerido"),
        role: z.string().min(1, "Rol es requerido"),
        function: z.string().min(1, "Función es requerida"),
        email: z.string().email("Email inválido"),
        phone: z
          .string()
          .min(8, "Campo requerido")
          .max(15, "Máximo 15 caracteres")
          .transform((value) => {
            // Normalizar el número agregando + si no lo tiene
            if (!value) return value;
            return value.startsWith("+") ? value : `+${value}`;
          })
          .refine((value) => /^\+?[1-9]\d{1,14}$/.test(value), {
            message: "Número de teléfono inválido",
          }),
        channel: z.string(),
      }),
    ),
  });
  type DebtorFormValues = z.infer<typeof debtorFormSchema>;

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
      name: contact?.name || "",
      role: contact?.role || "",
      function: contact?.function || "",
      email: contact?.email || "",
      phone: normalizePhoneNumber(contact?.phone || ""),
      channel: contact?.channel || "",
    }));
  };

  const form = useForm<DebtorFormValues>({
    resolver: zodResolver(debtorFormSchema),
    mode: "onChange",
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
              },
            ],
    },
  });
  const index = 0;

  const handleSubmit = async (data: DebtorFormValues): Promise<void> => {
    console.log(data);
  };

  return (
    <div className="border border-gray-200 rounded-md p-5 space-y-3 w-full">
      <div className="flex flex-col items-start gap-5">
        <TitleStep
          title="Información de contacto"
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
                  name={`contact_info.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre </FormLabel>
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
                      <FormLabel>Rol</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`contact_info.${index}.function`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Función</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona una función" />
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
                  name={`contact_info.${index}.channel`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canal preferente de comunicación</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un canal" />
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
                  name={`contact_info.${index}.email`}
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
                  name={`contact_info.${index}.phone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <PhoneInput
                          placeholder="Ej: +56 9 9891 8080"
                          defaultCountry="CL"
                          value={field.value as E164Number}
                          onChange={(value: E164Number | undefined) =>
                            field.onChange(value || "")
                          }
                          error={
                            !!form.formState.errors.contact_info?.[0]?.phone
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end w-full">
              <Button type="submit">Guardar contacto</Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default CreateContactForm;
