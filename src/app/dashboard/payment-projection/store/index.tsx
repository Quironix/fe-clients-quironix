import { create as createStore } from "zustand";

interface PaymentProjectionStore {
  debtorId: number | null;
  searchDebtorCode: string | null;
  setDebtorId: (debtorId: number | null) => void;
  setSearchDebtorCode: (searchDebtorCode: string | null) => void;
  periodMonth: string | null;
  setPeriodMonth: (periodMonth: string | null) => void;
}

export const usePaymentProjectionStore = createStore<PaymentProjectionStore>(
  (set, get) => ({
    debtorId: null,
    searchDebtorCode: null,
    setDebtorId: (debtorId: number | null) => set({ debtorId }),
    setSearchDebtorCode: (searchDebtorCode: string | null) =>
      set({ searchDebtorCode }),
    periodMonth: null,
    setPeriodMonth: (periodMonth: string | null) => set({ periodMonth }),
  })
);
