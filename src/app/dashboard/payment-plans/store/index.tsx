import { create } from "zustand";

// Definir interfaces para las facturas y los planes de pago
export interface Invoice {
  id: string;
  type: string;
  number: string;
  external_number: string;
  is_internal_document: boolean;
  amount: string;
  order_number: null;
  issue_date: string;
  is_fictitious: boolean;
  company_id: null;
  company: null;
  reference: null;
  file: string;
  due_date: string;
  operation_date: null;
  reception_date: null;
  folio: string;
  balance: string;
  litigation_balance: string;
  number_of_installments: number;
  observations: null;
  order_code: null | string;
  ref_1: null;
  ref_2: null;
  ref_3: null;
  ref_4: null;
  client_id: string;
  client: null;
  debtor_id: string;
  debtor: any;
  status: string;
  phases: any[];
  created_at: string;
  updated_at: string;
  payment_plan_id: null;
}

interface PaymentPlan {
  id: string;
  debtorId: string;
  invoices: Invoice[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Puedes agregar más campos según sea necesario
}

interface PaymentPlansStore {
  invoices: Invoice[];
  selectedInvoices: Invoice[];
  paymentPlans: PaymentPlan[];
  loading: boolean;
  error: string | null;
  // Acciones para facturas seleccionadas
  setSelectedInvoices: (invoices: Invoice[]) => void;
  addSelectedInvoice: (invoice: Invoice) => void;
  removeSelectedInvoice: (invoiceId: string) => void;
  clearSelectedInvoices: () => void;
  toggleInvoiceSelection: (invoice: Invoice) => void;
  selectAllInvoices: (invoices: Invoice[]) => void;
  // Acciones para planes de pago
  createPaymentPlan: (
    plan: Omit<PaymentPlan, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updatePaymentPlan: (id: string, plan: Partial<PaymentPlan>) => Promise<void>;
  deletePaymentPlan: (id: string) => Promise<void>;
}

export const usePaymentPlansStore = create<PaymentPlansStore>((set, get) => ({
  invoices: [],
  selectedInvoices: [],
  paymentPlans: [],
  loading: false,
  error: null,

  // Acciones para facturas seleccionadas
  setSelectedInvoices: (invoices) => {
    set({ selectedInvoices: invoices });
  },

  addSelectedInvoice: (invoice) => {
    const currentSelected = get().selectedInvoices;
    const isAlreadySelected = currentSelected.some(
      (inv) => inv.id === invoice.id
    );

    if (!isAlreadySelected) {
      set({ selectedInvoices: [...currentSelected, invoice] });
    }
  },

  removeSelectedInvoice: (invoiceId) => {
    const currentSelected = get().selectedInvoices;
    set({
      selectedInvoices: currentSelected.filter((inv) => inv.id !== invoiceId),
    });
  },

  clearSelectedInvoices: () => {
    set({ selectedInvoices: [] });
  },

  toggleInvoiceSelection: (invoice) => {
    const currentSelected = get().selectedInvoices;
    const isSelected = currentSelected.some((inv) => inv.id === invoice.id);

    if (isSelected) {
      set({
        selectedInvoices: currentSelected.filter(
          (inv) => inv.id !== invoice.id
        ),
      });
    } else {
      set({ selectedInvoices: [...currentSelected, invoice] });
    }
  },

  selectAllInvoices: (invoices) => {
    set({ selectedInvoices: invoices });
  },
  createPaymentPlan: async (plan) => {
    set({ loading: true, error: null });
    try {
      // Aquí deberías llamar a tu servicio/API real para crear el plan de pago
      // Simulamos la creación agregando el plan al array
      const newPlan: PaymentPlan = {
        ...plan,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "CREADO",
      };
      set({
        paymentPlans: [...get().paymentPlans, newPlan],
        loading: false,
      });
    } catch (error: any) {
      set({ error: "Error al crear el plan de pago", loading: false });
    }
  },

  updatePaymentPlan: async (id, plan) => {
    set({ loading: true, error: null });
    try {
      // Aquí deberías llamar a tu servicio/API real para actualizar el plan de pago
      const updatedPlans = get().paymentPlans.map((p) =>
        p.id === id ? { ...p, ...plan, updatedAt: new Date().toISOString() } : p
      );
      set({ paymentPlans: updatedPlans, loading: false });
    } catch (error: any) {
      set({ error: "Error al actualizar el plan de pago", loading: false });
    }
  },

  deletePaymentPlan: async (id) => {
    set({ loading: true, error: null });
    try {
      // Aquí deberías llamar a tu servicio/API real para eliminar el plan de pago
      const filteredPlans = get().paymentPlans.filter((p) => p.id !== id);
      set({ paymentPlans: filteredPlans, loading: false });
    } catch (error: any) {
      set({ error: "Error al eliminar el plan de pago", loading: false });
    }
  },
}));
