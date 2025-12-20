import { toast } from "sonner";
import { create } from "zustand";
import { deleteDTE, getDTEById, getDTEs } from "../services";
import { BulkUploadResponse, DTE } from "../types";

interface DTEStore {
  dte: DTE;
  dtes: DTE[];
  loading: boolean;
  error: string | null;
  fetchDTE: (accessToken: string, clientId: string) => Promise<void>;
  fetchDTEById: (
    accessToken: string,
    clientId: string,
    dteId: string
  ) => Promise<void>;
  deleteDTE: (
    accessToken: string,
    clientId: string,
    dteId: string
  ) => Promise<void>;
  clearDTE: () => void;
  bulkUploadErrors: BulkUploadResponse | null;
  setBulkUploadErrors: (errors: BulkUploadResponse) => void;
  clearBulkUploadErrors: () => void;
}

export const useDTEStore = create<DTEStore>((set, get) => ({
  dte: {} as DTE,
  dtes: [],
  loading: false,
  error: null,
  bulkUploadErrors: null,
  fetchDTE: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null, dte: {} as DTE });
    try {
      const response = await getDTEs(accessToken, clientId);
      const dtesData = response.data || response.dtes || response || [];
      set({ dtes: Array.isArray(dtesData) ? dtesData : [] });
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Error desconocido al obtener los DTEs";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  deleteDTE: async (accessToken: string, clientId: string, dteId: string) => {
    set({ loading: true, error: null });
    try {
      set({ loading: true });
      await deleteDTE(accessToken, clientId, dteId);
      set({ loading: false });
      toast.success("DTE eliminado exitosamente");
    } catch (error: any) {
      set({ error: error.message });
      toast.error("Error al eliminar el DTE");
    } finally {
      get().fetchDTE(accessToken, clientId);
    }
  },
  fetchDTEById: async (
    accessToken: string,
    clientId: string,
    dteId: string
  ) => {
    set({ loading: true, error: null });
    try {
      set({ dte: {} as DTE, loading: true });
      const response = await getDTEById(accessToken, clientId, dteId);
      set({ dte: response });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  clearDTE: () => {
    set({ dte: {} as DTE });
  },
  setBulkUploadErrors: (errors: BulkUploadResponse) => {
    set({ bulkUploadErrors: errors });
  },
  clearBulkUploadErrors: () => {
    set({ bulkUploadErrors: null });
  },
}));
