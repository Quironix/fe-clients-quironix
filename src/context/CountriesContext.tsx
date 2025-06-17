import { Country } from "@/app/dashboard/settings/types";
import { getCountries } from "@/services/global";
import { create as createStore } from "zustand";

interface CountriesStore {
  countries: Country[];
  setCountries: (countries: Country[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  getAllCountries: (accessToken: string) => Promise<void>;
}

export const useCountriesStore = createStore<CountriesStore>((set, get) => ({
  countries: [],
  isLoading: false,
  setCountries: (countries: Country[]) => set({ countries }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  getAllCountries: async (accessToken: string) => {
    set({ isLoading: true });
    const countries = await getCountries(accessToken);
    set({ countries, isLoading: false });
  },
}));
