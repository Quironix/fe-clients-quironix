export interface TaskScopeItem {
  id: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
  balance: number | null;
  dueDate: string | null;
  need: string;
  needContext: {
    commitmentDate?: string;
    commitmentAmount?: number;
    missing?: string[];
    requestedFields?: string[];
  };
  resultClass: string | null;
  resultAt: string | null;
  nextEntryOn: string | null;
  resolvedBy: string | null;
  resolvedReason: string | null;
}

export interface TaskScopeWaitingInvoice {
  invoiceId: string;
  invoiceNumber: string | null;
  balance: number;
  dueDate: string | null;
  need: string;
  waitUntil: string | null;
}

export interface TaskScope {
  taskId: string;
  status: string;
  progress: { total: number; withResult: number };
  technicalFile: TaskScopeItem | null;
  items: TaskScopeItem[];
  debtorItems: TaskScopeItem[];
  waiting: TaskScopeWaitingInvoice[];
}
