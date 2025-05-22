import { create } from "zustand";

export type Theme = "dark" | "light" | "system";

type ThemeStore = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const useThemeStore = create<ThemeStore>(set => ({
  theme: "system",
  setTheme: (theme: Theme) => set({ theme }),
}));

export const useTheme = useThemeStore;
