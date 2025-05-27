import { create } from "zustand";
import { UserProfile } from "../types";
import { sendCode, signContract, verifyCode } from "../services";

interface OnboardingData {
  // Step 1: Información básica
  name: string;
  country_id: string;
  plan_id: string;
  type: "FACTORING";

  // Step 2: Información de contacto
  contacts: {
    first_name: string;
    last_name: string;
    email: string;
  };

  // Step 3: Documentos
  terms_and_conditions?: string;
  contract?: string;
}

interface OnboardingStore {
  // Estado
  currentStep: number;
  data: OnboardingData;
  loading: boolean;
  error: string | null;
  profile: UserProfile | null;

  // Acciones
  setCurrentStep: (step: number) => void;
  updateData: (data: Partial<OnboardingData>) => void;
  resetStore: () => void;
  submitOnboarding: (accessToken: string) => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  sendCode: (accessToken: string, clientId: string) => Promise<boolean>;
  signContract: (accessToken: string, clientId: string) => Promise<boolean>;
}

const initialData: OnboardingData = {
  name: "",
  country_id: "",
  plan_id: "",
  type: "FACTORING",
  contacts: {
    first_name: "",
    last_name: "",
    email: "",
  },
};

const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  currentStep: 1,
  data: initialData,
  loading: false,
  error: null,
  profile: null,

  setCurrentStep: (step) => set({ currentStep: step }),

  updateData: (newData) =>
    set((state) => ({
      data: {
        ...state.data,
        ...newData,
      },
    })),

  resetStore: () =>
    set({
      currentStep: 1,
      data: initialData,
      loading: false,
      error: null,
    }),

  sendCode: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await sendCode(accessToken, clientId);

      if (response?.error) {
        set({ loading: false, error: response.error });
        return false;
      }

      set({ loading: false });
      return true;
    } catch (error) {
      console.error("Error al enviar código:", error);
      set({ loading: false, error: "Error al enviar el código" });
      return false;
    }
  },
  verifyCode: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await verifyCode(accessToken, clientId);

      if (response?.error) {
        set({ loading: false, error: response.error });
        return false;
      }

      set({ loading: false });
      return true;
    } catch (error) {
      console.error("Error al verificar código:", error);
      set({ loading: false, error: "Error al verificar el código" });
      return false;
    }
  },

  submitOnboarding: async (accessToken) => {
    set({ loading: true, error: null });
    try {
      //TODO: CRear servicio para guardar los datos del onboarding

      set({ loading: false });
      get().resetStore();
    } catch (error) {
      console.error("Error en el onboarding:", error);
      set({
        error: "Error al procesar el onboarding",
        loading: false,
      });
    }
  },

  signContract: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await signContract(accessToken, clientId);

      if (response?.error) {
        set({ loading: false, error: response.error });
        return false;
      }

      set({ loading: false });
      return true;
    } catch (error) {
      console.error("Error al firmar el contrato:", error);
      set({ loading: false, error: "Error al firmar el contrato" });
      return false;
    }
  },

  setProfile: (profile) => set({ profile }),

  updateProfile: (data) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...data } : null,
    })),

  isLoading: false,

  setIsLoading: (isLoading) => set({ isLoading }),
}));

export default useOnboardingStore;
