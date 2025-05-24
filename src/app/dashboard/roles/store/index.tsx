import { create as createStore } from "zustand";
import { getAll, create, update, remove } from "../services";
import { toast } from "sonner";
import { Role } from "../services/types";

interface RoleStore {
  roles: Role[];
  setRoles: (roles: Role[]) => void;
  isLoading: boolean;
  editRole: Role | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setEditRole: (editRole: Role | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  refreshRoles: (accessToken: string) => Promise<void>;
  createRole: (accessToken: string, role: Role) => Promise<void>;
  updateRole: (accessToken: string, roleId: string, role: Role) => Promise<void>;
  deleteRole: (accessToken: string, roleId: string) => Promise<void>;
}

export const useRoleStore = createStore<RoleStore>((set, get) => ({
  roles: [],
  isLoading: true,
  editRole: null,
  searchTerm: "",
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setRoles: (roles: Role[]) => set({ roles }),
  setEditRole: (editRole: Role | null) => set({ editRole }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  refreshRoles: async (accessToken: string) => {
    try {
      set({ isLoading: true, roles: [] });
      const roles = await getAll(accessToken);
      set({ roles, isLoading: false });
    } catch (error) {
      console.error("Error al actualizar la lista de roles:", error);
      set({ isLoading: false });
      toast.error("Error", {
        description: "No se pudo cargar la lista de roles. Por favor, intente nuevamente.",
      });
    }
  },
  createRole: async (accessToken: string, role: Role) => {
    try {
      set({ isLoading: true });
      const newRole = await create(accessToken, role);
      set(state => ({ roles: [...state.roles, newRole] }));
      set({ isLoading: false });
      toast.success("Rol creado exitosamente");
    } catch (error) {
      console.error("Error al crear el rol:", error);
      set({ isLoading: false });
      toast.error("Error", {
        description: "No se pudo crear el rol. Por favor, intente nuevamente.",
      });
    }
  },
  updateRole: async (accessToken: string, roleId: string, role: Role) => {
    try {
      set({ isLoading: true });
      const updatedRole = await update(accessToken, roleId, role);
      console.log("updatedRole", updatedRole);

      set({ isLoading: false, editRole: null });
      get().refreshRoles(accessToken);
      toast.success("Rol actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar el rol:", error);
      set({ isLoading: false });
      toast.error("Error", {
        description: "No se pudo actualizar el rol. Por favor, intente nuevamente.",
      });
    }
  },
  deleteRole: async (accessToken: string, roleId: string) => {
    try {
      set({ isLoading: true });
      await remove(accessToken, roleId);
      set(state => ({
        roles: state.roles.filter(r => r.id !== roleId),
      }));
      set({ isLoading: false });
      toast.success("Rol eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar el rol:", error);
      set({ isLoading: false });
      toast.error("Error", {
        description: "No se pudo eliminar el rol. Por favor, intente nuevamente.",
      });
    }
  },
}));
