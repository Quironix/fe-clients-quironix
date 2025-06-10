import { toast } from "sonner";
import { create as createStore } from "zustand";
import { BulkUploadResponse } from "../../../debtors/types";
import { create, getAll, remove, update } from "../services";
import { Movement, MovementRequest } from "../services/types";

interface MovementStore {
  movements: Movement[];
  setMovements: (movements: Movement[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isCreateDialogLoading: boolean;
  setIsCreateDialogLoading: (isCreateDialogLoading: boolean) => void;
  editMovement: MovementRequest | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setEditMovement: (editMovement: MovementRequest | null) => void;
  getAllMovements: (accessToken: string, clientId: string) => Promise<void>;

  deleteMovement: (
    accessToken: string,
    bankInfoId: string,
    clientId: string
  ) => Promise<void>;
  createMovement: (
    accessToken: string,
    bankMovement: MovementRequest,
    clientId: string
  ) => Promise<void>;
  updateMovement: (
    accessToken: string,
    bankMovementId: string,
    bankMovement: MovementRequest,
    clientId: string
  ) => Promise<void>;
  bulkUploadErrors: BulkUploadResponse | null;
  setBulkUploadErrors: (errors: BulkUploadResponse) => void;
  clearBulkUploadErrors: () => void;
}

export const useMovementStore = createStore<MovementStore>((set, get) => ({
  movements: [],
  isLoading: true,
  editMovement: null,
  searchTerm: "",
  isCreateDialogLoading: false,
  setIsCreateDialogLoading: (isCreateDialogLoading: boolean) =>
    set({ isCreateDialogLoading }),
  setMovements: (movements: Movement[]) => set({ movements }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setEditMovement: (editMovement: MovementRequest | null) =>
    set({ editMovement }),
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  getAllMovements: async (accessToken: string, clientId: string) => {
    try {
      set({ isLoading: true, movements: [] });
      const movements = await getAll(accessToken, clientId);
      set({ movements, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error("Error", {
        description:
          "No se pudo cargar la lista de movimientos. Por favor, intente nuevamente.",
      });
    }
  },

  deleteMovement: async (
    accessToken: string,
    movementId: string,
    clientId: string
  ) => {
    try {
      set({ isLoading: true });
      await remove(accessToken, movementId, clientId);
      set({ isLoading: false });
      toast.success("Movimiento eliminado exitosamente");
    } catch (error) {
      set({ isLoading: false });
      toast.error("Error", {
        description:
          "No se pudo eliminar el movimiento. Por favor, intente nuevamente.",
      });
    } finally {
      get().getAllMovements(accessToken, clientId);
    }
  },
  createMovement: async (
    accessToken: string,
    movement: MovementRequest,
    clientId: string
  ) => {
    try {
      set({ isCreateDialogLoading: true });
      const newMovement = await create(accessToken, movement, clientId);
      set((state) => ({
        movements: [...state.movements, newMovement],
      }));
      set({ isCreateDialogLoading: false });
      toast.success("Movimiento creado exitosamente");
    } catch (error) {
      set({ isCreateDialogLoading: false });
      toast.error("Error", {
        description:
          "No se pudo crear el movimiento. Por favor, intente nuevamente.",
      });
    }
  },
  updateMovement: async (
    accessToken: string,
    movementId: string,
    movement: MovementRequest,
    clientId: string
  ) => {
    try {
      set({ isLoading: true });
      await update(accessToken, movementId, movement, clientId);

      set({ isLoading: false, editMovement: null });
      get().getAllMovements(accessToken, clientId);
      toast.success("Movimiento actualizado exitosamente");
    } catch (error) {
      set({ isLoading: false });
      toast.error("Error", {
        description:
          "No se pudo actualizar el movimiento. Por favor, intente nuevamente.",
      });
    }
  },
  bulkUploadErrors: null,
  setBulkUploadErrors: (errors: BulkUploadResponse) =>
    set({ bulkUploadErrors: errors }),
  clearBulkUploadErrors: () => set({ bulkUploadErrors: null }),
}));
