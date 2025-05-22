import { create as createStore } from "zustand";
import { getAll, create, update, remove } from "../services";
import { toast } from "sonner";
import { Client } from "../services/types";
import { ClientUpdate, ClientCreate } from "../services/dto";

interface ClientStore {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  isLoading: boolean;
  editClient: Client | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setEditClient: (editClient: Client | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  refreshClients: (accessToken: string) => Promise<void>;
  createClient: (accessToken: string, client: ClientCreate) => Promise<void>;
  updateClient: (accessToken: string, clientId: string, client: ClientUpdate) => Promise<void>;
  deleteClient: (accessToken: string, clientId: string) => Promise<void>;
}

export const useClientStore = createStore<ClientStore>((set, get) => ({
  clients: [],
  isLoading: true,
  editClient: null,
  searchTerm: "",
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setClients: (clients: Client[]) => set({ clients }),
  setEditClient: (editClient: Client | null) => set({ editClient }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  refreshClients: async (accessToken: string) => {
    try {
      set({ isLoading: true, clients: [] });
      const clients = await getAll(accessToken);
      set({ clients, isLoading: false });
    } catch (error) {
      console.error("Error al actualizar la lista de clientes:", error);
      set({ isLoading: false });
      toast.error("Error", {
        description: "No se pudo cargar la lista de clientes. Por favor, intente nuevamente.",
      });
    }
  },
  createClient: async (accessToken: string, client: ClientCreate) => {
    try {
      set({ isLoading: true });
      await create(accessToken, client);
      toast.success("Cliente creado exitosamente");
    } catch (error) {
      console.error("Error al crear el cliente:", error);
      toast.error("Error", {
        description: "No se pudo crear el cliente. Por favor, intente nuevamente.",
      });
    } finally {
      set({ isLoading: false });
      get().refreshClients(accessToken);
    }
  },
  updateClient: async (accessToken: string, clientId: string, client: ClientUpdate) => {
    try {
      set({ isLoading: true });
      await update(accessToken, clientId, client);
      set({ isLoading: false, editClient: null });
      toast.success("Cliente actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      set({ isLoading: false });
      toast.error("Error", {
        description: "No se pudo actualizar el cliente. Por favor, intente nuevamente.",
      });
    } finally {
      set({ isLoading: false });
      get().refreshClients(accessToken);
    }
  },
  deleteClient: async (accessToken: string, clientId: string) => {
    try {
      set({ isLoading: true });
      await remove(accessToken, clientId);
      toast.success("Cliente eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el cliente. Por favor, intente nuevamente.",
      });
    } finally {
      set({ isLoading: false });
      get().refreshClients(accessToken);
    }
  },
}));
