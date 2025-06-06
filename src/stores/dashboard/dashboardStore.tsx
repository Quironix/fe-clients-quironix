// import { getCountries } from "@/app/dashboard/clients/services";
import { getCountries } from "@/services/global";
import { create } from "zustand";

interface Country {
  id: string;
  name: string;
  // Agrega aquí otros campos que tenga tu país
}

interface DashboardStore {
  defaultOpen: boolean;
  setDefaultOpen: (defaultOpen: boolean) => void;
  countries: Country[];
  setCountries: (countries: Country[]) => void;
  refreshCountries: (accessToken: string) => void;
}

const useDashboardStore = create<DashboardStore>((set) => ({
  defaultOpen: true,
  setDefaultOpen: (defaultOpen: boolean) => set({ defaultOpen }),
  countries: [],
  setCountries: (countries: Country[]) => set({ countries }),
  refreshCountries: (accessToken: string) => {
    getCountries(accessToken).then((countries) => set({ countries }));
  },
}));

export const useDashboard = useDashboardStore;
