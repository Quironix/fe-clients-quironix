import { create } from "zustand";
import {
  createPayment,
  deletePayment,
  getBankInformation,
  getPaymentById,
  getPayments,
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
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payment: {} as Payments,
  payments: [] as Payments[],
  loading: false,
  error: null,
  bulkUploadErrors: null,
  bankInformation: [],
  responseSuccess: {} as any,
  createPayment: async (
    accessToken: string,
    clientId: string,
    payment: Payments
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await createPayment(accessToken, clientId, payment);
      set({ responseSuccess: response });
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
    set({ loading: true, error: null, payment: {} as Payments });
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
      // Simulación de eliminación
      console.log("Eliminando pago:", id);
      const response = await deletePayment(accessToken, clientId, id);
      set({ responseSuccess: response });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
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
      set({ payment: response.data });
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
}));
