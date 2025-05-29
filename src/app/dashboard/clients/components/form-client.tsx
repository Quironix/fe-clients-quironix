"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormProvider, useForm } from "react-hook-form";
import {
  FormMessage,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ClientCreate, ClientFormData, ClientDTO } from "../services/dto";
import { useSession } from "next-auth/react";
import { getCountries } from "../services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlanStore } from "../../plans/store/indext";
import { Loader } from "lucide-react";
import { useDashboard } from "@/stores/dashboard/dashboardStore";

const clientFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Campo requerido").max(100, "Máximo 100 caracteres"),
  country_id: z.string().min(1, "País requerido"),
  plan_id: z.string().min(1, "Plan requerido"),
  terms_and_conditions: z.string().optional(),
  contract: z.string().optional(),
  type: z.literal("FACTORING"),
  contacts: z.object({
    first_name: z.string().min(1, "Nombre de contacto requerido"),
    last_name: z.string().min(1, "Apellido de contacto requerido"),
    email: z.string().email("Email inválido"),
  }),
});

type ClientFormValue = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  defaultValues?: ClientFormValue;
  onSubmit?: (data: ClientCreate) => Promise<void>;
  setOpen?: (open: boolean) => void;
}

const ClientForm = ({ defaultValues, onSubmit, setOpen }: ClientFormProps) => {
  const { data: session }: any = useSession();
  const { countries, refreshCountries } = useDashboard();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { plans, refreshPlans, isLoading: isLoadingPlans } = usePlanStore();

  // Función para convertir archivos a base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Error al convertir archivo a base64"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (session?.token) {
        setIsLoadingData(true);
        try {
          await Promise.all([
            refreshPlans(session?.token),
            refreshCountries(session?.token),
          ]);
        } catch (error) {
          console.error("Error al cargar datos:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();
  }, [session?.token]);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultValues
      ? {
          id: defaultValues.id || "",
          name: defaultValues.name || "",
          type: "FACTORING",
          country_id: defaultValues.country_id || "",
          plan_id: defaultValues.plan_id || "",
          contacts: {
            first_name: defaultValues.contacts?.first_name || "",
            last_name: defaultValues.contacts?.last_name || "",
            email: defaultValues.contacts?.email || "",
          },
          terms_and_conditions: defaultValues.terms_and_conditions || "",
          contract: defaultValues.contract || "",
        }
      : {
          name: "",
          type: "FACTORING",
          country_id: "",
          plan_id: "",
          contacts: {
            first_name: "",
            last_name: "",
            email: "",
          },
          terms_and_conditions: "",
          contract: "",
        },
  });

  const handleSubmit = async (data: ClientFormData) => {
    try {
      if (onSubmit) {
        const clientData = ClientDTO.toAPI(data);
        if (defaultValues?.id) {
          clientData.id = defaultValues.id;
        }
        await onSubmit(clientData);
        if (setOpen) {
          setOpen(false);
        }
      }
    } catch (error) {
      console.error("Error al guardar el cliente:", error);
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full space-y-6"
        autoComplete="off"
      >
        <div className="grid gap-4 py-4 space-y-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Razón social<span className="text-orange-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa razón social" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  País<span className="text-orange-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un país" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingData ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : (
                      countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contacts.first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre<span className="text-orange-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contacts.last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Apellido<span className="text-orange-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Apellido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contacts.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email<span className="text-orange-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="nombre.apellido@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Selecciona un plan<span className="text-orange-500">*</span>{" "}
                    {isLoadingPlans && (
                      <Loader className="inline animate-spin w-4 h-4" />
                    )}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingPlans || isLoadingData}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingPlans || isLoadingData ? (
                        <SelectItem value="loading" disabled>
                          Cargando planes...
                        </SelectItem>
                      ) : plans.length === 0 ? (
                        <SelectItem value="" disabled>
                          No hay planes disponibles
                        </SelectItem>
                      ) : (
                        plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id || ""}>
                            {plan.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="terms_and_conditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Términos y condiciones
                  <span className="text-orange-500">*</span>
                </FormLabel>
                <div className="flex gap-2">
                  <div className="w-full">
                    <Input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      id="terms_file"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const base64 = await convertToBase64(file);
                            field.onChange(base64);
                          } catch (error) {
                            console.error(
                              "Error al convertir archivo a base64:",
                              error
                            );
                          }
                        }
                      }}
                    />
                    <div className="flex w-full">
                      <FormControl>
                        <Input
                          readOnly
                          placeholder="Selecciona un archivo"
                          value={field.value ? "Documento adjunto" : ""}
                          onClick={() => {
                            if (field.value) {
                              window.open(field.value, "_blank");
                            }
                          }}
                        />
                      </FormControl>
                      {field.value && (
                        <Button
                          type="button"
                          className="ml-2 bg-green-700 text-white"
                          onClick={() => {
                            if (field.value) {
                              const link = document.createElement("a");
                              link.href = field.value;
                              link.download = "terminos_y_condiciones.pdf";
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 h-4 w-4"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Descargar
                        </Button>
                      )}
                      <Button
                        type="button"
                        className="ml-2 bg-blue-700 text-white"
                        onClick={() => {
                          const input = document.getElementById(
                            "terms_file"
                          ) as HTMLInputElement;
                          if (input) {
                            input.value = ""; // Limpiar el input para permitir seleccionar el mismo archivo
                            input.click();
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        {field.value ? "Cambiar archivo" : "Adjuntar archivo"}
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Por favor, elige un archivo en formato PDF (Máximo 5mb).
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contract"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contrato<span className="text-orange-500">*</span>
                </FormLabel>
                <div className="flex gap-2">
                  <div className="w-full">
                    <Input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      id="contract_file"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const base64 = await convertToBase64(file);
                            field.onChange(base64);
                          } catch (error) {
                            console.error(
                              "Error al convertir archivo a base64:",
                              error
                            );
                          }
                        }
                      }}
                    />
                    <div className="flex w-full">
                      <FormControl>
                        <Input
                          readOnly
                          placeholder="Selecciona un archivo"
                          value={field.value ? "Documento adjunto" : ""}
                          onClick={() => {
                            if (field.value) {
                              window.open(field.value, "_blank");
                            }
                          }}
                        />
                      </FormControl>
                      {field.value && (
                        <Button
                          type="button"
                          className="ml-2 bg-green-700 text-white"
                          onClick={() => {
                            if (field.value) {
                              const link = document.createElement("a");
                              link.href = field.value;
                              link.download = "contrato.pdf";
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 h-4 w-4"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Descargar
                        </Button>
                      )}
                      <Button
                        type="button"
                        className="ml-2 bg-blue-700 text-white"
                        onClick={() => {
                          const input = document.getElementById(
                            "contract_file"
                          ) as HTMLInputElement;
                          if (input) {
                            input.value = ""; // Limpiar el input para permitir seleccionar el mismo archivo
                            input.click();
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        {field.value ? "Cambiar archivo" : "Adjuntar archivo"}
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Por favor, elige un archivo en formato PDF (Máximo 5mb).
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input type="hidden" {...field} value="FACTORING" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen && setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-blue-700 text-white"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ClientForm;
