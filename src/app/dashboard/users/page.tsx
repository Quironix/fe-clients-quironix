"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { UsersIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import DialogForm from "../components/dialog-form";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import Search from "./components/search";
import UserForm from "./components/user-form";
import UsersTable from "./components/users-table";
import { User } from "./services/types";
import { useUserStore } from "./store";

const UsersContent = () => {
  const t = useTranslations("users");
  const tc = useTranslations("common");
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
        toast.success(tc("toast.success"), {
          description: t("toast.updateSuccess"),
        });
        setIsEditDialogOpen(false);
        setEditingUser(null);
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast.error(tc("toast.error"), {
        description: t("toast.updateError"),
      });
    }
  };

  const handleDelete = async (user: any) => {
    try {
      await deleteUser(user.id, session?.token, profile?.client?.id);
      toast.success(tc("toast.success"), {
        description: t("toast.deleteSuccess"),
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error(tc("toast.error"), {
        description: t("toast.deleteError"),
      });
    }
  };

  const handleReinvite = async (user: any) => {
    // Implementar lógica de reinvitación
    console.log("Reinvitar usuario:", user);
    // await reinviteUser(user.email, session?.token, profile?.client?.id);
    toast.success(tc("toast.success"), {
      description: t("toast.reinviteSuccess"),
    });
  };

  const handleUserSubmit = async (data: any) => {
    try {
      console.log("Enviando datos para crear usuario:", data);
      await useUserStore
        .getState()
        .addUser(data, session?.token, profile?.client?.id);
      toast.success(tc("toast.success"), {
        description: t("toast.createSuccess"),
      });
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      toast.error(tc("toast.error"), {
        description:
          error.message ||
          t("toast.createError"),
      });
    }
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<UsersIcon color="white" />}
          subDescription={t("subDescription")}
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="w-full h-full">
            <section className="flex items-center justify-between mb-4">
              <Search />
              <DialogForm
                title={t("createTitle")}
                description={t("createDescription")}
                trigger={
                  <Button
                    className="bg-orange-500 text-white hover:bg-orange-400 cursor-pointer"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <UsersIcon className="mr-2" /> {t("createUser")}
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
        title={t("editTitle")}
        description={t("editDescription")}
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
    <Suspense fallback={<div></div>}>
      <UsersContent />
    </Suspense>
  );
};

export default UsersPage;
