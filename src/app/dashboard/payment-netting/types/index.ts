export interface PaymentNetting {
  id: string;
  amount: number;
  bank_information: {
    bank: string;
    account_number: string;
  };
  status: BankMovementStatusEnum;
  code: string;
  description: string;
  comment: string;
}

export interface PaymentNettingFilters {
  search?: string;
  status?: string;
  company?: string;
  dateFrom?: string;
  dateTo?: string;
  // Alias para compatibilidad con el servicio API
  createdAtFrom?: string;
  createdAtTo?: string;
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

export enum BankMovementStatusEnum {
  PENDING = "Pendiente",
  PROCESSED = "Procesado",
  REJECTED = "Rechazado",
  ELIMINATED = "Eliminado",
  COMPENSATED = "Compensado",
  REJECTED_DUPLICATE = "Rechazado duplicado",
  ELIMINATED_NEGATIVE_AMOUNT = "Eliminado monto negativo",
  ELIMINATED_NO_TRACKING = "Eliminado sin tracking",
  MAINTAINED = "Mantenido",
}
