import { create } from "zustand";
import { createDebtor, getDebtors, updateDebtor } from "../services";

interface DebtorsStore {
  debtors: any[];
  loading: boolean;
  error: string | null;
  fetchDebtors: (accessToken: string, clientId: string) => Promise<void>;
  createDebtor: (
    debtor: any,
    accessToken: string,
    clientId: string
  ) => Promise<void>;
  updateDebtor: (
    debtor: any,
    accessToken: string,
    clientId: string
  ) => Promise<void>;
}

export const useDebtorsStore = create<DebtorsStore>((set, get) => ({
  debtors: [],
  loading: false,
  error: null,
  fetchDebtors: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null });
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
  createDebtor: async (debtor: any, accessToken: string, clientId: string) => {
    set({ loading: true, error: null });
    try {
      await createDebtor(debtor, accessToken, clientId);
      get().fetchDebtors(accessToken, clientId);
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
  updateDebtor: async (debtor: any, accessToken: string, clientId: string) => {
    set({ loading: true, error: null });
    try {
      await updateDebtor(debtor, accessToken, clientId);
      get().fetchDebtors(accessToken, clientId);
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
}));
