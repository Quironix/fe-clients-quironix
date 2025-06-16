import { create } from "zustand";
import {
  createPayment,
  deletePayment,
  getBankInformation,
  getPaymentById,
  getPayments,
  updatePayment,
} from "../services";
import { BulkUploadResponse, Payments } from "../types";

interface PaymentStore {
  payment: Payments;
  payments: Payments[];
  loading: boolean;
  error: string | null;
  fetchPayments: (
    accessToken: string,
    clientId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  fetchPaymentById: (
    accessToken: string,
    clientId: string,
    dteId: string
  ) => Promise<void>;
  deletePayment: (
    accessToken: string,
    clientId: string,
    dteId: string
  ) => Promise<void>;
  bulkUploadErrors: BulkUploadResponse | null;
  setBulkUploadErrors: (errors: BulkUploadResponse) => void;
  clearBulkUploadErrors: () => void;
  clearPayment: () => void;
  fetchBankInformation: (
    accessToken: string,
    clientId: string
  ) => Promise<void>;
  bankInformation: any;
  createPayment: (
    accessToken: string,
    clientId: string,
    payment: Payments
  ) => Promise<void>;
  responseSuccess: any;
  updatePayment: (
    accessToken: string,
    clientId: string,
    payment: Payments
  ) => Promise<void>;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payment: {} as Payments,
  payments: [] as Payments[],
  loading: true,
  error: null,
  bulkUploadErrors: null,
  bankInformation: [],
  responseSuccess: {} as any,
  createPayment: async (
    accessToken: string,
    clientId: string,
    payment: Payments
  ) => {
    set({ loading: true, error: null, payments: [] });
    try {
      const response = await createPayment(accessToken, clientId, payment);
      set({ responseSuccess: response });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      get().fetchPayments(accessToken, clientId);
      set({ loading: false });
    }
  },
  updatePayment: async (
    accessToken: string,
    clientId: string,
    payment: Payments
  ) => {
    set({ loading: true, error: null, payments: [] });
    try {
      const response = await updatePayment(accessToken, clientId, payment);
      set({ responseSuccess: response });
      get().fetchPayments(accessToken, clientId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  fetchPayments: async (
    accessToken: string,
    clientId: string,
    startDate?: string,
    endDate?: string
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await getPayments(
        accessToken,
        clientId,
        startDate || "",
        endDate || ""
      );
      const paymentsData = response.data || response.payments || response || [];
      set({ payments: Array.isArray(paymentsData) ? paymentsData : [] });
    } catch (error: any) {
      console.error("Error en fetchPayments:", error);
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Error desconocido al obtener los DTEs";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  deletePayment: async (accessToken: string, clientId: string, id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await deletePayment(accessToken, clientId, id);
      debugger;
      set({ responseSuccess: response });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
      get().fetchPayments(accessToken, clientId);
    }
  },
  fetchPaymentById: async (
    accessToken: string,
    clientId: string,
    dteId: string
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await getPaymentById(accessToken, clientId, dteId);

      if (response && response.data) {
        // Asegurarse de que los valores numéricos sean números
        const formattedPayment = {
          ...response.data,
          amount: Number(response.data.amount) || 0,
          balance: Number(response.data.balance) || 0,
        };
        set({ payment: formattedPayment });
      } else {
        set({
          error: "No se encontró el pago o formato de respuesta inválido",
        });
      }
    } catch (error: any) {
      set({ error: `Error al cargar el pago: ${error.message}` });
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
  fetchBankInformation: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getBankInformation(accessToken, clientId);
      set({ bankInformation: response });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  clearPayment: () => {
    set({ payment: {} as Payments });
  },
}));
