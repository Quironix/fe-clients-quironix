import { toast } from "sonner";
import { create } from "zustand";
import {
  createDebtor,
  deleteDebtor,
  getDebtorById,
  getDebtors,
  updateDebtor,
} from "../services";
import { BulkUploadResponse, Debtor } from "../types";

interface DebtorsStore {
  dataDebtor: Debtor;
  setDataDebtor: (debtor: any) => void;
  debtors: any[];
  loading: boolean;
  error: string | null;
  bulkUploadErrors: BulkUploadResponse | null;
  isFetchingDebtor: boolean;
  setIsFetchingDebtor: (isFetching: boolean) => void;
  fetchDebtors: (accessToken: string, clientId: string) => Promise<void>;
  fetchDebtorById: (
    accessToken: string,
    clientId: string,
    debtorId: string
  ) => Promise<void>;
  createDebtor: (
    accessToken: string,
    clientId: string,
    debtor: any
  ) => Promise<void>;
  updateDebtor: (
    accessToken: string,
    clientId: string,
    debtor: any
  ) => Promise<void>;
  deleteDebtor: (
    debtorId: string,
    accessToken: string,
    clientId: string
  ) => Promise<void>;
  setBulkUploadErrors: (errors: BulkUploadResponse) => void;
  clearBulkUploadErrors: () => void;
}

export const useDebtorsStore = create<DebtorsStore>((set, get) => ({
  dataDebtor: {} as Debtor,
  setDataDebtor: (debtor: Debtor) => set({ dataDebtor: debtor }),
  debtors: [],
  loading: false,
  error: null,
  isFetchingDebtor: false,
  setIsFetchingDebtor: (isFetching: boolean) =>
    set({ isFetchingDebtor: isFetching }),
  bulkUploadErrors: null,
  fetchDebtors: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null, dataDebtor: {} as Debtor });
    try {
      const response = await getDebtors(accessToken, clientId);
      const debtorsData = response.data || response.debtors || response || [];
      set({ debtors: Array.isArray(debtorsData) ? debtorsData : [] });
    } catch (error: any) {
      console.error("Error en fetchDebtors:", error);
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Error desconocido al obtener los deudores";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  fetchDebtorById: async (
    accessToken: string,
    clientId: string,
    debtorId: string
  ) => {
    set({
      loading: true,
      isFetchingDebtor: true,
      error: null,
      dataDebtor: {} as Debtor,
    });
    try {
      const response = await getDebtorById(accessToken, clientId, debtorId);

      if (!response?.id) {
        toast.error("Error al obtener el deudor");
        window.location.href = "/dashboard/debtors";
      }
      set({ dataDebtor: response });
    } catch (error: any) {
      console.error("Error en fetchDebtorById:", error);
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Error desconocido al obtener el deudor";
      set({ error: errorMessage });
    } finally {
      set({ loading: false, isFetchingDebtor: false });
    }
  },
  createDebtor: async (accessToken: string, clientId: string, debtor: any) => {
    set({ loading: true, error: null });
    try {
      const response = await createDebtor(accessToken, clientId, debtor);
      set({ dataDebtor: response });
      console.log("response", response);
      // get().fetchDebtors(accessToken, clientId);
    } catch (error: any) {
      console.error("Error en createDebtor:", error);
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Error desconocido al crear el deudor";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  updateDebtor: async (
    accessToken: string,
    clientId: string,
    debtor: string
  ) => {
    set({ loading: true, error: null });
    try {
      await updateDebtor(accessToken, clientId, debtor);
      // get().fetchDebtors(accessToken, clientId);
    } catch (error: any) {
      console.error("Error en updateDebtor:", error);
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Error desconocido al actualizar el deudor";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  deleteDebtor: async (
    accessToken: string,
    clientId: string,
    debtorId: string
  ) => {
    set({ loading: true, error: null, debtors: [] });
    try {
      await deleteDebtor(accessToken, clientId, debtorId);
      get().fetchDebtors(accessToken, clientId);
    } catch (error: any) {
      set({ error });
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
