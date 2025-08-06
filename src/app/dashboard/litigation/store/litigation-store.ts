import { create } from "zustand";

type Litigio = {
 client: string,
      debtorId: string
      invoiceType: string,
      invoiceId: string,
      invoiceAmount: string,
      reason: string,
      subreason: string,
      contact: string,
      initialComment?: string ,
      document?: string ,
    litigationAmount?: string,
    description?: string,
};

type LitigationStore = {
  litigiosIngresados: Litigio[];
  addLitigio: (litigio: Litigio) => void;
  removeLitigio: (invoiceId: string) => void;
  clearLitigios: () => void;
};

export const useLitigationStore = create<LitigationStore>((set) => ({
  litigiosIngresados: [],

  addLitigio: (litigio) =>
    set((state) => ({
      litigiosIngresados: [...state.litigiosIngresados, litigio],
    })),

  removeLitigio: (numero) =>
    set((state) => ({
      litigiosIngresados: state.litigiosIngresados.filter((l) => l.invoiceId !== numero),
    })),

  clearLitigios: () => set({ litigiosIngresados: [] }),
}));

