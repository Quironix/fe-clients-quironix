import { create } from 'zustand';

interface DisputeState {
  client: string;
  debtor: string;
  invoiceType: string;
  invoiceNumber: string;
  invoiceAmount: string;
  reason: string;
  subreason: string;
  contact: string;
  comment: string;
  setField: (field: string, value: string) => void;
}

export const useDisputeStore = create<DisputeState>((set) => ({
  client: '',
  debtor: '',
  invoiceType: '',
  invoiceNumber: '',
  invoiceAmount: '',
  reason: '',
  subreason: '',
  contact: '',
  comment: '',
  setField: (field, value) => set({ [field]: value }),
}));