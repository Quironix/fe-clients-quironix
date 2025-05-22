import { create } from "zustand";

interface AgentPlaygroundStore {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAgentPlaygroundStore = create<AgentPlaygroundStore>(set => ({
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));
