"use client";

import { getCountries } from "@/app/services";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import type { E164Number } from "libphonenumber-js/core";
import { Building2, Loader2, Mail, MapPin, Plus, Trash } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import CountriesSelectFormItem from "../../components/countries-select-form-item";
import { categories, typeDocuments } from "../../data";
import TitleStep from "../../settings/components/title-step";
import { useCompaniesStore } from "../store";
import { Company } from "../types";

// Schema de validación
const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .min(8, "Teléfono es requerido")
    .max(15, "Máximo 15 caracteres"),
  position: z
    .string()
    .min(1, "Cargo es requerido")
    .max(50, "Máximo 50 caracteres"),
});

const addressSchema = z.object({
  street: z
    .string()
    .min(1, "Dirección es requerida")
    .max(100, "Máximo 100 caracteres"),
  city: z
    .string()
    .min(1, "Ciudad es requerida")
    .max(50, "Máximo 50 caracteres"),
  state: z
    .string()
    .min(1, "Estado/Región es requerido")
    .max(50, "Máximo 50 caracteres"),
  country: z
    .string()
    .min(1, "País es requerido")
    .max(50, "Máximo 50 caracteres"),
  postalCode: z
    .string()
    .min(1, "Código postal es requerido")
    .max(10, "Máximo 10 caracteres"),
});

const companyFormSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  dni_type: z.string().min(1, "Tipo de documento es requerido"),
  dni_number: z
    .string()
    .min(1, "Número de documento es requerido")
    .max(20, "Máximo 20 caracteres"),
  client_code: z
    .string()
    .min(1, "Código de cliente es requerido")
    .max(50, "Máximo 50 caracteres"),
  category: z.string().min(1, "Categoría es requerida"),
  address: z.array(addressSchema).min(1, "Debe agregar al menos una dirección"),
  contacts: z.array(contactSchema).min(1, "Debe agregar al menos un contacto"),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface CompanyFormProps {
  defaultValues?: Partial<Company>;
  onSubmit?: (data: Company) => Promise<void>;
  setOpen?: (open: boolean) => void;
  isLoading?: boolean;
}

