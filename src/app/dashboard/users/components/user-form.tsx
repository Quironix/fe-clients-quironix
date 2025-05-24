"use client";

import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { User, Role } from "../services/types";
import { getRoles } from "../services";
import { useProfileContext } from "@/context/ProfileContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogClose } from "@/components/ui/dialog";
import { PhoneInput } from "@/components/ui/phone-input";
import type { E164Number } from "libphonenumber-js/core";

const userFormSchema = z.object({
  id: z.string().optional(),
  first_name: z
    .string()
    .min(3, "Campo requerido")
    .max(50, "Máximo 50 caracteres"),
  last_name: z
    .string()
    .min(3, "Campo requerido")
    .max(50, "Máximo 50 caracteres"),
  email: z.string().email("Email inválido"),
  phone_number: z
    .string()
    .min(8, "Campo requerido")
    .max(15, "Máximo 15 caracteres")
    .refine((value) => /^\+?[1-9]\d{1,14}$/.test(value), {
      message: "Número de teléfono inválido",
    }),
  type: z
    .string()
    .min(1, "Campo requerido")
    .refine((value) => ["ADMIN", "NORMAL"].includes(value), {
      message: "Debe seleccionar un rol válido",
    }),
  roles: z.array(z.string()).min(1, "Debe seleccionar al menos un rol"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  defaultValues?: Partial<User>;
  onSubmit?: (data: User) => Promise<void>;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

const UserForm = ({ defaultValues, onSubmit, setOpen }: UserFormProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const { profile, session } = useProfileContext();
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    mode: "onChange",
    defaultValues: {
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      email: defaultValues?.email || "",
      phone_number: defaultValues?.phone_number || "",
      type: defaultValues?.type || "",
      roles: defaultValues?.roles || [],
    },
  });

  useEffect(() => {
    if (session?.token && profile) {
      fetchRoles();
    }
  }, [session?.token, profile]);

  useEffect(() => {
    if (defaultValues) {
      console.log("Actualizando valores del formulario:", defaultValues);

      // Asegurarse de que los roles sean siempre un array, incluso si vienen como undefined
      const roles: any = Array.isArray(defaultValues.roles)
        ? defaultValues.roles
        : [];

      // Actualizar los valores del formulario
      form.reset({
        first_name: defaultValues.first_name || "",
        last_name: defaultValues.last_name || "",
        email: defaultValues.email || "",
        phone_number: defaultValues.phone_number || "",
        type: defaultValues.type || "",
        roles: roles.map((role: any) => role.id),
      });

      // Forzar un renderizado después de actualizar los valores
      setTimeout(() => {
        form.trigger(); // Esto fuerza una nueva validación y un re-renderizado
      }, 100);
    }
  }, [defaultValues, form]);

  const fetchRoles = async () => {
    try {
      const rolesData = await getRoles(session?.token, profile?.client?.id);
      setRoles(rolesData);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };

  const handleSubmit = async (data: UserFormValues): Promise<void> => {
    setSubmitAttempted(true);

    try {
      // Validar los datos antes de enviar
      console.log("Datos recibidos en handleSubmit:", data);
      console.log("Errores del formulario:", form.formState.errors);

      // Si hay errores, no continuar
      if (Object.keys(form.formState.errors).length > 0) {
        console.error("Hay errores en el formulario:", form.formState.errors);
        return;
      }

      const userData = {
        ...data,
        // Asegurarse de que roles siempre sea un array
        roles: Array.isArray(data.roles) ? data.roles : [],
      } as User;

      console.log("Datos a enviar:", userData);

      if (onSubmit) {
        await onSubmit(userData);
        if (setOpen) {
          setOpen(false);
        }
      }
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      // No cerramos el diálogo en caso de error para permitir al usuario corregir
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full space-y-6"
        autoComplete="off"
      >
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre<span className="text-orange-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Apellido<span className="text-orange-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email<span className="text-orange-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Ej: juan@ejemplo.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Teléfono<span className="text-orange-500">*</span>
                </FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder="Ej: +56 9 9891 8080"
                    defaultCountry="CL"
                    value={field.value as E164Number}
                    onChange={(value: E164Number | undefined) =>
                      field.onChange(value || "")
                    }
                    error={!!form.formState.errors.phone_number}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tipo de usuario<span className="text-orange-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="NORMAL">Usuario</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Label>
              Roles<span className="text-orange-500">*</span>
            </Label>
            <div className="flex flex-col gap-2 mt-2">
              {roles.map((role) => {
                // Verificar si el rol está seleccionado
                const isChecked =
                  Array.isArray(form.watch("roles")) &&
                  form.watch("roles").includes(role.id);

                return (
                  <div
                    key={`role-${role.id}`}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      id={`role-checkbox-${role.id}`}
                      checked={isChecked}
                      onChange={(e) => {
                        const currentRoles = form.getValues("roles") || [];
                        if (e.target.checked) {
                          form.setValue("roles", [...currentRoles, role.id], {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        } else {
                          form.setValue(
                            "roles",
                            currentRoles.filter((id) => id !== role.id),
                            { shouldValidate: true, shouldDirty: true }
                          );
                        }
                      }}
                    />
                    <label htmlFor={`role-checkbox-${role.id}`}>
                      {role.name}
                    </label>
                  </div>
                );
              })}
            </div>
            {form.formState.errors.roles && (
              <span className="text-red-500 text-xs">
                {form.formState.errors.roles.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {submitAttempted && Object.keys(form.formState.errors).length > 0 && (
            <div className="text-red-500 text-xs self-center mr-2">
              Por favor, completa todos los campos requeridos
            </div>
          )}
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="bg-blue-700 text-white"
            disabled={form.formState.isSubmitting}
            onClick={() => {
              // Esto permite que se muestren los errores al hacer clic en el botón
              if (Object.keys(form.formState.errors).length > 0) {
                setSubmitAttempted(true);
              }
            }}
          >
            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default UserForm;
