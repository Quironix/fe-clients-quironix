"use client";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import Header from "../components/header";
import TopNav from "../components/topnav";
import { topNav } from "../data";
import { useDashboard } from "@/stores/dashboard/dashboardStore";
import { Main } from "../components/main";
import { Button } from "@/components/ui/button";
import TitleSection from "../components/title-section";
import { Edit, Plus, Puzzle, Trash2, UsersIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Search from "../users/components/search";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRoleStore } from "./store";
import { useSession } from "next-auth/react";
import LoaderTable from "../components/loader-table";
import DialogForm from "../components/dialog-form";
import { Role } from "./services/types";
import { Input } from "@/components/ui/input";
import RoleForm from "./components/form-role";
import DialogConfirm from "../components/dialog-confirm";
import { useSearchParams } from "next/navigation";

const RolesContent = () => {
  const { data: session }: any = useSession();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const {
    roles,
    isLoading,
    refreshRoles,
    createRole,
    updateRole,
    deleteRole,
    setEditRole,
    editRole,
    setSearchTerm,
  } = useRoleStore();

  useEffect(() => {
    if (session?.token) {
      refreshRoles(session?.token);
    }
  }, [session?.token]);

  // Actualizar el searchTerm en el store cuando cambie el parámetro de búsqueda en la URL
  useEffect(() => {
    setSearchTerm(searchTerm);
  }, [searchTerm, setSearchTerm]);

  // Filtrar roles basados en el término de búsqueda
  const filteredRoles = useMemo(() => {
    if (!searchTerm) return roles;
    return roles.filter((role) =>
      role.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const handleEditRole = async (data: unknown): Promise<void> => {
    const roleData = data as Role;
    if (roleData && roleData.id) {
      // Actualizar el rol con los datos completos incluyendo scopes
      await updateRole(session?.token, roleData.id, roleData);
      setEditingRoleId(null);
    }
  };
  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            size="icon"
            className="bg-orange-500 text-white rounded-full hover:bg-orange-400 cursor-pointer"
          >
            ES
          </Button>
        </div>
      </Header>
      <Main>
        <TitleSection
          title="Admin. Roles"
          description="Aquí puedes ver un resumen de tus deudas y pagos."
          icon={<UsersIcon color="white" />}
          subDescription="Usuarios"
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="w-full h-full">
            <Card className="h-full p-5">
              <div className="flex justify-between items-start gap-5">
                <div className="w-1/3">
                  <Image
                    src="/img/roles-image.svg"
                    alt="Roles"
                    width={100}
                    height={100}
                    className="w-full h-full"
                  />
                </div>
                <div className="w-2/3">
                  <div className="flex justify-between items-center">
                    <Search placeholder="Buscar por nombre de rol" />
                    <DialogForm
                      title="Crear rol"
                      trigger={
                        <Button
                          className="bg-orange-500 text-white hover:bg-orange-400"
                          onClick={() => setIsCreateDialogOpen(true)}
                        >
                          <div className="flex items-center gap-2">
                            <Puzzle /> Crear rol
                          </div>
                        </Button>
                      }
                      open={isCreateDialogOpen}
                      onOpenChange={setIsCreateDialogOpen}
                    >
                      <RoleForm
                        onSubmit={(data) => {
                          const roleData = data as Role;
                          return createRole(session?.token, roleData);
                        }}
                        setOpen={setIsCreateDialogOpen}
                      />
                    </DialogForm>
                  </div>
                  <div className="mt-5 p-3 border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-primary">Nombre</TableHead>
                          <TableHead className="text-primary text-right">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRoles.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center">
                              No se encontraron roles
                            </TableCell>
                          </TableRow>
                        )}
                        {isLoading ? (
                          <LoaderTable cols={2} />
                        ) : (
                          filteredRoles.map((role) => (
                            <TableRow key={role.id}>
                              <TableCell>{role.name}</TableCell>
                              <TableCell className="flex justify-end gap-2">
                                <DialogForm
                                  title="Editar rol"
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setEditRole(role);
                                        setEditingRoleId(role.id || "");
                                      }}
                                      className="hover:bg-orange-500 hover:text-white text-primary"
                                    >
                                      <Edit />
                                    </Button>
                                  }
                                  open={editingRoleId === role.id}
                                  onOpenChange={(open) => {
                                    if (!open) setEditingRoleId(null);
                                  }}
                                >
                                  <div className="p-4">
                                    <RoleForm
                                      defaultValues={role}
                                      onSubmit={handleEditRole}
                                      setOpen={() => setEditingRoleId(null)}
                                    />
                                  </div>
                                </DialogForm>
                                <DialogConfirm
                                  title="¿Estas seguro que deseas eliminar este rol?"
                                  description="Esta acción no se puede deshacer."
                                  triggerButton={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-red-500 hover:text-white text-primary"
                                    >
                                      <Trash2 />
                                    </Button>
                                  }
                                  onConfirm={() =>
                                    deleteRole(session?.token, role.id || "")
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Main>
    </>
  );
};

const RolesPage = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RolesContent />
    </Suspense>
  );
};

export default RolesPage;