const CompanyForm = ({
  defaultValues,
  onSubmit,
  setOpen,
  isLoading,
}: CompanyFormProps) => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { session, profile } = useProfileContext();
  const { getCompanyById, company, clearCompany } = useCompaniesStore();
  const [countries, setCountries] = useState<any[]>([]);
  const [activeAccordion, setActiveAccordion] = useState<string>("item-0");
  const [activeAddressAccordion, setActiveAddressAccordion] =
    useState<string>("address-item-0");
  const [isLoadingCompany, setIsLoadingCompany] = useState<boolean>(false);

  useEffect(() => {
    if (session?.token) {
      getCountries(session.token).then((countries) => {
        setCountries(countries);
      });
    }
  }, [session?.token]);

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      if (id) {
        setIsLoadingCompany(true);
        getCompanyById(session?.token, profile.client.id, id).finally(() => {
          setIsLoadingCompany(false);
        });
      } else {
        // Limpiar el estado de company cuando no hay id (modo crear)
        clearCompany();
      }
    }
  }, [session?.token, profile?.client?.id, getCompanyById, id, clearCompany]);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    mode: "onChange",
    defaultValues: {
      name: defaultValues?.name || "",
      dni_type: defaultValues?.dni_type || "",
      dni_number: defaultValues?.dni_number || "",
      client_code: defaultValues?.client_code || "",
      category: defaultValues?.category || "",
      address: defaultValues?.address || [
        {
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
        },
      ],
      contacts: defaultValues?.contacts || [
        {
          name: "",
          email: "",
          phone: "",
          position: "",
        },
      ],
    },
  });

  useEffect(() => {
    if (company && company.id) {
      form.reset({
        id: company.id,
        name: company.name,
        dni_type: company.dni_type,
        dni_number: company.dni_number,
        client_code: company.client_code,
        category: company.category,
        address: company.address || [
          {
            street: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
          },
        ],
        contacts: company.contacts || [
          {
            name: "",
            email: "",
            phone: "",
            position: "",
          },
        ],
      });
    }
  }, [company, form]);

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control: form.control,
    name: "address",
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const handleSubmit = async (data: CompanyFormValues) => {
    try {
      if (onSubmit) {
        await onSubmit(data as Company);
        if (setOpen) {
          setOpen(false);
        }
      }
    } catch (error) {
      console.error("Error al guardar la empresa:", error);
    }
  };

  const addAddress = () => {
    appendAddress({
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    });
    // Abrir el nuevo accordion
    setActiveAddressAccordion(`address-item-${addressFields.length}`);
  };

  const removeAddressHandler = (index: number) => {
    removeAddress(index);
    // Si se elimina el accordion activo, activar el primero
    if (
      activeAddressAccordion === `address-item-${index}` &&
      addressFields.length > 1
    ) {
      setActiveAddressAccordion("address-item-0");
    }
  };

  const addContact = () => {
    appendContact({
      name: "",
      email: "",
      phone: "",
      position: "",
    });
    // Abrir el nuevo accordion
    setActiveAccordion(`item-${contactFields.length}`);
  };

  const removeContactHandler = (index: number) => {
    removeContact(index);
    // Si se elimina el accordion activo, activar el primero
    if (activeAccordion === `item-${index}` && contactFields.length > 1) {
      setActiveAccordion("item-0");
    }
  };

  return (
    <FormProvider {...form}>
      {isLoadingCompany ? (
        <CompanyFormSkeleton />
      ) : (
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full space-y-6"
          autoComplete="off"
        >
          <TitleStep title="Información de la empresa" icon={<Building2 />} />
          <div className="grid gap-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nombre de la empresa
                      <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Empresa XYZ S.A." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Código de cliente
                      <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: CLI001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dni_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipo de documento
                      <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchInput
                        value={field.value}
                        onValueChange={(value) =>
                          form.setValue("dni_type", value)
                        }
                        options={typeDocuments.map((type) => ({
                          value: type,
                          label: type,
                        }))}
                        placeholder="Selecciona un tipo de documento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dni_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Número de documento
                      <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 12345678-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Categoría<span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchInput
                        value={field.value}
                        onValueChange={(value) =>
                          form.setValue("category", value)
                        }
                        options={categories.map((type) => ({
                          value: type,
                          label: type,
                        }))}
                        placeholder="Selecciona una categoría"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Direcciones */}
            <div className="space-y-3 w-full">
              <div className="flex justify-between items-center">
                <TitleStep
                  title="Direcciones de la empresa"
                  icon={<MapPin className="w-5 h-5" />}
                />
                <Button
                  type="button"
                  onClick={addAddress}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-2 text-sm border-orange-500 hover:bg-orange-100 bg-white w-45 h-11 rounded-sm"
                >
                  <Plus className="w-4 h-4 text-orange-500" />
                  Agregar dirección
                </Button>
              </div>
              <Accordion
                type="single"
                collapsible
                className="w-full space-y-3"
                value={activeAddressAccordion}
                onValueChange={setActiveAddressAccordion}
              >
                {addressFields.map((field, index) => (
                  <AccordionItem
                    key={field.id}
                    value={`address-item-${index}`}
                    className="border border-gray-200 rounded-md px-3 py-1 mb-1"
                  >
                    <div className="grid grid-cols-[96%_4%] items-center gap-2 min-h-[48px]">
                      <AccordionTrigger className="flex items-center justify-between h-full">
                        <span>Dirección {index + 1}</span>
                      </AccordionTrigger>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAddressHandler(index);
                        }}
                        disabled={addressFields.length === 1}
                        className="bg-red-500 text-white hover:bg-red-600 hover:text-white flex items-center justify-center h-8 w-8"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`address.${index}.street`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Dirección
                                <span className="text-orange-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: Av. Providencia 123"
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
                          name={`address.${index}.state`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Estado/Región
                                <span className="text-orange-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: Metropolitana"
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
                          name={`address.${index}.city`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Ciudad<span className="text-orange-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: Santiago"
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
                          name={`address.${index}.country`}
                          render={({ field }) => (
                            <CountriesSelectFormItem
                              field={field}
                              title="País"
                              required
                            />
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`address.${index}.postalCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Código postal
                                <span className="text-orange-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: 7500000"
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
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Contactos */}
            <div className="space-y-3 w-full">
              <div className="flex justify-between items-center">
                <TitleStep
                  title="Contactos compañía"
                  icon={<Mail className="w-5 h-5" />}
                />
                <Button
                  type="button"
                  onClick={addContact}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-2 text-sm border-orange-500 hover:bg-orange-100 bg-white w-45 h-11 rounded-sm"
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
                {contactFields.map((field, index) => (
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
                          removeContactHandler(index);
                        }}
                        disabled={contactFields.length === 1}
                        className="bg-red-500 text-white hover:bg-red-600 hover:text-white flex items-center justify-center h-8 w-8"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`contacts.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Nombre<span className="text-orange-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Ej: Juan Pérez"
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
                              <FormLabel>
                                Email<span className="text-orange-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Ej: juan@empresa.com"
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
                              <FormLabel>
                                Teléfono
                                <span className="text-orange-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <PhoneInput
                                  placeholder="Ej: +56 9 9891 8080"
                                  defaultCountry="CL"
                                  value={field.value as E164Number}
                                  onChange={(value: E164Number | undefined) =>
                                    field.onChange(value || "")
                                  }
                                  error={
                                    !!form.formState.errors.contacts?.[index]
                                      ?.phone
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
                              <FormLabel>
                                Cargo<span className="text-orange-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Ej: Gerente General"
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
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4">
            {/* <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose> */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-45 h-11 rounded-sm"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? "Actualizar" : "Crear"} empresa
            </Button>
          </div>
        </form>
      )}
    </FormProvider>
  );
};

// Componente Skeleton para el formulario
const CompanyFormSkeleton = () => {
  return (
    <div className="w-full space-y-6">
      {/* Título */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Direcciones */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-44" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="border border-gray-200 rounded-md p-4 space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contactos */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-36" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="border border-gray-200 rounded-md p-4 space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
};

export default CompanyForm;
