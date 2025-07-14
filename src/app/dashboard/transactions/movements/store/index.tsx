import { toast } from "sonner";
import { create as createStore } from "zustand";
import { remove, create as createMovement, update } from "../services";
import { MovementRequest } from "../services/types";

interface MovementState {
  // Solo mantener funciones que no están relacionadas con paginación
  // El estado de paginación será manejado por el hook useMovements
  
  // Funciones para bulk upload
  uploadProgress: number;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  
  // Funciones CRUD individuales
  createMovement: (
    accessToken: string,
    movement: MovementRequest,
    clientId: string
  ) => Promise<void>;
  updateMovement: (
    accessToken: string,
    movementId: string,
    movement: MovementRequest,
    clientId: string
  ) => Promise<void>;
  deleteMovement: (
    accessToken: string,
    movementId: string,
    clientId: string
  ) => Promise<void>;
  
  // Funciones para bulk upload
  setUploadProgress: (progress: number) => void;
  setUploadStatus: (status: 'idle' | 'uploading' | 'success' | 'error') => void;
  resetUpload: () => void;
}

export const useMovementStore = createStore<MovementState>((set) => ({
  uploadProgress: 0,
  uploadStatus: 'idle',
  
  createMovement: async (
    accessToken: string,
    movement: MovementRequest,
    clientId: string
  ) => {
    try {
      await createMovement(accessToken, movement, clientId);
      toast.success("Movimiento creado exitosamente");
    } catch (error: any) {
      toast.error("Error al crear el movimiento");
      console.error("Error creating movement:", error);
      throw error;
    }
  },
  
  updateMovement: async (
    accessToken: string,
    movementId: string,
    movement: MovementRequest,
    clientId: string
  ) => {
    try {
      await update(accessToken, movementId, movement, clientId);
      toast.success("Movimiento actualizado exitosamente");
    } catch (error: any) {
      toast.error("Error al actualizar el movimiento");
      console.error("Error updating movement:", error);
      throw error;
    }
  },
  
  deleteMovement: async (
    accessToken: string,
    movementId: string,
    clientId: string
  ) => {
    try {
      await remove(accessToken, movementId, clientId);
      toast.success("Movimiento eliminado exitosamente");
    } catch (error: any) {
      toast.error("Error al eliminar el movimiento");
      console.error("Error deleting movement:", error);
      throw error;
    }
  },
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setUploadStatus: (status) => set({ uploadStatus: status }),
  resetUpload: () => set({ uploadProgress: 0, uploadStatus: 'idle' }),
}));
