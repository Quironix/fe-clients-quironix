"use client";
import { InfoIcon } from "@/app/dashboard/components/info-icon";
import Stepper from "@/components/Stepper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputNumberCart from "@/components/ui/input-number-cart";
import { PhoneInput } from "@/components/ui/phone-input";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import type { E164Number } from "libphonenumber-js/core";
import {
  ArrowLeftIcon,
  Banknote,
  ChartLine,
  Loader,
  Mail,
  Plus,
  Save,
  Trash,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { getAll as getUsersService } from "../../../users/services";
import { User } from "../../../users/services/types";
import { updateDataClient } from "../../services";
import { StepProps } from "../../types";
import StepLayout from "../StepLayout";
import TitleStep from "../title-step";

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
  const [approvingUsers, setApprovingUsers] = useState<string[]>([]);
  const router = useRouter();

  // Cargar usuarios cuando el componente se monta
  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.token || !profile?.client?.id) return;

      setLoadingUsers(true);
      try {
        const usersData = await getUsersService(
          session.token,
          profile.client.id,
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
          first_name: z
            .string()
            .min(1, "El nombre es requerido")
            .max(50, "El nombre no puede exceder 50 caracteres"),
          last_name: z
            .string()
            .min(1, "El apellido es requerido")
            .max(50, "El apellido no puede exceder 50 caracteres"),
          email: z.string().email("Email inválido"),
          position: z.string().min(1, "El cargo es requerido"),
          phone: z
            .string()
            .min(8, "Campo requerido")
            .max(15, "Máximo 15 caracteres")
            .refine((value) => /^\+?[1-9]\d{1,14}$/.test(value), {
              message: "Número de teléfono inválido",
            }),
          type_contact: z
            .array(z.string())
            .min(1, "Debe seleccionar al menos un tipo de contacto"),
          is_default: z.boolean(),
        }),
      )
      .min(1, "Debe agregar al menos un contacto"),
    operational: z.object({
      extension_request_period: z.number().min(0, "Campo requerido"),
      annual_extensions_per_debtor: z.number().min(0, "Campo requerido"),
      maximum_extension_period: z.number().min(0, "Campo requerido"),
      approving_users: z.array(z.string()).optional(),
      country_id: z.string().optional(),
      currency: z.string().optional(),
      tax_id: z.string().optional(),
    }),
  });

  type ContactsFormType = z.infer<typeof contactsSchema>;
  const form = useForm<ContactsFormType>({
    resolver: zodResolver(contactsSchema) as any,
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
        extension_request_period:
          (profile?.client?.operational as any)?.extension_request_period ?? 0,
        annual_extensions_per_debtor:
          (profile?.client?.operational as any)?.annual_extensions_per_debtor ??
          0,
        maximum_extension_period:
          (profile?.client?.operational as any)?.maximum_extension_period ?? 0,
        approving_users: (() => {
          const approvingUsers = (profile?.client?.operational as any)
            ?.approving_users;

          // Si es un array, mantenerlo, si es string convertirlo a array, si no existe usar array vacío
          if (Array.isArray(approvingUsers)) {
            return approvingUsers;
          }
          return approvingUsers ? [approvingUsers] : [];
        })(),
      },
    },
    mode: "all",
    reValidateMode: "onChange",
  });

  // console.log("profile?.client?.operational", form.getValues());

  // useFieldArray para manejar contactos dinámicamente
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  // Actualizar valores cuando el perfil cambie
  useEffect(() => {
    if (profile?.client) {
      if (profile.client.operational) {
        setApprovingUsers(
          (profile.client.operational as any).approving_users || [],
        );
      }
      const newValues: ContactsFormType = {
        contacts: profile.client.contacts?.length
          ? profile.client.contacts.map((contact) => ({
              first_name: contact.first_name || "",
              last_name: contact.last_name || "",
              email: contact.email || "",
              position: (contact as any).position || "",
              phone: (contact as any).phone || "",
              type_contact: (contact as any).type_contact || [],
              is_default: (contact as any).is_default || false,
            }))
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
          extension_request_period:
            (profile.client.operational as any)?.extension_request_period ?? 0,
          annual_extensions_per_debtor:
            (profile.client.operational as any)?.annual_extensions_per_debtor ??
            0,
          maximum_extension_period:
            (profile.client.operational as any)?.maximum_extension_period ?? 0,
          approving_users:
            (profile.client.operational as any).approving_users.map(
              (user: any) => user.id,
            ) || [],
        },
      };
      form.reset(newValues);
    }
  }, [profile, form]);

  // Forzar validación cuando el formulario esté listo
  useEffect(() => {
    const timer = setTimeout(() => {
      form.trigger();
    }, 500);
    return () => clearTimeout(timer);
  }, [form, profile]);

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

  // Manejar envío del formulario
  const handleSubmit = async (data: ContactsFormType) => {
    // Validación personalizada para approving_users
    if (
      !data.operational.approving_users ||
      data.operational.approving_users.length === 0
    ) {
      toast.error("Debe seleccionar al menos un aprobador");
      return;
    }

    setLoading(true);
    try {
      if (!session?.token || !profile?.client?.id) {
        toast.error("Error de sesión");
        return;
      }
      // delete data.operational.country_id;
      // delete data.operational.currency;
      // delete data.operational.tax_id;

      const updateData = {
        contacts: data.contacts,
        operational: {
          extension_request_period: data.operational.extension_request_period,
          annual_extensions_per_debtor:
            data.operational.annual_extensions_per_debtor,
          maximum_extension_period: data.operational.maximum_extension_period,
          approving_users: Array.isArray(data.operational.approving_users)
            ? data.operational.approving_users
            : [data.operational.approving_users].filter(Boolean),
        },
      };

      await updateDataClient(updateData, profile.client.id, session?.token);
      await refreshProfile();
      toast.success("Información de contacto actualizada correctamente");

      // Regresar al step 1
      onStepChange(0);

      // Limpiar caché y refrescar la página
      if (typeof window !== "undefined") {
        // Forzar recarga completa con limpieza de caché
        window.location.href = window.location.href;
      } else {
        router.refresh(); // Fallback para SSR
      }
    } catch (error) {
      console.error("Error al actualizar contactos:", error);
      toast.error("Error al actualizar la información de contacto");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(handleSubmit)();
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        onKeyDown={handleKeyDown}
      >
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
                            <div className="grid grid-cols-3 gap-2 w-3/4">
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
                                          value: E164Number | undefined,
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
                              <FormField
                                control={form.control}
                                name={`contacts.${index}.position`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cargo</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        placeholder="Ej: Gerente"
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
                                              item.id,
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
                                                        value !== item.id,
                                                    ),
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
                  <p className="text-sm">
                    Esta sección forma parte de tus políticas de crédito. Aquí
                    defines las condiciones bajo las cuales tu empresa permitirá
                    extender el vencimiento de cheques emitidos por deudores.
                    <br />
                    Las prórrogas deben gestionarse como una excepción
                    controlada, ya que impactan directamente en la exposición
                    financiera y en la disciplina de pago de la cartera. Para
                    ello, debes definir:
                  </p>
                  <div className="space-y-2 flex justify-between items-start w-full gap-4">
                    <div className="grid grid-cols-3 gap-5 w-full">
                      <FormField
                        control={form.control}
                        name="operational.extension_request_period"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Plazo Para solicitud de prórroga
                              <InfoIcon
                                color="#FF8113"
                                tooltipContent={
                                  <span>
                                    Número de días de anticipación con los que
                                    el deudor debe solicitar la extensión antes
                                    del vencimiento del cheque. <br />
                                    Esto evita decisiones reactivas y permite
                                    una evaluación adecuada del riesgo.
                                  </span>
                                }
                              />
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
                              <InfoIcon
                                color="#FF8113"
                                tooltipContent={
                                  <span>
                                    Establece cuántas extensiones podrá
                                    solicitar un mismo deudor dentro de un año.
                                    <br />
                                    Este parámetro permite controlar
                                    recurrencias y detectar posibles deterioros
                                    en su comportamiento de pago.
                                  </span>
                                }
                              />
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
                            <FormLabel>
                              Plazo Máximo de prorroga
                              <InfoIcon
                                color="#FF8113"
                                tooltipContent={
                                  <span>
                                    Cantidad máxima de días que podrá extenderse
                                    un cheque.
                                    <br /> Debe definirse considerando las
                                    políticas bancarias y los límites internos
                                    de financiamiento implícito.
                                  </span>
                                }
                              />
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
                        name="operational.approving_users"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Aprobadores{" "}
                              <InfoIcon
                                color="#FF8113"
                                tooltipContent={
                                  <span>
                                    Usuarios responsables de autorizar o
                                    rechazar solicitudes. <br />
                                    Esto asegura trazabilidad y control interno
                                    en decisiones excepcionales.
                                  </span>
                                }
                              />
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                {loadingUsers ? (
                                  <div className="text-sm text-gray-500">
                                    Cargando usuarios...
                                  </div>
                                ) : (
                                  users.map((user) => (
                                    <div
                                      key={user.id}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        checked={field.value?.includes(
                                          user.id!,
                                        )}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setApprovingUsers([
                                              ...approvingUsers,
                                              user.id!,
                                            ]);
                                            field.onChange([user.id!]);
                                          } else {
                                            setApprovingUsers(
                                              approvingUsers.filter(
                                                (id) => id !== user.id,
                                              ),
                                            );
                                            field.onChange([]);
                                          }
                                        }}
                                      />
                                      <label className="text-sm font-normal">
                                        {user.first_name} {user.last_name}
                                      </label>
                                    </div>
                                  ))
                                )}
                              </div>
                            </FormControl>
                            {field.value && field.value.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">
                                  Usuarios seleccionados:
                                </span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {field.value.map((userId) => {
                                    const user = users.find(
                                      (u) => u.id === userId,
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
                                            const currentValue =
                                              field.value || [];
                                            field.onChange(
                                              currentValue.filter(
                                                (id) => id !== userId,
                                              ),
                                            );
                                          }}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            <FormMessage />
                            {(!field.value || field.value.length === 0) && (
                              <p className="text-sm text-red-600">
                                Debe seleccionar al menos un aprobador
                              </p>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <small>
                    Estos criterios determinan qué solicitudes serán aceptadas,
                    cuáles requerirán aprobación y cuándo se bloquearán
                    automáticamente por incumplimiento de la política definida.
                  </small>
                </div>

                <div className="border border-gray-200 rounded-md p-5 space-y-3 w-full">
                  <TitleStep
                    title="Impuestos"
                    icon={<ChartLine className="w-5 h-5" />}
                  />
                  <div className="space-y-2 flex justify-between items-start w-full gap-4">
                    <div className="grid grid-cols-3 gap-5 w-full">
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Chile"
                            value={profile?.client?.country?.name || ""}
                            readOnly
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <FormItem>
                        <FormLabel>Moneda</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="CLP"
                            value={profile?.client?.country?.currency || ""}
                            readOnly
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <FormItem>
                        <FormLabel>Impuesto</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="IVA"
                            value={
                              profile?.client?.country?.tax_rate?.toString() ||
                              ""
                            }
                            readOnly
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
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
                <Button type="submit" className="px-6 py-2" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" /> Cargando
                    </div>
                  ) : (
                    <>
                      Finalizar <Save className="w-4 h-4" />
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
