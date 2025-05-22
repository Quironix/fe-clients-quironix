import { create } from "zustand";

export interface AuthLayoutStore {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const useAuthLayoutStore = create<AuthLayoutStore>(set => ({
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));

export const useAuthLayout = useAuthLayoutStore;
