export interface PaymentNetting {
  id: string;
  date: string;
  company: string;
  debtor: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "processing";
  reference: string;
  paymentMethod: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentNettingFilters {
  search?: string;
  status?: string;
  company?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaymentNettingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaymentNettingResponse {
  data: PaymentNetting[];
  pagination: PaymentNettingPagination;
}

// BORRAR \/

export type PaymentData = {
  id: string;
  estado: string;
  importe: number;
  banco: string;
  numeroCuenta: string;
  codigo: string;
  fecha: string;
  descripcion: string;
  comentario: string;
};
