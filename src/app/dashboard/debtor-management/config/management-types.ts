/**
 * Configuración de tipos de gestión de deudores basada en detail-track.md
 * Estructura en cascada: management_type → debtor_comment → executive_comment
 */

import React from "react";
import { ManagementLitigationForm } from "../components/litigation";
import { ManagementNormalizedLitigationForm } from "../components/normalization";
import { ManagementPaymentPlanForm } from "../components/payment-plan";

export type ContactType = "PHONE" | "EMAIL" | "WHATSAPP" | "SMS" | "LETTER";

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "time"
  | "datetime"
  | "textarea"
  | "select"
  | "component";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
  component?: React.ComponentType<any>;
  componentProps?: Record<string, any>;
}

/**
 * Combinación completa de gestión
 */
export interface ManagementCombination {
  id: string;
  label: string;
  description: string;
  management_type: string;
  debtor_comment: string;
  executive_comment: string;
  targetPhase: number;
  fields: FieldConfig[];
}

/**
 * Todas las combinaciones posibles según detail-track.md
 */
export const MANAGEMENT_COMBINATIONS: ManagementCombination[] = [
  {
    id: "payment_commitment",
    label: "Compromiso de pago",
    description: "Depositará o hará transferencia",
    management_type: "CALL_OUT",
    debtor_comment: "WILL_DEPOSIT_OR_TRANSFER",
    executive_comment: "WITH_PAYMENT_COMMITMENT",
    targetPhase: 5,
    fields: [
      {
        name: "commitmentDate",
        label: "Fecha de compromiso",
        type: "date",
        required: true,
        placeholder: "YYYY-MM-DD",
      },
      {
        name: "amount",
        label: "Monto comprometido",
        type: "number",
        required: true,
        placeholder: "500000",
      },
    ],
  },
  {
    id: "payment_declared",
    label: "Pago Declarado",
    description: "Depositó o transfirió",
    management_type: "CALL_OUT",
    debtor_comment: "DEPOSITED_OR_TRANSFERRED",
    executive_comment: "CONFIRM_PAYMENT_IN_STATEMENT",
    targetPhase: 7,
    fields: [
      {
        name: "paymentDate",
        label: "Fecha de pago",
        type: "date",
        required: true,
        placeholder: "YYYY-MM-DD",
      },
      {
        name: "paymentAmount",
        label: "Monto pagado",
        type: "number",
        required: true,
        placeholder: "750000",
      },
    ],
  },
  {
    id: "non_payment_reason",
    label: "Motivo de no pago",
    description: "Contacto no responde",
    management_type: "CALL_OUT",
    debtor_comment: "CONTACT_NOT_RESPONDING",
    executive_comment: "NO_PROGRESS",
    targetPhase: 1,
    fields: [
      {
        name: "nonPaymentReason",
        label: "Razón de no pago",
        type: "select",
        required: true,
        options: [
          { value: "LACK_OF_COMMUNICATION", label: "Falta de comunicación" },
          { value: "FINANCIAL_ISSUES", label: "Problemas financieros" },
          { value: "DISPUTE", label: "Disputa" },
          { value: "OTHER", label: "Otro" },
        ],
      },
      {
        name: "customReason",
        label: "Detalles adicionales",
        type: "textarea",
        required: false,
        placeholder: "Explique los detalles específicos...",
      },
    ],
  },
  {
    id: "pending_communication",
    label: "Comunicación pendiente",
    description: "Envío estado de cuenta",
    management_type: "CALL_OUT",
    debtor_comment: "STATEMENT_SENT",
    executive_comment: "INFORMATION_SENT",
    targetPhase: 1,
    fields: [
      {
        name: "communicationPurpose",
        label: "Propósito de comunicación",
        type: "select",
        required: true,
        options: [
          {
            value: "ACCOUNT_STATEMENT_REQUEST",
            label: "Solicitud de estado de cuenta",
          },
          {
            value: "SEND_INVOICE_DETAILS",
            label: "Envío de detalles de factura",
          },
          { value: "PAYMENT_CONFIRMATION", label: "Confirmación de pago" },
          { value: "OTHER", label: "Otro" },
        ],
      },
    ],
  },
  {
    id: "payment_identified",
    label: "Pago Identificado",
    description: "Pago realizado e identificado",
    management_type: "CALL_OUT",
    debtor_comment: "PAYMENT_MADE_AND_IDENTIFIED",
    executive_comment: "PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL",
    targetPhase: 1,
    fields: [
      {
        name: "paymentAmount",
        label: "Monto del pago parcial",
        type: "number",
        required: true,
        placeholder: "300000",
      },
      {
        name: "paymentDate",
        label: "Fecha de identificación",
        type: "date",
        required: true,
        placeholder: "YYYY-MM-DD",
      },
    ],
  },
  {
    id: "invoice_not_registered",
    label: "Factura no contabilizada",
    description: "Factura no registrada en contabilidad",
    management_type: "CALL_OUT",
    debtor_comment: "INVOICE_NOT_REGISTERED_IN_ACCOUNTING",
    executive_comment: "NOT_ACCOUNTED",
    targetPhase: 3,
    fields: [
      {
        name: "selectionOption",
        label: "Acción a tomar",
        type: "select",
        required: true,
        options: [
          { value: "SEND_INVOICE_COPY", label: "Enviar copia de factura" },
          { value: "VERIFY_RECEIPT", label: "Verificar recepción" },
          { value: "CONTACT_ACCOUNTING", label: "Contactar contabilidad" },
          { value: "OTHER", label: "Otro" },
        ],
      },
      {
        name: "customReason",
        label: "Explicación del problema",
        type: "textarea",
        required: false,
        placeholder: "Detalles específicos del problema contable...",
      },
    ],
  },
  {
    id: "litigation",
    label: "Litigio",
    description: "Factura con litigio",
    management_type: "CALL_OUT",
    debtor_comment: "INVOICE_WITH_LITIGATION",
    executive_comment: "DOCUMENT_IN_LITIGATION",
    targetPhase: 2,
    fields: [
      {
        name: "litigationData",
        label: "Datos del Litigio",
        type: "component",
        required: true,
        component: ManagementLitigationForm,
      },
    ],
  },
  {
    id: "litigation-normalization",
    label: "Facturas con litigio",
    description: "Normalización de litigio",
    management_type: "CALL_OUT",
    debtor_comment: "INVOICE_WITH_LITIGATION",
    executive_comment: "LITIGATION_NORMALIZATION",
    targetPhase: 2,
    fields: [
      {
        name: "litigationData",
        label: "Datos del Litigio",
        type: "component",
        required: true,
        component: ManagementNormalizedLitigationForm,
      },
    ],
  },
  {
    id: "payment_plan_request",
    label: "Plan de Pago",
    description: "Necesito plan de pago",
    management_type: "CALL_OUT",
    debtor_comment: "NEED_PAYMENT_PLAN",
    executive_comment: "PAYMENT_PLAN_APPROVAL_REQUEST",
    targetPhase: 4,
    fields: [
      {
        name: "paymentPlanData",
        label: "Configuración del Plan de Pago",
        type: "component",
        required: true,
        component: ManagementPaymentPlanForm,
      },
    ],
  },
  {
    id: "check_pickup",
    label: "Retiro de Cheque",
    description: "Cheque Confirmado",
    management_type: "CALL_OUT",
    debtor_comment: "CHECK_CONFIRMED",
    executive_comment: "WITH_PAYMENT_COMMITMENT",
    targetPhase: 5,
    fields: [
      {
        name: "pickupDate",
        label: "Fecha de retiro",
        type: "date",
        required: true,
        placeholder: "YYYY-MM-DD",
      },
      {
        name: "paymentCommitmentAmount",
        label: "Monto del cheque",
        type: "number",
        required: true,
        placeholder: "850000",
      },
      {
        name: "pickupTimeFrom",
        label: "Hora inicio retiro",
        type: "time",
        required: true,
        placeholder: "14:00",
      },
      {
        name: "pickupTimeTo",
        label: "Hora fin retiro",
        type: "time",
        required: true,
        placeholder: "17:00",
      },
      {
        name: "checkPickupAddress",
        label: "Dirección de retiro",
        type: "textarea",
        required: true,
        placeholder: "Av. Libertador 1234, Oficina 501, Santiago",
      },
    ],
  },
];

