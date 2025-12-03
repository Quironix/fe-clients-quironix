import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAll } from "../services";
import { KPI, KPIFilters, KPIType } from "../services/types";
import { DEFAULT_PREFERENCES, KPIPreferences, LayoutMode, ViewMode } from "../types/preferences";

interface KPIStore {
  kpis: KPI[];
  filteredKpis: KPI[];
  loading: boolean;
  error: string | null;
  filters: KPIFilters;
  preferences: KPIPreferences;
  setFilters: (filters: KPIFilters) => void;
  setSearchTerm: (term: string) => void;
  setTypeFilter: (type: KPIType | "all") => void;
  setDateRange: (from?: Date, to?: Date) => void;
  fetchKPIs: (accessToken: string, clientId: string) => Promise<void>;
  applyFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setKPIOrder: (order: string[]) => void;
  setGridColumns: (columns: number) => void;
  toggleShowCategories: () => void;
  toggleShowCharts: () => void;
  toggleShowCriticalOnly: () => void;
  resetPreferences: () => void;
}

export const useKPIStore = create<KPIStore>()(
  persist(
    (set, get) => ({
      kpis: [],
      filteredKpis: [],
      loading: true,
      error: null,
      filters: {
        type: "all",
        searchTerm: "",
      },
      preferences: DEFAULT_PREFERENCES,

  setFilters: (filters) => {
    set({ filters });
    get().applyFilters();
  },

  setSearchTerm: (term) => {
    set((state) => ({
      filters: { ...state.filters, searchTerm: term },
    }));
    get().applyFilters();
  },

  setTypeFilter: (type) => {
    set((state) => ({
      filters: { ...state.filters, type },
    }));
    get().applyFilters();
  },

  setDateRange: (from?: Date, to?: Date) => {
    set((state) => ({
      filters: {
        ...state.filters,
        dateRange: from || to ? {
          from: from?.toISOString() || "",
          to: to?.toISOString() || "",
        } : undefined,
      },
    }));
    const { fetchKPIs } = get();
    const state = get();
    if (state.kpis.length > 0) {
      get().applyFilters();
    }
  },

  fetchKPIs: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const response = await getAll(accessToken, clientId, {
        from: filters.dateRange?.from,
        to: filters.dateRange?.to,
      });
      set({ kpis: response.data, filteredKpis: response.data, loading: false });
      get().applyFilters();
    } catch (error) {
      console.error("Error al obtener KPIs:", error);
      set({
        error: "Error al obtener KPIs",
        loading: false,
        kpis: [],
        filteredKpis: [],
      });
    }
  },

  applyFilters: () => {
    const { kpis, filters, preferences } = get();
    let filtered = [...kpis];

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((kpi) => kpi.type === filters.type);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (kpi) =>
          kpi.name.toLowerCase().includes(term) ||
          kpi.definition.toLowerCase().includes(term)
      );
    }

    if (preferences.showCriticalOnly) {
      filtered = filtered.filter((kpi) => kpi.status === "error" || kpi.status === "warning");
    }

    if (preferences.kpiOrder.length > 0) {
      filtered.sort((a, b) => {
        const indexA = preferences.kpiOrder.indexOf(a.id);
        const indexB = preferences.kpiOrder.indexOf(b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    set({ filteredKpis: filtered });
  },

  setViewMode: (mode) => {
    set((state) => ({
      preferences: { ...state.preferences, viewMode: mode },
    }));
  },

  setLayoutMode: (mode) => {
    set((state) => ({
      preferences: { ...state.preferences, layoutMode: mode },
    }));
  },

  setKPIOrder: (order) => {
    set((state) => ({
      preferences: { ...state.preferences, kpiOrder: order },
    }));
    get().applyFilters();
  },

  setGridColumns: (columns) => {
    set((state) => ({
      preferences: { ...state.preferences, gridColumns: columns },
    }));
  },

  toggleShowCategories: () => {
    set((state) => ({
      preferences: { ...state.preferences, showCategories: !state.preferences.showCategories },
    }));
  },

  toggleShowCharts: () => {
    set((state) => ({
      preferences: { ...state.preferences, showCharts: !state.preferences.showCharts },
    }));
  },

  toggleShowCriticalOnly: () => {
    set((state) => ({
      preferences: { ...state.preferences, showCriticalOnly: !state.preferences.showCriticalOnly },
    }));
    get().applyFilters();
  },

  resetPreferences: () => {
    set({ preferences: DEFAULT_PREFERENCES });
    get().applyFilters();
  },
}),
    {
      name: "kpi-preferences",
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);
