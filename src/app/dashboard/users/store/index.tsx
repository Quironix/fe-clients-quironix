import { create } from "zustand";
import { create as createUser, deleteUser, getAll, update } from "../services";
import { User } from "../services/types";
interface UserStore {
  users: User[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchUsers: (accessToken: string, clientId: string) => Promise<void>;
  addUser: (
    user: Omit<User, "id" | "created_at" | "updated_at">,
    accessToken: string,
    clientId: string
  ) => Promise<void>;
  updateUser: (
    id: string,
    user: Partial<User>,
    accessToken: string,
    clientId: string
  ) => Promise<void>;
  deleteUser: (
    id: string,
    accessToken: string,
    clientId: string
  ) => Promise<void>;
  // reinviteUser: (
  //   email: string,
  //   accessToken: string,
  //   clientId: string
  // ) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  loading: true,
  error: null,
  searchTerm: "",

  setSearchTerm: (term) => set({ searchTerm: term }),

  fetchUsers: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getAll(accessToken, clientId);
      // Asegurar que users siempre sea un array
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response && Array.isArray(response.data)) {
        users = response.data;
      } else if (response && Array.isArray(response.users)) {
        users = response.users;
      }
      set({ users, loading: false });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      set({ error: "Error al obtener usuarios", loading: false, users: [] });
    }
  },

  addUser: async (user: User, accessToken: string, clientId: string) => {
    set({ loading: true, error: null, users: [] });
    try {
      await createUser(user, accessToken, clientId);
    } catch (error) {
      console.error("Error al crear usuario:", error);
      set({ error: "Error al crear usuario", loading: false });
    } finally {
      get().fetchUsers(accessToken, clientId);
    }
  },

  updateUser: async (
    id: string,
    user: Partial<User>,
    accessToken: string,
    clientId: string
  ) => {
    set({ loading: true, error: null });
    try {
      await update(id, user, accessToken, clientId);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      set({ error: "Error al actualizar usuario", loading: false });
    } finally {
      get().fetchUsers(accessToken, clientId);
    }
  },

  deleteUser: async (id: string, accessToken: string, clientId: string) => {
    set({ loading: true, error: null });
    try {
      await deleteUser(id, accessToken, clientId);
      get().fetchUsers(accessToken, clientId);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      set({ error: "Error al eliminar usuario", loading: false });
    }
  },

  // reinviteUser: async (email: string, accessToken: string) => {
  //   set({ loading: true, error: null });
  //   try {
  //     await reinviteUser(email, accessToken);
  //   } catch (error) {
  //     console.error("Error al reinvitar usuario:", error);
  //     set({ error: "Error al reinvitar usuario", loading: false });
  //   }
  // },
}));