/**
 * Opciones para management_type (primer nivel)
 */
export const MANAGEMENT_TYPES = [
  {
    value: "WILL_DEPOSIT_OR_TRANSFER",
    label: "Depositará o hará transferencia",
  },
  { value: "DEPOSITED_OR_TRANSFERRED", label: "Depositó o transfirió" },
  { value: "CONTACT_NOT_RESPONDING", label: "Contacto no responde" },
  { value: "STATEMENT_SENT", label: "Envío Estado de Cuenta" },
  {
    value: "PAYMENT_MADE_AND_IDENTIFIED",
    label: "Pago realizado e identificado",
  },
  {
    value: "INVOICE_NOT_REGISTERED_IN_ACCOUNTING",
    label: "Factura no registrada en contabilidad",
  },
  { value: "INVOICE_WITH_LITIGATION", label: "Factura con litigio" },
  { value: "LITIGATION_NORMALIZATION", label: "Normalización de litigio" },
  { value: "NEED_PAYMENT_PLAN", label: "Necesito Plan de Pago" },
  { value: "CHECK_CONFIRMED", label: "Cheque Confirmado" },
];

/**
 * Opciones para debtor_comment (segundo nivel)
 */
export const DEBTOR_COMMENTS = [
  {
    value: "WILL_DEPOSIT_OR_TRANSFER",
    label: "Depositará o hará transferencia",
    managementType: "WILL_DEPOSIT_OR_TRANSFER",
  },
  {
    value: "DEPOSITED_OR_TRANSFERRED",
    label: "Depositó o transfirió",
    managementType: "DEPOSITED_OR_TRANSFERRED",
  },
  {
    value: "CONTACT_NOT_RESPONDING",
    label: "Contacto no responde",
    managementType: "CONTACT_NOT_RESPONDING",
  },
  {
    value: "STATEMENT_SENT",
    label: "Envío Estado de Cuenta",
    managementType: "STATEMENT_SENT",
  },
  {
    value: "PAYMENT_MADE_AND_IDENTIFIED",
    label: "Pago realizado e identificado",
    managementType: "PAYMENT_MADE_AND_IDENTIFIED",
  },
  {
    value: "INVOICE_NOT_REGISTERED_IN_ACCOUNTING",
    label: "Factura no registrada en contabilidad",
    managementType: "INVOICE_NOT_REGISTERED_IN_ACCOUNTING",
  },
  {
    value: "INVOICE_WITH_LITIGATION",
    label: "Factura con litigio",
    managementType: "INVOICE_WITH_LITIGATION",
  },
  {
    value: "LITIGATION_NORMALIZATION",
    label: "Normalización de litigio",
    managementType: "INVOICE_WITH_LITIGATION",
  },
  {
    value: "NEED_PAYMENT_PLAN",
    label: "Necesito Plan de Pago",
    managementType: "NEED_PAYMENT_PLAN",
  },
  {
    value: "CHECK_CONFIRMED",
    label: "Cheque Confirmado",
    managementType: "CHECK_CONFIRMED",
  },
];

