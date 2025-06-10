import { create } from "zustand";
import { getDTEById, getDTEs } from "../services";
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
      console.error("Error en fetchDTEs:", error);
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
      // Simulación de eliminación
      console.log("Eliminando DTE:", dteId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  fetchDTEById: async (
    accessToken: string,
    clientId: string,
    dteId: string
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await getDTEById(accessToken, clientId, dteId);
      set({ dte: response.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  setBulkUploadErrors: (errors: BulkUploadResponse) => {
    set({ bulkUploadErrors: errors });
  },
  clearBulkUploadErrors: () => {
    set({ bulkUploadErrors: null });
  },
}));
