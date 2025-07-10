export interface DTE {
  id?: string;
  type: string; //TipoDocumento
  number: string; //NnumeroDocumento
  external_number: string; //NumreoDocumentoSistExterno
  amount: number; //Monto
  order_number: string; //OrdenDeCompra
  issue_date: string; //FechaEmision
  due_date: string; //FechaVencimiento
  operation_date: string;
  reception_date: string;
  folio?: string; //Ficticia
  balance: number; //Balance
  litigation_balance: number; //BalanceLitigio
  is_internal_document: boolean;
  observations?: string | null; //Observacion
  number_of_installments: string; //NroCuota
  order_code?: string | null;
  reference: string; //Referencia
  ref_1?: string | null; //Ref1
  ref_2?: string | null; //Ref2
  ref_3?: string | null; //Ref3
  ref_4?: string | null; //Ref4
  debtor_id: string; //Codigodeudor
  debtor?: {
    id?: string;
    name?: string;
  };
}

export enum BulkSchema {
  DEBTORS = "DEBTORS",
  MOVEMENTS = "MOVEMENTS",
  INVOICES = "INVOICES",
  PAYMENTS = "PAYMENTS",
}

export interface BulkUploadError {
  row: number;
  value: any;
  column: string;
  message: string;
}

export interface BulkUploadResponse {
  id: string;
  clientId: string;
  validCount: number;
  totalCount: number;
  invalidCount: number;
  errors: BulkUploadError[];
  createdAt: string;
  updatedAt: string;
  schema: string;
  success?: boolean;
  message?: string;
}