/**
 * Opciones para executive_comment (tercer nivel)
 */
export const EXECUTIVE_COMMENTS = [
  {
    value: "WITH_PAYMENT_COMMITMENT",
    label: "Con compromiso de pago",
    debtorComment: "WILL_DEPOSIT_OR_TRANSFER",
  },
  {
    value: "CONFIRM_PAYMENT_IN_STATEMENT",
    label: "Confirmar abono en cartola",
    debtorComment: "DEPOSITED_OR_TRANSFERRED",
  },
  {
    value: "NO_PROGRESS",
    label: "Sin progreso",
    debtorComment: "CONTACT_NOT_RESPONDING",
  },
  {
    value: "INFORMATION_SENT",
    label: "Envío de información",
    debtorComment: "STATEMENT_SENT",
  },
  {
    value: "PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL",
    label: "Pago parcial o detalle incompleto",
    debtorComment: "PAYMENT_MADE_AND_IDENTIFIED",
  },
  {
    value: "NOT_ACCOUNTED",
    label: "No contabilizada",
    debtorComment: "INVOICE_NOT_REGISTERED_IN_ACCOUNTING",
  },
  {
    value: "DOCUMENT_IN_LITIGATION",
    label: "Documento en litigio",
    debtorComment: "INVOICE_WITH_LITIGATION",
  },
  {
    value: "LITIGATION_NORMALIZATION",
    label: "Normalización de litigio",
    debtorComment: "INVOICE_WITH_LITIGATION",
  },
  {
    value: "PAYMENT_PLAN_APPROVAL_REQUEST",
    label: "Solicitud de aprobación de plan de pago",
    debtorComment: "NEED_PAYMENT_PLAN",
  },
  {
    value: "WITH_PAYMENT_COMMITMENT",
    label: "Con Compromiso de pago",
    debtorComment: "CHECK_CONFIRMED",
  },
];

/**
 * Opciones para el tipo de contacto
 */
export const CONTACT_TYPE_OPTIONS: { value: ContactType; label: string }[] = [
  { value: "PHONE", label: "Teléfono" },
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "SMS", label: "SMS" },
  { value: "LETTER", label: "Carta" },
];

/**
 * Obtener opciones de debtor_comment filtradas por management_type
 */
export const getDebtorCommentOptions = (managementType: string) => {
  return DEBTOR_COMMENTS.filter((c) => c.managementType === managementType);
};

/**
 * Obtener opciones de executive_comment filtradas por debtor_comment
 */
export const getExecutiveCommentOptions = (debtorComment: string) => {
  return EXECUTIVE_COMMENTS.filter((c) => c.debtorComment === debtorComment);
};

/**
 * Obtener combinación completa por los 3 valores
 */
export const getManagementCombination = (
  managementType: string,
  debtorComment: string,
  executiveComment: string
): ManagementCombination | undefined => {
  return MANAGEMENT_COMBINATIONS.find(
    (c) =>
      c.management_type === managementType &&
      c.debtor_comment === debtorComment &&
      c.executive_comment === executiveComment
  );
};

/**
 * Helper para obtener configuración por ID (retrocompatibilidad)
 */
export const getManagementTypeConfig = (
  id: string
): ManagementCombination | undefined => {
  return MANAGEMENT_COMBINATIONS.find((config) => config.id === id);
};

/**
 * Obtener label de executive_comment por su valor
 */
export const getExecutiveCommentLabel = (type: string): string => {
  const comment = EXECUTIVE_COMMENTS.find((c) => c.value === type);
  return comment?.label || type;
};
