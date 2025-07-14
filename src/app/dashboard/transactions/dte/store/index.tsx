import { toast } from "sonner";
import { create } from "zustand";
import { deleteDTE, getDTEById } from "../services";
import { BulkUploadResponse, DTE } from "../types";

interface DTEState {
  // Solo mantener funciones que no están relacionadas con paginación
  // El estado de paginación será manejado por el hook useDTEs
  
  // Estado individual de DTE
  dte: DTE;
  
  // Funciones para bulk upload
  uploadProgress: number;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  bulkUploadErrors: BulkUploadResponse | null;
  
  // Funciones existentes que no interfieren con paginación
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
  
  // Funciones para bulk upload
  setUploadProgress: (progress: number) => void;
  setUploadStatus: (status: 'idle' | 'uploading' | 'success' | 'error') => void;
  setBulkUploadErrors: (errors: BulkUploadResponse) => void;
  clearBulkUploadErrors: () => void;
  resetUpload: () => void;
}

export const useDTEStore = create<DTEState>((set) => ({
  dte: {} as DTE,
  uploadProgress: 0,
  uploadStatus: 'idle',
  bulkUploadErrors: null,
  
  fetchDTEById: async (
    accessToken: string,
    clientId: string,
    dteId: string
  ) => {
    try {
      set({ dte: {} as DTE });
      const response = await getDTEById(accessToken, clientId, dteId);
      set({ dte: response });
    } catch (error: any) {
      toast.error("Error al cargar el DTE");
      console.error("Error fetching DTE:", error);
    }
  },
  
  deleteDTE: async (accessToken: string, clientId: string, dteId: string) => {
    try {
      await deleteDTE(accessToken, clientId, dteId);
      toast.success("DTE eliminado exitosamente");
    } catch (error: any) {
      toast.error("Error al eliminar el DTE");
      console.error("Error deleting DTE:", error);
    }
  },
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setUploadStatus: (status) => set({ uploadStatus: status }),
  setBulkUploadErrors: (errors) => set({ bulkUploadErrors: errors }),
  clearBulkUploadErrors: () => set({ bulkUploadErrors: null }),
  resetUpload: () => set({ uploadProgress: 0, uploadStatus: 'idle' }),
}));
