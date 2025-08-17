import { create as createStore } from "zustand";

interface PaymentProjectionStore {
  debtorId: number | null;
  setDebtorId: (debtorId: number | null) => void;
}

export const usePaymentProjectionStore = createStore<PaymentProjectionStore>(
  (set, get) => ({
    debtorId: null,
    setDebtorId: (debtorId: number | null) => set({ debtorId }),
  })
);
