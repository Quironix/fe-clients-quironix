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

const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      session: null,
      setUser: (user: any | null) => set({ user }),
      setSession: (session: any) => set({ session }),
    }),
    {
      name: "auth-storage", // nombre único para el almacenamiento
      storage: createJSONStorage(() => localStorage), // usa localStorage por defecto
      // Puedes especificar qué partes del estado deben persistir
      partialize: state => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

export const useAuth = useAuthStore;
