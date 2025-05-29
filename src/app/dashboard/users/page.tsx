"use client";
import React, { useEffect, useState, Suspense } from "react";
import Header from "../components/header";
import TopNav from "../components/topnav";
import { topNav } from "../data";
import { useDashboard } from "@/stores/dashboard/dashboardStore";
import { Main } from "../components/main";
import { Button } from "@/components/ui/button";
import TitleSection from "../components/title-section";
import { UsersIcon, Loader } from "lucide-react";
import { useUserStore } from "./store";
import Search from "./components/search";
import UsersTable from "./components/users-table";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DialogForm from "../components/dialog-form";
import UserForm from "./components/user-form";
import DialogConfirm from "../components/dialog-confirm";
import { toast } from "sonner";
import { User } from "./services/types";
import { useProfileContext } from "@/context/ProfileContext";

const UsersContent = () => {
  const { profile, session, isLoading, error } = useProfileContext();
  const {
    users,
    loading,
    error: userError,
    searchTerm,
    setSearchTerm,
    fetchUsers,
    deleteUser,
    updateUser,
    // reinviteUser,
  } = useUserStore();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchUsers(session?.token, profile.client.id);
    }
  }, [session?.token, profile?.client?.id]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: User): Promise<void> => {
    try {
      if (editingUser?.id) {
        await updateUser(
          editingUser.id,
          data,
          session?.token,
          profile?.client?.id
        );
        toast.success("Éxito", {
          description: "El usuario se ha actualizado correctamente.",
        });
        setIsEditDialogOpen(false);
        setEditingUser(null);
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast.error("Error", {
        description:
          "No se pudo actualizar el usuario. Por favor, intente nuevamente.",
      });
    }
  };

  const handleDelete = async (user: any) => {
    try {
      debugger;
      await deleteUser(user.id, session?.token, profile?.client?.id);
      toast.success("Éxito", {
        description: "El usuario se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("Error", {
        description:
          "No se pudo eliminar el usuario. Por favor, intente nuevamente.",
      });
    }
  };

  const handleReinvite = async (user: any) => {
    // Implementar lógica de reinvitación
    console.log("Reinvitar usuario:", user);
    // await reinviteUser(user.email, session?.token, profile?.client?.id);
    toast.success("Éxito", {
      description: "El usuario se ha reinvitado correctamente.",
    });
  };

  const handleUserSubmit = async (data: any) => {
    try {
      console.log("Enviando datos para crear usuario:", data);
      await useUserStore
        .getState()
        .addUser(data, session?.token, profile?.client?.id);
      toast.success("Éxito", {
        description: "El usuario se ha creado correctamente.",
      });
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      toast.error("Error", {
        description:
          error.message ||
          "No se pudo crear el usuario. Por favor, intente nuevamente.",
      });
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
          title="Usuarios"
          description="Aquí puedes ver un resumen de tus usuarios."
          icon={<UsersIcon color="white" />}
          subDescription="Usuarios"
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="w-full h-full">
            <section className="flex items-center justify-between mb-4">
              <Search />
              <DialogForm
                title="Crear usuario"
                description="Completa los campos obligatorios para crear un nuevo usuario."
                trigger={
                  <Button
                    className="bg-orange-500 text-white hover:bg-orange-400 cursor-pointer"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <UsersIcon className="mr-2" /> Crear usuario
                  </Button>
                }
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <UserForm
                  onSubmit={handleUserSubmit}
                  setOpen={setIsCreateDialogOpen}
                />
              </DialogForm>
            </section>
            <Card className="p-4">
              <UsersTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReinvite={handleReinvite}
              />
            </Card>
          </div>
        </div>
      </Main>

      {/* Diálogo de edición */}
      <DialogForm
        title="Editar usuario"
        description="Modifica los campos que desees actualizar."
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        trigger={<span />} // Elemento vacío ya que el diálogo se abre programáticamente
      >
        <UserForm
          defaultValues={editingUser || undefined}
          onSubmit={handleEditSubmit}
          setOpen={setIsEditDialogOpen}
        />
      </DialogForm>
    </>
  );
};

const UsersPage = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <UsersContent />
    </Suspense>
  );
};

export default UsersPage;
