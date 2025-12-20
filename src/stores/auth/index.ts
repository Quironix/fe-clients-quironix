import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AuthStore {
  user: any;
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  session: any;
}

// const useAuthStore = create<AuthStore>(set => ({
//   user: null,
//   session: null,
//   setUser: (user: User | null) => set({ user }),
//   setSession: (session: Session | null) => set({ session }),
// }));

const useAuthStore = create<AuthStore>()(set => ({
  user: null,
  session: null,
  setUser: (user: any | null) => set({ user }),
  setSession: (session: any) => set({ session }),
}));

export const useAuth = useAuthStore;
