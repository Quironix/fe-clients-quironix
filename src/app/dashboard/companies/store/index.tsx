import { create } from "zustand";

import {
  createCompany,
  deleteCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
} from "../services";
import { Company } from "../types";

interface CompaniesStore {
  companies: Company[];
  company: Company;
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCompanies: (companies: Company[]) => void;
  setCompany: (company: Company) => void;
  clearCompany: () => void;
  getCompanies: (accessToken: string, clientId: string) => Promise<void>;
  getCompanyById: (
    accessToken: string,
    clientId: string,
    companyId: string
  ) => Promise<void>;
  createCompany: (
    accessToken: string,
    clientId: string,
    company: Company
  ) => Promise<void>;
  updateCompany: (
    accessToken: string,
    clientId: string,
    companyId: string,
    company: Company
  ) => Promise<void>;
  deleteCompany: (
    accessToken: string,
    clientId: string,
    companyId: string
  ) => Promise<void>;
}

export const useCompaniesStore = create<CompaniesStore>((set, get) => ({
  companies: [],
  company: {} as Company,
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  error: null,
  setError: (error: string | null) => set({ error }),
  setCompanies: (companies: Company[]) => set({ companies }),
  setCompany: (company: Company) => set({ company }),
  clearCompany: () => set({ company: {} as Company }),
  getCompanies: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null, companies: [], company: {} as Company });
    try {
      const response = await getCompanies(accessToken, clientId);
      set({ companies: response });
    } catch (error: any) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  },
  getCompanyById: async (
    accessToken: string,
    clientId: string,
    companyId: string
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await getCompanyById(accessToken, clientId, companyId);
      set({ company: response });
    } catch (error: any) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  },
  createCompany: async (
    accessToken: string,
    clientId: string,
    company: Company
  ) => {
    set({ loading: true, error: null, companies: [] });
    try {
      const response = await createCompany(accessToken, clientId, company);
      set({ company: response });
      get().getCompanies(accessToken, clientId);
    } catch (error: any) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  },
  updateCompany: async (
    accessToken: string,
    clientId: string,
    companyId: string,
    company: Company
  ) => {
    set({ loading: true, error: null, companies: [] });
    try {
      const response = await updateCompany(
        accessToken,
        clientId,
        companyId,
        company
      );
      set({ company: response });
      get().getCompanies(accessToken, clientId);
    } catch (error: any) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  },
  deleteCompany: async (
    accessToken: string,
    clientId: string,
    companyId: string
  ) => {
    set({ loading: true, error: null, companies: [] });
    try {
      const response = await deleteCompany(accessToken, clientId, companyId);
      if (response) {
        get().getCompanies(accessToken, clientId);
      }
    } catch (error: any) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  },
}));
