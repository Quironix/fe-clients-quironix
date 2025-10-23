import { create as createStore } from "zustand";
import { getAll, create } from "../services";
import { toast } from "sonner";

interface CollectorsStore {
  data: any[];
  setData: (data: any[]) => void;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  refreshData: (accessToken: string, clientId: string) => Promise<void>;
  createData: (
    accessToken: string,
    data: any,
    clientId: string
  ) => Promise<void>;
}

export const useCollectorsStore = createStore<CollectorsStore>((set, get) => ({
  data: [],
  isLoading: true,
  searchTerm: "",
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setData: (data: any[]) => set({ data }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  refreshData: async (accessToken: string, clientId: string) => {
    try {
      set({ isLoading: true, data: [] });
      const data = await getAll(accessToken, clientId);
      set({ data, isLoading: false });
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      set({ isLoading: false });
      toast.error("Error", {
        description: "No se pudieron cargar los datos. Por favor, intente nuevamente.",
      });
    }
  },
  createData: async (accessToken: string, data: any, clientId: string) => {
    try {
      set({ isLoading: true });
      const newData = await create(accessToken, data, clientId);
      set((state) => ({ data: [...state.data, newData] }));
      set({ isLoading: false });
      toast.success("Dato creado exitosamente");
    } catch (error) {
      console.error("Error al crear el dato:", error);
      set({ isLoading: false });
      toast.error("Error", {
        description: "No se pudo crear el dato. Por favor, intente nuevamente.",
      });
    }
  },
}));
