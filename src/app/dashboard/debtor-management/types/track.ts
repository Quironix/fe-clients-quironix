/**
 * Tipos TypeScript para Tracks de Gestión de Deudores
 * Basado en detail-track.md
 */

import { ContactType } from "../config/management-types";

/**
 * Estructura de contacto
 */
export interface TrackContact {
  type: ContactType;
  value: string;
}

/**
 * Datos específicos del caso (dinámicos según el tipo de gestión)
 */
export interface CaseData {
  // Compromiso de pago
  commitmentDate?: string | Date;
  amount?: number;

  // Pago declarado
  paymentDate?: string | Date;
  paymentAmount?: number;

  // Motivo de no pago
  nonPaymentReason?: string;
  customReason?: string;

  // Comunicación pendiente
  communicationPurpose?: string;

  // Factura no contabilizada
  selectionOption?: string;

  // Litigio
  litigationId?: string;
  litigationData?: any;

  // Plan de pago
  paymentPlanId?: string;

  // Retiro de cheque
  pickupDate?: string | Date;
  paymentCommitmentAmount?: number;
  pickupTimeFrom?: string;
  pickupTimeTo?: string;
  checkPickupAddress?: string;
}

/**
 * Payload para crear un track
 */
export interface CreateTrackPayload {
  debtor_id: string;
  management_type: string;
  contact: TrackContact;
  observation: string;
  debtor_comment: string;
  executive_comment: string;
  next_management_date: string; // ISO 8601 format
  case_data?: CaseData;
  invoice_ids: string[];
}

/**
 * Información de transición de fase
 */
export interface PhaseTransition {
  invoiceId: string;
  success: boolean;
  sourcePhase: number;
  targetPhase: number;
}

/**
 * Resultado de transiciones de fase
 */
export interface PhaseTransitionsResult {
  totalInvoices: number;
  successfulTransitions: number;
  failedTransitions: number;
  transitions: PhaseTransition[];
}

/**
 * Respuesta del API al crear un track
 */
export interface CreateTrackResponse {
  track: {
    id: string;
    debtor_id: string;
    management_type: string;
    contact: TrackContact;
    observation: string;
    debtor_comment: string;
    executive_comment: string;
    next_management_date: string;
    case_data?: CaseData;
    created_at: string;
    updated_at: string;
  };
  phaseTransitions: PhaseTransitionsResult;
}
