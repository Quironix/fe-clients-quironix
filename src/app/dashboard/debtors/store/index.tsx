import { toast } from "sonner";
import { create } from "zustand";
import {
  createDebtor,
  deleteDebtor,
  getDebtorById,
  getDebtors,
  updateDebtor,
} from "../services";
import { BulkUploadResponse, Debtor } from "../types";
import { DEFAULT_PAGINATION_PARAMS } from "../types/pagination";

interface DebtorsStore {
  dataDebtor: Debtor;
  setDataDebtor: (debtor: any) => void;
  debtors: any[];
  loading: boolean;
  error: any;

  // Nuevos estados para paginación y búsqueda
  paginatedDebtors: any[];
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
  totalDebtors: number;
  searchTerm: string;
  isLoadingMore: boolean;
  isSearching: boolean;

  bulkUploadErrors: BulkUploadResponse | null;
  isFetchingDebtor: boolean;
  setIsFetchingDebtor: (isFetching: boolean) => void;

  // Métodos existentes
  fetchDebtors: (accessToken: string, clientId: string) => Promise<void>;
  fetchDebtorById: (
    accessToken: string,
    clientId: string,
    debtorId: string
  ) => Promise<void>;
  createDebtor: (
    accessToken: string,
    clientId: string,
    debtor: any
  ) => Promise<void>;
  updateDebtor: (
    accessToken: string,
    clientId: string,
    debtor: any
  ) => Promise<void>;
  deleteDebtor: (
    debtorId: string,
    accessToken: string,
    clientId: string
  ) => Promise<void>;
  setBulkUploadErrors: (errors: BulkUploadResponse) => void;
  clearBulkUploadErrors: () => void;

  // Nuevos métodos para paginación y búsqueda
  fetchDebtorsPaginated: (
    accessToken: string,
    clientId: string,
    page?: number,
    search?: string,
    reset?: boolean
  ) => Promise<void>;
  loadMoreDebtors: (accessToken: string, clientId: string) => Promise<void>;
  searchDebtors: (
    accessToken: string,
    clientId: string,
    searchTerm: string
  ) => Promise<void>;
  clearSearch: () => void;
  resetPagination: () => void;
  clearDataDebtor: () => void;
}

