import { create } from "zustand";
import { getAll } from "../services";
import { KPI, KPIFilters, KPIType } from "../services/types";

interface KPIStore {
  kpis: KPI[];
  filteredKpis: KPI[];
  loading: boolean;
  error: string | null;
  filters: KPIFilters;
  setFilters: (filters: KPIFilters) => void;
  setSearchTerm: (term: string) => void;
  setTypeFilter: (type: KPIType | "all") => void;
  setDateRange: (from?: Date, to?: Date) => void;
  fetchKPIs: (accessToken: string, clientId: string) => Promise<void>;
  applyFilters: () => void;
}

export const useKPIStore = create<KPIStore>((set, get) => ({
  kpis: [],
  filteredKpis: [],
  loading: true,
  error: null,
  filters: {
    type: "all",
    searchTerm: "",
  },

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
    const { kpis, filters } = get();
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

    set({ filteredKpis: filtered });
  },
}));
