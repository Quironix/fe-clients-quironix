"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose } from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { Role } from "../services/types";

const roleFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Campo requerido").max(50, "Máximo 50 caracteres"),
  description: z
    .string()
    .min(3, "Campo requerido")
    .max(50, "Máximo 50 caracteres"),
  permissions: z
    .array(
      z.object({
        resource_id: z.string(),
        can_view: z.boolean().optional(),
        can_edit: z.boolean().optional(),
        can_delete: z.boolean().optional(),
      })
    )
    .min(1, "Debe seleccionar al menos un permiso"),
});

type RoleFormValue = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  defaultValues?: Partial<Role>;
  onSubmit?: (data: Role) => Promise<void>;
  setOpen?: (open: boolean) => void;
}

const RoleForm = ({ defaultValues, onSubmit, setOpen }: RoleFormProps) => {
  const [resources, setResources] = useState<any[]>([]);
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();

  const form = useForm<RoleFormValue>({
    resolver: zodResolver(roleFormSchema) as any,
    defaultValues: {
      ...defaultValues,
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      permissions:
        defaultValues?.scopes?.map((scope) => {
          if (typeof scope === "string") {
            return {
              resource_id: scope,
              can_view: false,
              can_edit: false,
              can_delete: false,
            };
          }
          return {
            resource_id: scope.resource_id || "",
            can_view: scope.can_view || false,
            can_edit: scope.can_edit || false,
            can_delete: scope.can_delete || false,
          };
        }) || [],
    },
  });

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      const resourcesData =
        profile?.client.subscriptions[0].plan.system_resources;
      // const initialPermissions = resourcesData.map((resource: any) => ({
      //   resource_id: resource.id,
      //   can_view: false,
      //   can_edit: false,
      //   can_delete: false,
      // }));
      setResources(resourcesData);
      // form.setValue("permissions", initialPermissions);
      // console.log("initialPermissions", initialPermissions);
      // fetchResources();
    }
  }, [session?.token, profile?.client?.id]);

  // const fetchResources = async () => {
  //   const resourcesData = await getResources(session?.token);
  //   setResources(resourcesData);

  //   // Inicializa los permisos si no hay valores por defecto
  //   if (!defaultValues?.scopes || defaultValues.scopes.length === 0) {
  //     const initialPermissions = resourcesData.map((resource: any) => ({
  //       resource_id: resource.id,
  //       can_view: false,
  //       can_edit: false,
  //       can_delete: false,
  //     }));
  //     form.setValue("permissions", initialPermissions);
  //   }
  // };

  const handleSubmit = async (data: RoleFormValue): Promise<void> => {
    try {
      // Transformar los permisos al formato esperado por la API
      const formattedScopes = data.permissions
        .filter(
          (permission) =>
            permission.can_view || permission.can_edit || permission.can_delete
        )
        .map((permission) => ({
          resource_id: permission.resource_id,
          can_view: permission.can_view || false,
          can_edit: permission.can_edit || false,
          can_delete: permission.can_delete || false,
        }));

      // Asegurar que el formato sea exactamente el requerido para la API
      const roleData = {
        name: data.name,
        description: data.description,
        scopes: formattedScopes,
      } as Role;

      // Agregar el ID solo si está presente en los datos originales
      if (defaultValues?.id) {
        roleData.id = defaultValues.id;
      }

      if (onSubmit) {
        await onSubmit(roleData);
        // Cerrar el modal después de la creación exitosa
        if (setOpen) {
          setOpen(false);
        }
      }
    } catch (error) {
      console.error("Error al guardar el rol:", error);
    }
  };

  const handleCheckboxChange = (
    resourceId: string,
    permissionType: "can_view" | "can_edit" | "can_delete",
    checked: boolean
  ) => {
    const permissions = form.getValues("permissions") || [];
    const resourceIndex = permissions.findIndex(
      (p) => p.resource_id === resourceId
    );

    if (resourceIndex === -1) {
      // Si no existe, agregamos un nuevo permiso
      const newPermission = {
        resource_id: resourceId,
        can_view: permissionType === "can_view" ? checked : false,
        can_edit: permissionType === "can_edit" ? checked : false,
        can_delete: permissionType === "can_delete" ? checked : false,
      };
      form.setValue("permissions", [...permissions, newPermission]);
    } else {
      // Si existe, actualizamos el permiso existente
      const updatedPermissions = [...permissions];
      updatedPermissions[resourceIndex] = {
        ...updatedPermissions[resourceIndex],
        [permissionType]: checked,
      };
      form.setValue("permissions", updatedPermissions);
    }
  };

  const isChecked = (
    resourceId: string,
    permissionType: "can_view" | "can_edit" | "can_delete"
  ): boolean => {
    const permissions = form.watch("permissions") || [];
    const permission = permissions.find((p) => p.resource_id === resourceId);
    return permission ? !!permission[permissionType] : false;
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
              name="name"
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
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Descripción<span className="text-orange-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Administrador de recursos"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Label>
              Secciones<span className="text-orange-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              Selecciona qué tipo de permiso tendrá el rol en cada sección
            </p>

            <div className="border rounded-lg overflow-hidden mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Secciones</TableHead>
                    <TableHead className="text-center">
                      Crear/Actualizar
                    </TableHead>
                    <TableHead className="text-center">Lectura</TableHead>
                    <TableHead className="text-center">Eliminar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources
                    .sort((a: any, b: any) => a.name.localeCompare(b.name))
                    .map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>{resource.name}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            id={`edit-${resource.id}`}
                            checked={isChecked(resource.id, "can_edit")}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(
                                resource.id,
                                "can_edit",
                                checked === true
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            id={`view-${resource.id}`}
                            checked={isChecked(resource.id, "can_view")}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(
                                resource.id,
                                "can_view",
                                checked === true
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            id={`delete-${resource.id}`}
                            checked={isChecked(resource.id, "can_delete")}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(
                                resource.id,
                                "can_delete",
                                checked === true
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {form.formState.errors.permissions && (
              <span className="text-red-500 text-xs mt-1">
                Debe asignar al menos un permiso
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="bg-blue-700 text-white"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Guardando
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default RoleForm;
