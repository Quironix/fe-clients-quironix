"use client";
import Stepper from "@/components/Stepper";
import { StepProps } from "../../types";
import StepLayout from "../StepLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader,
  Mail,
  Phone,
  Trash,
  Plus,
  Banknote,
  ChartLine,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TitleStep from "../title-step";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateDataClient } from "../../services";
import { useProfileContext } from "@/context/ProfileContext";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";
import type { E164Number } from "libphonenumber-js/core";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import InputNumberCart from "@/components/ui/input-number-cart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAll as getUsersService } from "../../../users/services";
import { User } from "../../../users/services/types";

const StepContacts: React.FC<StepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState("item-0");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { session, refreshProfile } = useProfileContext();

  // Cargar usuarios cuando el componente se monta
  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.token || !profile?.client?.id) return;

      setLoadingUsers(true);
      try {
        const usersData = await getUsersService(
          session.token,
          profile.client.id
        );
        setUsers(usersData || []);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        toast.error("Error al cargar usuarios");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [session?.token, profile?.client?.id]);

  const items = [
    {
      id: "1",
      label: "Comunicación uno",
    },
    {
      id: "2",
      label: "Comunicación dos",
    },
    {
      id: "3",
      label: "Comunicación tres",
    },
    {
      id: "4",
      label: "Comunicación cuatro",
    },
    {
      id: "5",
      label: "Comunicación cinco",
    },
    {
      id: "6",
      label: "Comunicación seis",
    },
  ] as const;

  // Esquema de validación para contactos
  const contactsSchema = z.object({
    contacts: z
      .array(
        z.object({
          first_name: z.string().min(1, "Campo requerido"),
          last_name: z.string().min(1, "Campo requerido"),
          email: z.string().email("Email inválido"),
          position: z.string().optional(),
          phone: z
            .string()
            .min(8, "Campo requerido")
            .max(15, "Máximo 15 caracteres")
            .refine((value) => /^\+?[1-9]\d{1,14}$/.test(value), {
              message: "Número de teléfono inválido",
            }),
          type_contact: z.array(z.string()).optional(),
          is_default: z.boolean().optional(),
        })
      )
      .min(1, "Debe haber al menos un contacto"),
    operational: z.object({
      extension_request_period: z.number().min(0, "Campo requerido"),
      annual_extensions_per_debtor: z.number().min(0, "Campo requerido"),
      maximum_extension_period: z.number().min(0, "Campo requerido"),
      approving_users: z
        .array(z.string())
        .min(1, "Debe seleccionar al menos un aprobador"),
      country_id: z.string().optional(),
      currency: z.string().optional(),
      tax_id: z.string().optional(),
    }),
  });

  type ContactsFormType = z.infer<typeof contactsSchema>;

  const form = useForm<ContactsFormType>({
    resolver: zodResolver(contactsSchema),
    defaultValues: {
      contacts: profile?.client?.contacts?.length
        ? profile.client.contacts
        : [
            {
              first_name: "",
              last_name: "",
              email: "",
              phone: "",
              position: "",
              type_contact: [],
              is_default: false,
            },
          ],
      operational: {
        extension_request_period: 0,
        annual_extensions_per_debtor: 0,
        maximum_extension_period: 0,
        approving_users:
          (profile?.client?.operational as any)?.approving_users || [],
      },
    },
    mode: "onChange",
  });

  // useFieldArray para manejar contactos dinámicamente
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  // Actualizar valores cuando el perfil cambie
  useEffect(() => {
    if (profile?.client?.contacts?.length) {
      form.reset({
        contacts: profile.client.contacts,
      });
    }
  }, [profile, form]);

  // Debug del estado del formulario
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Estado del formulario:", {
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
        hasChanges: hasFormChanges(),
        values: value,
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Función para añadir un nuevo contacto
  const addContact = () => {
    const newIndex = fields.length;
    append({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      position: "",
      type_contact: [],
      is_default: false,
    });
    // Abrir automáticamente el accordion del nuevo contacto
    setActiveAccordion(`item-${newIndex}`);
  };

  // Función para eliminar un contacto
  const removeContact = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("Debe mantener al menos un contacto");
    }
  };

  // Verificar si hay cambios en el formulario
  const hasFormChanges = () => {
    const currentValues = form.getValues();
    const initialValues = {
      contacts: profile?.client?.contacts || [],
    };
    return JSON.stringify(currentValues) !== JSON.stringify(initialValues);
  };

  // Manejar envío del formulario
  const handleSubmit = async (data: ContactsFormType) => {
    setLoading(true);
    try {
      if (!session?.token || !profile?.client?.id) {
        toast.error("Error de sesión");
        return;
      }
      delete data.operational.country_id;
      delete data.operational.currency;
      delete data.operational.tax_id;

      const updateData = {
        contacts: data.contacts,
        operational: {
          ...data.operational,
          approving_users: data.operational.approving_users,
        },
      };

      await updateDataClient(updateData, profile.client.id, session?.token);
      await refreshProfile();
      toast.success("Información de contacto actualizada correctamente");
      onNext();
    } catch (error) {
      console.error("Error al actualizar contactos:", error);
      toast.error("Error al actualizar la información de contacto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <StepLayout>
          <section className="min-h-screen">
            <div className="mb-6">
              <Stepper
                steps={steps}
                currentStep={currentStep}
                onStepChange={onStepChange}
              />
            </div>
            <div className="space-y-4">
              <div className="w-full space-y-6">
                <div className="border border-gray-200 rounded-md p-5 space-y-3 w-full">
                  <div className="flex justify-between items-center">
                    <TitleStep
                      title="Contactos cliente"
                      icon={<Mail className="w-5 h-5" />}
                    />
                    <Button
                      type="button"
                      onClick={addContact}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-2 text-sm border-orange-500 hover:bg-orange-100 bg-white"
                    >
                      <Plus className="w-4 h-4 text-orange-500" />
                      Agregar contacto
                    </Button>
                  </div>
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
                        <div className="grid grid-cols-[96%_4%] items-center gap-2 min-h-[48px]">
                          <AccordionTrigger className="flex items-center justify-between h-full">
                            <span>Contacto {index + 1}</span>
                          </AccordionTrigger>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeContact(index);
                            }}
                            disabled={fields.length === 1}
                            className="bg-red-500 text-white hover:bg-red-600 hover:text-white flex items-center justify-center h-8 w-8"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                          <div className="space-y-2 flex justify-between items-start w-full gap-4">
                            <div className="grid grid-cols-2 gap-2 w-3/4">
                              <FormField
                                control={form.control}
                                name={`contacts.${index}.first_name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        placeholder="Nombre"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`contacts.${index}.last_name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Apellido</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        placeholder="Apellido"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`contacts.${index}.email`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Correo electrónico</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        placeholder="jhon@doe.com"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`contacts.${index}.phone`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                      <PhoneInput
                                        placeholder="Ej: +56 9 9891 8080"
                                        defaultCountry="CL"
                                        value={field.value as E164Number}
                                        onChange={(
                                          value: E164Number | undefined
                                        ) => field.onChange(value || "")}
                                        error={
                                          !!form.formState.errors.contacts?.[
                                            index
                                          ]?.phone
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="w-1/4">
                              <span className="text-sm font-bold">
                                Comunicaciones a enviar
                              </span>
                              {items.map((item) => (
                                <FormField
                                  key={item.id}
                                  control={form.control}
                                  name={`contacts.${index}.type_contact`}
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={item.id}
                                        className="flex flex-row items-center gap-1 mb-1"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              item.id
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...(field.value || []),
                                                    item.id,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value: any) =>
                                                        value !== item.id
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {item.label}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <div className="border border-gray-200 rounded-md p-5 space-y-3 w-full">
                  <TitleStep
                    title="Criterios para prorroga de cheques"
                    icon={<Banknote className="w-5 h-5" />}
                  />
                  <div className="space-y-2 flex justify-between items-start w-full gap-4">
                    <div className="grid grid-cols-3 gap-5 w-full">
                      <FormField
                        control={form.control}
                        name="operational.extension_request_period"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Plazo Para solicitud de prórroga
                            </FormLabel>
                            <FormControl>
                              <InputNumberCart
                                value={field.value ?? 0}
                                onChange={(val) => field.onChange(val)}
                                placeholder="Ej: 5000"
                                min={0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="operational.annual_extensions_per_debtor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Nro. Prórrogas anuales por deudor
                            </FormLabel>
                            <FormControl>
                              <InputNumberCart
                                value={field.value ?? 0}
                                onChange={(val) => field.onChange(val)}
                                placeholder="Ej: 5000"
                                min={0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="operational.maximum_extension_period"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plazo Máximo de prorroga</FormLabel>
                            <FormControl>
                              <InputNumberCart
                                value={field.value ?? 0}
                                onChange={(val) => field.onChange(val)}
                                placeholder="Ej: 5000"
                                min={0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="operational.approving_users"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aprobadores</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value?.[0] || ""}
                                onValueChange={(value) => {
                                  if (value && !field.value?.includes(value)) {
                                    field.onChange([
                                      ...(field.value || []),
                                      value,
                                    ]);
                                  }
                                }}
                                disabled={loadingUsers}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      loadingUsers
                                        ? "Cargando usuarios..."
                                        : "Seleccionar aprobador"
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id!}>
                                      {user.first_name} {user.last_name} (
                                      {user.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            {field.value && field.value.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">
                                  Usuarios seleccionados:
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {field.value.map((userId) => {
                                    const user = users.find(
                                      (u) => u.id === userId
                                    );
                                    if (!user) return null;
                                    return (
                                      <div
                                        key={userId}
                                        className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs"
                                      >
                                        <span>
                                          {user.first_name} {user.last_name}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            field.onChange(
                                              field.value?.filter(
                                                (id) => id !== userId
                                              )
                                            );
                                          }}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-md p-5 space-y-3 w-full">
                  <TitleStep
                    title="Impuestos"
                    icon={<ChartLine className="w-5 h-5" />}
                  />
                  <div className="space-y-2 flex justify-between items-start w-full gap-4">
                    <div className="grid grid-cols-3 gap-5 w-full">
                      <FormField
                        control={form.control}
                        name="operational.country_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>País</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="Chile" disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="operational.currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Moneda</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="CLP" disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="operational.tax_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Impuesto</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="IVA" disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              {!isFirstStep && (
                <Button
                  type="button"
                  onClick={onBack}
                  variant="outline"
                  className="px-6 py-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" /> Volver
                </Button>
              )}
              <div className={isFirstStep ? "ml-auto" : ""}>
                <Button
                  type="submit"
                  className="px-6 py-2"
                  disabled={
                    loading || (!form.formState.isValid && !hasFormChanges())
                  }
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" /> Cargando
                    </div>
                  ) : (
                    <>
                      Continuar <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>
        </StepLayout>
      </form>
    </FormProvider>
  );
};

export default StepContacts;
