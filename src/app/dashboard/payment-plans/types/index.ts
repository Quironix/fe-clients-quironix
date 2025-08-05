
export interface PaymentPlans {
   id: string; // Nº Solicitud
  debtor: {
    id: string;
    name: string;
  };
  status: BankMovementStatusEnum;
  totalDebt: number;
  installmentCount: number;
  installmentAmount: number;
  paymentStartDate: string;
  paymentEndDate: string; 
  comment: string;
  approver: {
    id: string;
    name: string;
  };
  
}
export enum BankMovementStatusEnum {
 APPROVED = "APPROVED",
 WITH_OBSERVATIONS = "WITH_OBSERVATIONS",
 REJECTED = "REJECTED",
 IN_REVIEW = "IN_REVIEW"
}
export interface PaymentPlansFilters {
   search?: string;
  status?: string[]; 
  createdAtFrom?: string;
  createdAtTo?: string;
}