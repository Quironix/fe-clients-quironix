import { format } from "date-fns";
import { create } from "zustand";
import { getPaymentNetting } from "../services";

interface PaymentNetting {
  data: Datum[];
}

export interface Datum {
  id: string;
  client_id: string;
  client: Client;
  client_bank_id: string;
  bank_information: Bankinformation;
  movement_date: string;
  status: string;
  description: string;
  company_id: string;
  company: Company;
  amount: string;
  comment: null;
  sender_bank: null;
  movement_number: null;
  sender_name: null;
  sender_id: null;
  sender_account_number: null;
  ingress_type: string;
  created_at: string;
  updated_at: string;
  metadata: null;
}

interface Company {
  id: string;
  name: string;
  dni_type: string;
  dni_number: string;
  client_id: string;
  client_code: string;
  address: Address[];
  contacts: Contact2[];
  category: string;
  created_at: string;
  updated_at: string;
}

interface Contact2 {
  name: string;
  email: string;
  phone: string;
  position: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface Bankinformation {
  id: string;
  name: null;
  client_id: string;
  bank: string;
  currency: null;
  account_number: string;
  ledger_account: null;
  bank_provider: null;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  name: string;
  contract: string;
  type: string;
  email: null;
  phone_number: null;
  category: string;
  currency: string;
  operational_id: string;
  addresses: any[];
  contacts: Contact[];
  country_id: string;
  created_at: string;
  updated_at: string;
  terms_and_conditions: string;
  signature: string;
  signature_date: string;
  status: string;
  taxes: any[];
  language: string;
  dni_type: string;
  dni_number: string;
}

interface Contact {
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  phone: string;
  type_contact: string[];
  is_default: boolean;
}

interface PaymentNettingStore {
  paymentNetting: PaymentNetting;
  paymentNettings: Datum[];
  loading: boolean;
  error: string | null;
  fetchPaymentNetting: (
    accessToken: string,
    clientId: string,
    filters: {
      page: number;
      limit: number;
      status: string;
      createdAtToFrom: string;
      createdAtTo: string;
    }
  ) => Promise<void>;
  filters: {
    page: number;
    limit: number;
    status: string;
    createdAtToFrom: string;
    createdAtTo: string;
  };
  setFilters: (filters: {
    page: number;
    limit: number;
    status: string;
    createdAtToFrom: string;
    createdAtTo: string;
  }) => void;
  selectedInvoices: any[];
  selectedPayments: any[];
  setSelectedInvoices: (invoices: any[] | any) => void;
  setSelectedPayments: (payments: any[] | any) => void;
  totalPayments: number;
  totalInvoices: number;
  setTotalPayments: (total: number) => void;
  setTotalInvoices: (total: number) => void;
  resetSelected: () => void;
}
export const usePaymentNettingStore = create<PaymentNettingStore>(
  (set, get) => ({
    paymentNetting: {} as PaymentNetting,
    paymentNettings: [],
    loading: false,
    error: null,
    fetchPaymentNetting: async (
      accessToken: string,
      clientId: string,
      filters: {
        page: number;
        limit: number;
        status: string;
        createdAtToFrom: string;
        createdAtTo: string;
      }
    ) => {
      set({ loading: true });
      const response = await getPaymentNetting({
        accessToken,
        clientId,
        ...filters,
      });
      set({ paymentNettings: response.data || [] });
      set({ loading: false });
    },
    filters: {
      page: 1,
      limit: 10,
      status: "ALL",
      createdAtToFrom: format(new Date(), "yyyy-MM-dd"),
      createdAtTo: format(new Date(), "yyyy-MM-dd"),
    },
    setFilters: (filters) => set({ filters }),
    selectedInvoices: [],
    selectedPayments: [],
    setSelectedInvoices: (invoices) => {
      const currentInvoices = get().selectedInvoices;

      // Si se está pasando un array completo, reemplazar todo
      if (Array.isArray(invoices)) {
        set({ selectedInvoices: invoices });
        return;
      }

      // Si se está pasando un elemento individual, verificar duplicados
      const invoice = invoices as any;
      const existingInvoice = currentInvoices.find(
        (item) => item.id === invoice.id
      );

      if (!existingInvoice) {
        set({ selectedInvoices: [...currentInvoices, invoice] });
      }
    },
    setSelectedPayments: (payments) => {
      const currentPayments = get().selectedPayments;

      // Si se está pasando un array completo, reemplazar todo
      if (Array.isArray(payments)) {
        set({ selectedPayments: payments });
        return;
      }

      // Si se está pasando un elemento individual, verificar duplicados
      const payment = payments as any;
      const existingPayment = currentPayments.find(
        (item) => item.id === payment.id
      );

      if (!existingPayment) {
        set({ selectedPayments: [...currentPayments, payment] });
      }
    },
    totalPayments: 0,
    totalInvoices: 0,
    setTotalPayments: (total) => set({ totalPayments: total }),
    setTotalInvoices: (total) => set({ totalInvoices: total }),
    resetSelected: () =>
      set({
        selectedInvoices: [],
        selectedPayments: [],
        totalInvoices: 0,
        totalPayments: 0,
      }),
  })
);
