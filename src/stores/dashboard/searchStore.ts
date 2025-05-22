import { create } from "zustand";

interface SearchStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const useSearchStore = create<SearchStore>(set => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

export const useSearch = useSearchStore;
