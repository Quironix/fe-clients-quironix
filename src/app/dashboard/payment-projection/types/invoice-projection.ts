export interface Invoice {
  id: string;
  invoiceNumber: string;
  phase: string;
  dueDate: string;
  documentBalance: number;
  week: number;
  status?: "pending" | "paid" | "overdue";
  clientName?: string;
  description?: string;
  invoice_number?: string;
  type?: string;
  document_type?: string;
}

export interface WeekColumn {
  week: number;
  title: string;
  dateRange: string;
  estimated: number;
  collected: number;
  count: number;
  invoices: Invoice[];
  startDate: Date;
  endDate: Date;
}

export interface InvoiceProjectionSummary {
  totalInvoices: number;
  totalEstimated: number;
  totalCollected: number;
  totalVariation: number;
  averageInvoiceAmount: number;
}

export interface DragAndDropState {
  draggedInvoice: Invoice | null;
  draggedOverWeek: number | null;
  isDragging: boolean;
}

export interface InvoiceProjectionFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  status: string[];
  amountRange: {
    min: number;
    max: number;
  };
  searchTerm: string;
}
