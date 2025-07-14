import { toast } from "sonner";
import { create } from "zustand";
import { deletePayment, getPaymentById } from "../services";
import { BulkUploadResponse, Payments } from "../types";

interface PaymentState {
  // Solo mantener funciones que no están relacionadas con paginación
  // El estado de paginación será manejado por el hook usePayments
  
  // Estado individual de Payment
  payment: Payments;
  
  // Funciones para bulk upload
  uploadProgress: number;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  bulkUploadErrors: BulkUploadResponse | null;
  
  // Funciones existentes que no interfieren con paginación
  fetchPaymentById: (
    accessToken: string,
    clientId: string,
    paymentId: string
  ) => Promise<void>;
  deletePayment: (
    accessToken: string,
    clientId: string,
    paymentId: string
  ) => Promise<void>;
  
  // Funciones para bulk upload
  setUploadProgress: (progress: number) => void;
  setUploadStatus: (status: 'idle' | 'uploading' | 'success' | 'error') => void;
  setBulkUploadErrors: (errors: BulkUploadResponse) => void;
  clearBulkUploadErrors: () => void;
  resetUpload: () => void;
  clearPayment: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payment: {} as Payments,
  uploadProgress: 0,
  uploadStatus: 'idle',
  bulkUploadErrors: null,
  
  fetchPaymentById: async (
    accessToken: string,
    clientId: string,
    paymentId: string
  ) => {
    try {
      set({ payment: {} as Payments });
      const response = await getPaymentById(accessToken, clientId, paymentId);
      
      if (response && response.data) {
        // Asegurarse de que los valores numéricos sean números
        const formattedPayment = {
          ...response.data,
          amount: Number(response.data.amount) || 0,
          balance: Number(response.data.balance) || 0,
        };
        set({ payment: formattedPayment });
      } else {
        toast.error("No se encontró el pago o formato de respuesta inválido");
      }
    } catch (error: any) {
      toast.error("Error al cargar el pago");
      console.error("Error fetching payment:", error);
    }
  },
  
  deletePayment: async (accessToken: string, clientId: string, paymentId: string) => {
    try {
      await deletePayment(accessToken, clientId, paymentId);
      toast.success("Pago eliminado exitosamente");
    } catch (error: any) {
      toast.error("Error al eliminar el pago");
      console.error("Error deleting payment:", error);
    }
  },
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setUploadStatus: (status) => set({ uploadStatus: status }),
  setBulkUploadErrors: (errors) => set({ bulkUploadErrors: errors }),
  clearBulkUploadErrors: () => set({ bulkUploadErrors: null }),
  resetUpload: () => set({ uploadProgress: 0, uploadStatus: 'idle' }),
  clearPayment: () => set({ payment: {} as Payments }),
}));