export const useDebtorsStore = create<DebtorsStore>((set, get) => ({
  dataDebtor: {} as Debtor,
  setDataDebtor: (debtor: Debtor) => set({ dataDebtor: debtor }),
  debtors: [],
  loading: false,
  error: null,

  // Estados iniciales para paginación
  paginatedDebtors: [],
  currentPage: 1,
  hasNextPage: false,
  totalPages: 0,
  totalDebtors: 0,
  searchTerm: "",
  isLoadingMore: false,
  isSearching: false,

  isFetchingDebtor: false,
  setIsFetchingDebtor: (isFetching: boolean) =>
    set({ isFetchingDebtor: isFetching }),
  bulkUploadErrors: null,

  // Método original mantenido para compatibilidad
  fetchDebtors: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null, dataDebtor: {} as Debtor });
    try {
      const response = await getDebtors(accessToken, clientId);
      const debtorsData = response.data || [];
      set({ debtors: Array.isArray(debtorsData) ? debtorsData : [] });
    } catch (error: any) {
      console.error("Error en fetchDebtors:", error);
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Error desconocido al obtener los deudores";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  // Nuevo método para paginación
  fetchDebtorsPaginated: async (
    accessToken: string,
    clientId: string,
    page = 1,
    search = "",
    reset = false
  ) => {
    const state = get();

    // Si es una nueva búsqueda o reset, limpiar datos existentes
    if (reset || page === 1) {
      set({
        paginatedDebtors: [],
        currentPage: 1,
        searchTerm: search,
        isSearching: !!search,
      });
    }

    set({
      loading: page === 1,
      isLoadingMore: page > 1,
      error: null,
    });

    try {
      const response = await getDebtors(accessToken, clientId, {
        page,
        limit: DEFAULT_PAGINATION_PARAMS.limit,
        search: search || undefined,
      });

      const newDebtors = response.data || [];
      const pagination = response.pagination;

      set((state) => ({
        paginatedDebtors:
          page === 1 ? newDebtors : [...state.paginatedDebtors, ...newDebtors],
        currentPage: pagination.page,
        hasNextPage: pagination.hasNext,
        totalPages: pagination.totalPages,
        totalDebtors: pagination.total,
        searchTerm: search,
        debtors: Array.isArray(newDebtors) ? newDebtors : [],
      }));
    } catch (error: any) {
      console.error("Error en fetchDebtorsPaginated:", error);
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Error desconocido al obtener los deudores";
      set({ error: errorMessage });
    } finally {
      set({
        loading: false,
        isLoadingMore: false,
        isSearching: false,
      });
    }
  },

  // Cargar más deudores (infinite scroll)
  loadMoreDebtors: async (accessToken: string, clientId: string) => {
    const state = get();

    if (!state.hasNextPage || state.isLoadingMore) {
      return;
    }

    await state.fetchDebtorsPaginated(
      accessToken,
      clientId,
      state.currentPage + 1,
      state.searchTerm
    );
  },

  // Buscar deudores
  searchDebtors: async (
    accessToken: string,
    clientId: string,
    searchTerm: string
  ) => {
    set({ isSearching: true });
    await get().fetchDebtorsPaginated(
      accessToken,
      clientId,
      1,
      searchTerm,
      true
    );
  },

  // Limpiar búsqueda
  clearSearch: () => {
    set({
      searchTerm: "",
      isSearching: false,
    });
  },

  // Reset paginación
  resetPagination: () => {
    set({
      paginatedDebtors: [],
      currentPage: 1,
      hasNextPage: false,
      totalPages: 0,
      totalDebtors: 0,
      searchTerm: "",
      isSearching: false,
    });
  },
  fetchDebtorById: async (
    accessToken: string,
    clientId: string,
    debtorId: string
  ) => {
    set({
      loading: true,
      isFetchingDebtor: true,
      error: null,
      dataDebtor: {} as Debtor,
    });
    try {
      const response = await getDebtorById(accessToken, clientId, debtorId);

      if (!response?.id) {
        toast.error("Error al obtener el deudor");
        window.location.href = "/dashboard/debtors";
      }
      set({ dataDebtor: response });
    } catch (error: any) {
      console.error("Error en fetchDebtorById:", error);
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Error desconocido al obtener el deudor";
      set({ error: errorMessage });
    } finally {
      set({ loading: false, isFetchingDebtor: false });
    }
  },
  createDebtor: async (accessToken: string, clientId: string, debtor: any) => {
    set({ loading: true, error: null });
    try {
      const response = await createDebtor(accessToken, clientId, debtor);
      set({ dataDebtor: response });
      console.log("response", response);
      // get().fetchDebtors(accessToken, clientId);
    } catch (error: any) {
      console.error("Error en createDebtor:", error);
      debugger;
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Error desconocido al crear el deudor";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  updateDebtor: async (
    accessToken: string,
    clientId: string,
    debtor: string
  ) => {
    set({ loading: true, error: null });
    try {
      await updateDebtor(accessToken, clientId, debtor);
      // get().fetchDebtors(accessToken, clientId);
    } catch (error: any) {
      console.error("Error en updateDebtor:", error);
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Error desconocido al actualizar el deudor";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  deleteDebtor: async (
    accessToken: string,
    clientId: string,
    debtorId: string
  ) => {
    set({ loading: true, error: null, debtors: [] });
    try {
      await deleteDebtor(accessToken, clientId, debtorId);
      get().fetchDebtors(accessToken, clientId);
    } catch (error: any) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  },
  setBulkUploadErrors: (errors: BulkUploadResponse) => {
    set({ bulkUploadErrors: errors });
  },
  clearBulkUploadErrors: () => {
    set({ bulkUploadErrors: null });
  },
  clearDataDebtor: () => {
    set({ dataDebtor: {} as Debtor });
  },
}));
