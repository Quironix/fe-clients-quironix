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
        placeholder: "DD-MM-AAAAA",
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
    label: "Pago declarado",
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
        placeholder: "DD-MM-AAAAA",
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
    fields: [],
  },
  {
    id: "unreachable_debtor",
    label: "Deudor inubicable",
    description: "Deudor inubicable",
    management_type: "CALL_OUT",
    debtor_comment: "CONTACT_NOT_RESPONDING",
    executive_comment: "UNREACHABLE_DEBTOR",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "information_sent",
    label: "Envío de información",
    description: "Envío de información",
    management_type: "CALL_OUT",
    debtor_comment: "CONTACT_NOT_RESPONDING",
    executive_comment: "INFORMATION_SENT",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "increase_pressure",
    label: "Aumentar Presión",
    description: "Aumentar Presión",
    management_type: "CALL_OUT",
    debtor_comment: "CONTACT_NOT_RESPONDING",
    executive_comment: "INCREASE_PRESSURE",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "no_contact",
    label: "Sin contacto",
    description: "Sin contacto",
    management_type: "CALL_OUT",
    debtor_comment: "CONTACT_NOT_RESPONDING",
    executive_comment: "NO_CONTACT",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "meeting_requested_to_debtor",
    label: "Se solicitará reunión a Deudor",
    description: "Se solicitará reunión a Deudor",
    management_type: "CALL_OUT",
    debtor_comment: "CONTACT_NOT_RESPONDING",
    executive_comment: "MEETING_REQUESTED_TO_DEBTOR",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "information_sent_statement_sent",
    label: "",
    description: "Envío de información",
    management_type: "CALL_OUT",
    debtor_comment: "STATEMENT_SENT",
    executive_comment: "INFORMATION_SENT",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "increase_pressure_statement_sent",
    label: "",
    description: "Aumentar Presión",
    management_type: "CALL_OUT",
    debtor_comment: "STATEMENT_SENT",
    executive_comment: "INCREASE_PRESSURE",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "no_progress_statement_sent",
    label: "",
    description: "Sin progreso",
    management_type: "CALL_OUT",
    debtor_comment: "STATEMENT_SENT",
    executive_comment: "NO_PROGRESS",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "invoice_pdf_sent",
    label: "",
    description: "Se envió pdf de factura",
    management_type: "CALL_OUT",
    debtor_comment: "STATEMENT_SENT",
    executive_comment: "INVOICE_PDF_SENT",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "payment_identified",
    label: "Pago identificado",
    description: "Pago realizado e identificado",
    management_type: "CALL_OUT",
    debtor_comment: "PAYMENT_MADE_AND_IDENTIFIED",
    executive_comment: "PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL",
    targetPhase: 1,
    fields: [
      {
        name: "paymentAmount",
        label: "Monto del pago",
        type: "number",
        required: true,
        placeholder: "300000",
      },
      {
        name: "paymentDate",
        label: "Fecha de identificación",
        type: "date",
        required: true,
        placeholder: "DD-MM-YYYY",
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
        label: "Motivo no contabilizada",
        type: "select",
        required: true,
        options: [
          {
            value: "INVOICE_RECENTLY_RECEIVED",
            label: "Factura recientemente recibida, no ha sido validada aún",
          },
          {
            value: "INVOICE_WITH_CREDIT_NOTE",
            label: "Factura con Nota de crédito",
          },
          {
            value: "SERVICE_IN_APPROVAL_PROCESS",
            label: "Servicio en proceso de aprobación",
          },
          {
            value: "PENDING_APPROVAL_OF_PURCHASE_ORDER",
            label: "Aprobación pendiente de orden de compra",
          },
          {
            value: "PENDING_DOCUMENT_VERIFICATION",
            label: "Pendiente verificación de documento sustentatorio",
          },
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
        placeholder: "DD-MM-YYYY",
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
  // DOCUMENTOS SIN COMPROMISO DE PAGO
  {
    id: "debtor_unreachable_no_payment_commitment",
    label: "",
    description: "Deudor inubicable",
    management_type: "CALL_OUT",
    debtor_comment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
    executive_comment: "DEBTOR_UNREACHABLE",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "information_sent_no_payment_commitment",
    label: "",
    description: "Envío de información",
    management_type: "CALL_OUT",
    debtor_comment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
    executive_comment: "INFORMATION_SENT",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "increasse_pressure_no_payment_commitment",
    label: "",
    description: "Aumentar Presión",
    management_type: "CALL_OUT",
    debtor_comment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
    executive_comment: "INCREASE_PRESSURE",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "no_contact_no_payment_commitment",
    label: "",
    description: "Sin contacto",
    management_type: "CALL_OUT",
    debtor_comment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
    executive_comment: "NO_CONTACT",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "no_progress_no_payment_commitment",
    label: "",
    description: "Sin progreso",
    management_type: "CALL_OUT",
    debtor_comment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
    executive_comment: "NO_PROGRESS",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "meeting_wdr_no_payment_commitment",
    label: "",
    description: "Se solicitará reunión a Deudor",
    management_type: "CALL_OUT",
    debtor_comment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
    executive_comment: "MEETING_WITH_DEBTOR_REQUESTED",
    targetPhase: 1,
    fields: [],
  },
  // SOLICITO ENVÍO DE NOTAS DE CRÉDITO
  {
    id: "information_sent_request_credit_notes_sending",
    label: "",
    description: "Envío de información",
    management_type: "CALL_OUT",
    debtor_comment: "REQUEST_CREDIT_NOTES_SENDING",
    executive_comment: "INFORMATION_SENT",
    targetPhase: 3,
    fields: [],
  },
  // SOLICITO ACUSE DE RECIBO
  {
    id: "apply_credit_note_request_acknowledgment_of_receipt",
    label: "",
    description: "Aplicar N/C",
    management_type: "CALL_OUT",
    debtor_comment: "REQUEST_ACKNOWLEDGMENT_OF_RECEIPT",
    executive_comment: "APPLY_CREDIT_NOTE",
    targetPhase: 3,
    fields: [],
  },
  {
    id: "confirm_payment_in_statement_request_acknowledgment_of_receipt",
    label: "",
    description: "Confirmar abono en cartola",
    management_type: "CALL_OUT",
    debtor_comment: "REQUEST_ACKNOWLEDGMENT_OF_RECEIPT",
    executive_comment: "CONFIRM_PAYMENT_IN_STATEMENT",
    targetPhase: 7,
    fields: [],
  },
  {
    id: "document_in_litigation_request_acknowledgment_of_receipt",
    label: "",
    description: "Documento en litigio",
    management_type: "CALL_OUT",
    debtor_comment: "REQUEST_ACKNOWLEDGMENT_OF_RECEIPT",
    executive_comment: "DOCUMENT_IN_LITIGATION",
    targetPhase: 2,
    fields: [],
  },
  {
    id: "apply_credit_note_request_apply_available_credit_note",
    label: "",
    description: "Aplicar N/C",
    management_type: "CALL_OUT",
    debtor_comment: "REQUEST_APPLY_AVAILABLE_CREDIT_NOTE",
    executive_comment: "APPLY_CREDIT_NOTE",
    targetPhase: 4,
    fields: [],
  },
  // PROBLEMAS DE CAJA
  {
    id: "debtor_unreachable_cash_flow_problems",
    label: "",
    description: "Deudor inubicable",
    management_type: "CALL_OUT",
    debtor_comment: "CASH_FLOW_PROBLEMS",
    executive_comment: "DEBTOR_UNREACHABLE",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "suggest_send_to_dicom_cash_flow_problems",
    label: "",
    description: "Se sugiere enviar a Dicom",
    management_type: "CALL_OUT",
    debtor_comment: "CASH_FLOW_PROBLEMS",
    executive_comment: "SUGGEST_SEND_TO_DICOM",
    targetPhase: 1,
    fields: [],
  },
  // INFORMADO BLOQUEO DE PEDIDOS
  {
    id: "service_cut_order_blocking",
    label: "",
    description: "Corte de servicio",
    management_type: "CALL_OUT",
    debtor_comment: "INFORMED_ORDER_BLOCKING",
    executive_comment: "SERVICE_CUT",
    targetPhase: 1,
    fields: [],
  },
  // INFORMADO DOCUMENTO PROTESTADO
  {
    id: "informed_protested_document",
    label: "",
    description: "Envío de información",
    management_type: "CALL_OUT",
    debtor_comment: "INFORMED_PROTESTED_DOCUMENT",
    executive_comment: "INFORMATION_SENT",
    targetPhase: 4,
    fields: [],
  },
  {
    id: "increase_pressure_informed_protested_document",
    label: "",
    description: "Aumentar presión",
    management_type: "CALL_OUT",
    debtor_comment: "INFORMED_PROTESTED_DOCUMENT",
    executive_comment: "INCREASE_PRESSURE",
    targetPhase: 4,
    fields: [],
  },
  {
    id: "redeposit_document_informed_protested_document",
    label: "",
    description: "Redepositar documento",
    management_type: "CALL_OUT",
    debtor_comment: "INFORMED_PROTESTED_DOCUMENT",
    executive_comment: "REDEPOSIT_DOCUMENT",
    targetPhase: 4,
    fields: [],
  },
  // ENVIO CEDIBLE / GUIA DE DESPACHO
  {
    id: "dispatch_guide_sent_assignable_document_dispatch_guide_sent",
    label: "",
    description: "Envío de Guía de Despacho",
    management_type: "CALL_OUT",
    debtor_comment: "ASSIGNABLE_DOCUMENT_DISPATCH_GUIDE_SENT",
    executive_comment: "DISPATCH_GUIDE_SENT",
    targetPhase: 1,
    fields: [],
  },
  {
    id: "dispatch_guide_sent_assignable_document_dispatch_guide_sent",
    label: "",
    description: "Envío de Guía de Despacho",
    management_type: "CALL_OUT",
    debtor_comment: "ASSIGNABLE_DOCUMENT_DISPATCH_GUIDE_SENT",
    executive_comment: "DISPATCH_GUIDE_SENT",
    targetPhase: 1,
    fields: [],
  },
  // REVISARA TEMA
  {
    id: "information_sent_will_review_issue",
    label: "",
    description: "Envío de información",
    management_type: "CALL_OUT",
    debtor_comment: "WILL_REVIEW_ISSUE",
    executive_comment: "INFORMATION_SENT",
    targetPhase: 1,
    fields: [
      {
        name: "notificationText",
        label: "Le notifico que",
        type: "textarea",
        required: true,
        placeholder: "Detalles de la información enviada...",
      },
    ],
  },
  {
    id: "increase_pressure_will_review_issue",
    label: "",
    description: "Aumentar presión",
    management_type: "CALL_OUT",
    debtor_comment: "WILL_REVIEW_ISSUE",
    executive_comment: "INCREASE_PRESSURE",
    targetPhase: 1,
    fields: [
      {
        name: "notificationText",
        label: "Le notifico que",
        type: "textarea",
        required: true,
        placeholder: "Detalles de la información enviada...",
      },
    ],
  },
  {
    id: "no_progress_will_review_issue",
    label: "",
    description: "Sin progreso",
    management_type: "CALL_OUT",
    debtor_comment: "WILL_REVIEW_ISSUE",
    executive_comment: "NO_PROGRESS",
    targetPhase: 1,
    fields: [
      {
        name: "notificationText",
        label: "Le notifico que",
        type: "textarea",
        required: true,
        placeholder: "Detalles de la información enviada...",
      },
    ],
  },
  // CONTABILIZA SIN COMPROMISO DE PAGO
  {
    id: "no_contact_accounted_without_payment_commitment",
    label: "",
    description: "Sin contacto",
    management_type: "CALL_OUT",
    debtor_comment: "ACCOUNTED_WITHOUT_PAYMENT_COMMITMENT",
    executive_comment: "NO_CONTACT",
    targetPhase: 4,
    fields: [],
  },
  {
    id: "no_progress_accounted_without_payment_commitment",
    label: "",
    description: "Sin progreso",
    management_type: "CALL_OUT",
    debtor_comment: "ACCOUNTED_WITHOUT_PAYMENT_COMMITMENT",
    executive_comment: "NO_PROGRESS",
    targetPhase: 4,
    fields: [],
  },
  // COMPROMISO INCUMPLIDO
  {
    id: "increase_pressure_commitment_breached",
    label: "",
    description: "Aumentar presión",
    management_type: "CALL_OUT",
    debtor_comment: "COMMITMENT_BREACHED",
    executive_comment: "INCREASE_PRESSURE",
    targetPhase: 6,
    fields: [],
  },
  {
    id: "no_contact_commitment_breached",
    label: "",
    description: "Sin contacto",
    management_type: "CALL_OUT",
    debtor_comment: "COMMITMENT_BREACHED",
    executive_comment: "NO_CONTACT",
    targetPhase: 6,
    fields: [],
  },
  {
    id: "no_progress_commitment_breached",
    label: "",
    description: "Sin progreso",
    management_type: "CALL_OUT",
    debtor_comment: "COMMITMENT_BREACHED",
    executive_comment: "NO_PROGRESS",
    targetPhase: 6,
    fields: [],
  },
  // MOTIVO DE NO PAGO
  {
    id: "no_progress_reason_for_non_payment",
    label: "",
    description: "Sin progreso",
    management_type: "CALL_OUT",
    debtor_comment: "REASON_FOR_NON_PAYMENT",
    executive_comment: "NO_PROGRESS",
    targetPhase: 4,
    fields: [
      {
        name: "selectionOption",
        label: "Acción a tomar",
        type: "select",
        required: true,
        options: [
          { value: "APPROVAL", label: "Por aprobación" },
          { value: "WAITING_FOR_SIGNATURE", label: "A la espera de firma" },
          {
            value: "WAITING_FOR_GOVERNMENT_FUNDS",
            label: "Se esperan fondos del gobierno",
          },
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
  // NOTIFICADO DE POSIBLE BLOQUEO DE PEDIDOS
  {
    id: "suggest_order_blocking_notified_possible_order_blocking",
    label: "",
    description: "Sugerir bloqueo de pedidos",
    management_type: "CALL_OUT",
    debtor_comment: "NOTIFIED_POSSIBLE_ORDER_BLOCKING",
    executive_comment: "SUGGEST_ORDER_BLOCKING",
    targetPhase: 1,
    fields: [],
  },
  // INFORMO MOTIVO DE RECHAZO SII
  {
    id: "information_sent_inform_sii_rejection_reason",
    label: "",
    description: "Informo motivo de rechazo SII",
    management_type: "CALL_OUT",
    debtor_comment: "INFORM_SII_REJECTION_REASON",
    executive_comment: "INFORMATION_SENT",
    targetPhase: 2,
    fields: [],
  },
  // FACTURA REGISTRADA EN CONTABILIDAD
  {
    id: "accounted_invoice_registered_in_accounting",
    label: "",
    description: "Contabilizada",
    management_type: "CALL_OUT",
    debtor_comment: "INVOICE_REGISTERED_IN_ACCOUNTING",
    executive_comment: "ACCOUNTED",
    targetPhase: 4,
    fields: [],
  },
  // NOTIFICADO DE PUBLICACION EN INFORMES COMERCIALES
  {
    id: "information_sent_notified_commercial_reports_publication",
    label: "",
    description: "Envío de información",
    management_type: "CALL_OUT",
    debtor_comment: "NOTIFIED_COMMERCIAL_REPORTS_PUBLICATION",
    executive_comment: "INFORMATION_SENT",
    targetPhase: 1,
    fields: [],
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
  {
    value: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
    label: "Documentos sin compromiso de pago",
  },
  {
    value: "REQUEST_CREDIT_NOTES_SENDING",
    label: "Solicito envío de notas de crédito",
  },
  {
    value: "REQUEST_ACKNOWLEDGMENT_OF_RECEIPT",
    label: "Solicito acuse de recibo",
  },
  {
    value: "REQUEST_APPLY_AVAILABLE_CREDIT_NOTE",
    label: "Solicita aplicar nota de crédito disponible",
  },
  {
    value: "CASH_FLOW_PROBLEMS",
    label: "Problemas de caja",
  },
  {
    value: "INFORMED_PROTESTED_DOCUMENT",
    label: "Informado documento protestado",
  },
  {
    value: "INFORMED_ORDER_BLOCKING",
    label: "Informado bloqueo de pedidos",
  },
  {
    value: "ASSIGNABLE_DOCUMENT_DISPATCH_GUIDE_SENT",
    label: "Envío cedible/ Guía de despacho",
  },
  {
    value: "WILL_REVIEW_ISSUE",
    label: "Revisará tema",
  },
  {
    value: "ACCOUNTED_WITHOUT_PAYMENT_COMMITMENT",
    label: "Contabilizada sin compromiso de pago",
  },
  {
    value: "COMMITMENT_BREACHED",
    label: "Compromiso incumplido",
  },
  {
    value: "NOTIFIED_POSSIBLE_ORDER_BLOCKING",
    label: "Notificado de posible bloqueo de pedidos",
  },
  {
    value: "INFORM_SII_REJECTION_REASON",
    label: "Informo motivo de rechazo SII",
  },
  {
    value: "INVOICE_REGISTERED_IN_ACCOUNTING",
    label: "Contabilizada",
  },
  {
    value: "NOTIFIED_COMMERCIAL_REPORTS_PUBLICATION",
    label: "Notificado de publicación en informes comerciales",
  },
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
    label: "Envío estado de cuenta",
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
  // {
  //   value: "LITIGATION_NORMALIZATION",
  //   label: "Normalización de litigio",
  //   managementType: "INVOICE_WITH_LITIGATION",
  // },
  {
    value: "NEED_PAYMENT_PLAN",
    label: "Necesito plan de pago",
    managementType: "NEED_PAYMENT_PLAN",
  },
  {
    value: "CHECK_CONFIRMED",
    label: "Cheque confirmado",
    managementType: "CHECK_CONFIRMED",
  },
  {
    value: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
    label: "Documentos sin compromiso de pago",
    managementType: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
  },
  // SOLICITO ENVÍO DE NOTAS DE CRÉDITO
  {
    value: "REQUEST_CREDIT_NOTES_SENDING",
    label: "Solicito envío de notas de crédito",
    managementType: "REQUEST_CREDIT_NOTES_SENDING",
  },
  // SOLICITO ACUSE DE RECIBO
  {
    value: "REQUEST_ACKNOWLEDGMENT_OF_RECEIPT",
    label: "Solicito acuse de recibo",
    managementType: "REQUEST_ACKNOWLEDGMENT_OF_RECEIPT",
  },
  // SOLICITO APLICAR NOTA DE CRÉDITO DISPONIBLE
  {
    value: "REQUEST_APPLY_AVAILABLE_CREDIT_NOTE",
    label: "Solicita aplicar nota de crédito disponible",
    managementType: "REQUEST_APPLY_AVAILABLE_CREDIT_NOTE",
  },
  // PROBLEMAS DE CAJA
  {
    value: "CASH_FLOW_PROBLEMS",
    label: "Problemas de Caja",
    managementType: "CASH_FLOW_PROBLEMS",
  },
  // INFORMADO DOCUMENTO PROTESTADO
  {
    value: "INFORMED_PROTESTED_DOCUMENT",
    label: "Informado documento protestado",
    managementType: "INFORMED_PROTESTED_DOCUMENT",
  },
  // INFORMADO BLOQUEO DE PEDIDOS
  {
    value: "INFORMED_ORDER_BLOCKING",
    label: "Informado bloqueo de pedidos",
    managementType: "INFORMED_ORDER_BLOCKING",
  },
  // ENVIO CEDIBLE / GUIA DE DESPACHO
  {
    value: "ASSIGNABLE_DOCUMENT_DISPATCH_GUIDE_SENT",
    label: "Envío cedible/ Guía de despacho",
    managementType: "ASSIGNABLE_DOCUMENT_DISPATCH_GUIDE_SENT",
  },
  // REVISARA TEMA
  {
    value: "WILL_REVIEW_ISSUE",
    label: "Revisará tema",
    managementType: "WILL_REVIEW_ISSUE",
  },
  // CONTABILIZA SIN COMPROMISO DE PAGO
  {
    value: "ACCOUNTED_WITHOUT_PAYMENT_COMMITMENT",
    label: "Contabilizada sin compromiso de pago",
    managementType: "ACCOUNTED_WITHOUT_PAYMENT_COMMITMENT",
  },
  // COMPROMISO INCUMPLIDO
  {
    value: "COMMITMENT_BREACHED",
    label: "Compromiso incumplido",
    managementType: "COMMITMENT_BREACHED",
  },
  // MOTIVO DE NO PAGO
  {
    value: "REASON_FOR_NON_PAYMENT",
    label: "Motivo de no pago",
    managementType: "REASON_FOR_NON_PAYMENT",
  },
  // NOTIFICADO DE POSIBLE BLOQUEO DE PEDIDOS
  {
    value: "NOTIFIED_POSSIBLE_ORDER_BLOCKING",
    label: "Notificado de posible bloqueo de pedidos",
    managementType: "NOTIFIED_POSSIBLE_ORDER_BLOCKING",
  },
  // INFORMO MOTIVO DE RECHAZO SII
  {
    value: "INFORM_SII_REJECTION_REASON",
    label: "Informo motivo de rechazo SII",
    managementType: "INFORM_SII_REJECTION_REASON",
  },
  // FACTURA REGISTRADA EN CONTABILIDAD
  {
    value: "INVOICE_REGISTERED_IN_ACCOUNTING",
    label: "Contabilizada",
    managementType: "INVOICE_REGISTERED_IN_ACCOUNTING",
  },
  // NOTIFICADO DE PUBLICACION EN INFORMES COMERCIALES
  {
    value: "NOTIFIED_COMMERCIAL_REPORTS_PUBLICATION",
    label: "Notificado de publicación en informes comerciales",
    managementType: "NOTIFIED_COMMERCIAL_REPORTS_PUBLICATION",
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
    value: "UNREACHABLE_DEBTOR",
    label: "Deudor inubicable",
    debtorComment: "CONTACT_NOT_RESPONDING",
  },
  {
    value: "INFORMATION_SENT",
    label: "Envío de información",
    debtorComment: "CONTACT_NOT_RESPONDING",
  },
  {
    value: "INCREASE_PRESSURE",
    label: "Aumentar Presión",
    debtorComment: "CONTACT_NOT_RESPONDING",
  },
  {
    value: "NO_CONTACT",
    label: "Sin contacto",
    debtorComment: "CONTACT_NOT_RESPONDING",
  },
  {
    value: "MEETING_REQUESTED_TO_DEBTOR",
    label: "Se solicitará reunión a Deudor",
    debtorComment: "CONTACT_NOT_RESPONDING",
  },
  {
    value: "INFORMATION_SENT",
    label: "Envío estado de cuenta",
    debtorComment: "STATEMENT_SENT",
  },
  {
    value: "INCREASE_PRESSURE",
    label: "Aumentar Presión",
    debtorComment: "STATEMENT_SENT",
  },
  {
    value: "NO_PROGRESS",
    label: "Sin progreso",
    debtorComment: "STATEMENT_SENT",
  },
  {
    value: "INVOICE_PDF_SENT",
    label: "Se envió pdf de factura",
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

  // DOCUMENTO SIN COMPROMISO DE PAGO
  {
    value: "DEBTOR_UNREACHABLE",
    label: "Deudor inubicable",
    debtorComment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
  },
  {
    value: "INFORMATION_SENT",
    label: "Envío de información",
    debtorComment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
  },
  {
    value: "INCREASE_PRESSURE",
    label: "Aumentar Presión",
    debtorComment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
  },
  {
    value: "NO_CONTACT",
    label: "Sin contacto",
    debtorComment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
  },
  {
    value: "NO_PROGRESS",
    label: "Sin progreso",
    debtorComment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
  },
  {
    value: "MEETING_WITH_DEBTOR_REQUESTED",
    label: "Se solicitará reunión a Deudor",
    debtorComment: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
  },

  // SOLICITO ENVÍO DE NOTAS DE CRÉDITO
  {
    value: "INFORMATION_SENT",
    label: "Envío de información",
    debtorComment: "REQUEST_CREDIT_NOTES_SENDING",
  },

  // SOLICITO ACUSE DE RECIBO
  {
    value: "APPLY_CREDIT_NOTE",
    label: "Aplicar N/C",
    debtorComment: "REQUEST_ACKNOWLEDGMENT_OF_RECEIPT",
  },
  {
    value: "CONFIRM_PAYMENT_IN_STATEMENT",
    label: "Confirmar abono en cartola",
    debtorComment: "REQUEST_ACKNOWLEDGMENT_OF_RECEIPT",
  },
  {
    value: "DOCUMENT_IN_LITIGATION",
    label: "Documento en litigio",
    debtorComment: "REQUEST_ACKNOWLEDGMENT_OF_RECEIPT",
  },
  // SOLICITO APLICAR NOTA DE CRÉDITO DISPONIBLE
  {
    value: "APPLY_CREDIT_NOTE",
    label: "Aplicar N/C",
    debtorComment: "REQUEST_APPLY_AVAILABLE_CREDIT_NOTE",
  },
  // PROBLEMAS DE CAJA
  {
    value: "DEBTOR_UNREACHABLE",
    label: "Deudor inubicable",
    debtorComment: "CASH_FLOW_PROBLEMS",
  },
  {
    value: "SUGGEST_SEND_TO_DICOM",
    label: "Se sugiere enviar a Dicom",
    debtorComment: "CASH_FLOW_PROBLEMS",
  },
  // INFORMADO BLOQUEO DE PEDIDOS
  {
    value: "SERVICE_CUT",
    label: "Corte de servicio",
    debtorComment: "INFORMED_ORDER_BLOCKING",
  },
  // INFORMADO DOCUMENTO PROTESTADO
  {
    value: "INFORMATION_SENT",
    label: "Envío de información",
    debtorComment: "INFORMED_PROTESTED_DOCUMENT",
  },
  {
    value: "INCREASE_PRESSURE",
    label: "Aumentar presión",
    debtorComment: "INFORMED_PROTESTED_DOCUMENT",
  },
  {
    value: "REDEPOSIT_DOCUMENT",
    label: "Redepositar documento",
    debtorComment: "INFORMED_PROTESTED_DOCUMENT",
  },
  // ENVIO CEDIBLE / GUIA DE DESPACHO
  {
    value: "SEND_ASSIGNABLE_INVOICE_COPY",
    label: "Enviar copia cedible factura",
    debtorComment: "ASSIGNABLE_DOCUMENT_DISPATCH_GUIDE_SENT",
  },
  {
    value: "DISPATCH_GUIDE_SENT",
    label: "Envío de Guía de Despacho",
    debtorComment: "ASSIGNABLE_DOCUMENT_DISPATCH_GUIDE_SENT",
  },
  // REVISARA TEMA
  {
    value: "INFORMATION_SENT",
    label: "Envío de información",
    debtorComment: "WILL_REVIEW_ISSUE",
  },
  {
    value: "INCREASE_PRESSURE",
    label: "Aumentar presión",
    debtorComment: "WILL_REVIEW_ISSUE",
  },
  {
    value: "NO_PROGRESS",
    label: "Sin progreso",
    debtorComment: "WILL_REVIEW_ISSUE",
  },
  // CONTABILIZA SIN COMPROMISO DE PAGO
  {
    value: "NO_CONTACT",
    label: "Sin contacto",
    debtorComment: "ACCOUNTED_WITHOUT_PAYMENT_COMMITMENT",
  },
  {
    value: "NO_PROGRESS",
    label: "Sin progreso",
    debtorComment: "ACCOUNTED_WITHOUT_PAYMENT_COMMITMENT",
  },
  // COMPROMISO INCUMPLIDO
  {
    value: "INCREASE_PRESSURE",
    label: "Aumentar presión",
    debtorComment: "COMMITMENT_BREACHED",
  },
  {
    value: "NO_CONTACT",
    label: "Sin contacto",
    debtorComment: "COMMITMENT_BREACHED",
  },
  {
    value: "NO_PROGRESS",
    label: "Sin progreso",
    debtorComment: "COMMITMENT_BREACHED",
  },
  // MOTIVO DE NO PAGO
  {
    value: "NO_PROGRESS",
    label: "Sin progreso",
    debtorComment: "REASON_FOR_NON_PAYMENT",
  },
  // NOTIFICADO DE POSIBLE BLOQUEO DE PEDIDOS
  {
    value: "SUGGEST_ORDER_BLOCKING",
    label: "Sugerir bloqueo de pedidos",
    debtorComment: "NOTIFIED_POSSIBLE_ORDER_BLOCKING",
  },
  // INFORMO MOTIVO DE RECHAZO SII
  {
    value: "INFORMATION_SENT",
    label: "Informo motivo de rechazo SII",
    debtorComment: "INFORM_SII_REJECTION_REASON",
  },
  // FACTURA REGISTRADA EN CONTABILIDAD
  {
    value: "ACCOUNTED",
    label: "Contabilizada",
    debtorComment: "INVOICE_REGISTERED_IN_ACCOUNTING",
  },
  // NOTIFICADO DE PUBLICACION EN INFORMES COMERCIALES
  {
    value: "INFORMATION_SENT",
    label: "Envío de información",
    debtorComment: "NOTIFIED_COMMERCIAL_REPORTS_PUBLICATION",
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
  const filtreApplied = EXECUTIVE_COMMENTS.filter(
    (c) => c.debtorComment === debtorComment
  );
  return filtreApplied;
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
      // c.management_type === managementType &&
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

export const NORMAL_CLIENTS = [
  {
    label: "Depositará o hará transferencia",
    code: "WILL_DEPOSIT_OR_TRANSFER",
    executive_comments: [
      {
        label: "Con Compromiso de pago",
        code: "WITH_PAYMENT_COMMITMENT",
        fase: 5,
      },
    ],
  },
  {
    label: "Depositó o transfirió",
    code: "DEPOSITED_OR_TRANSFERRED",
    executive_comments: [
      {
        label: "Confirmar abono en cartola",
        code: "CONFIRM_PAYMENT_IN_STATEMENT",
        fase: 7,
      },
    ],
  },
  {
    label: "Contacto no responde",
    code: "CONTACT_NOT_RESPONDING",
    executive_comments: [
      {
        label: "Deudor inubicable",
        code: "DEBTOR_UNREACHABLE",
        fase: 1,
      },
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 1,
      },
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 1,
      },
      {
        label: "Sin contacto",
        code: "NO_CONTACT",
        fase: 1,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 1,
      },
      {
        label: "Se solicitará reunión a Deudor",
        code: "MEETING_WITH_DEBTOR_REQUESTED",
        fase: 1,
      },
    ],
  },
  {
    label: "Sin Fondos",
    code: "NO_FUNDS",
    executive_comments: [
      {
        label: "Se sugiere enviar a Dicom",
        code: "SUGGEST_SEND_TO_DICOM",
        fase: 1,
      },
    ],
  },
  {
    label: "Factura con Litigio",
    code: "INVOICE_WITH_LITIGATION",
    executive_comments: [
      {
        label: "Aplicar N/C",
        code: "APPLY_CREDIT_NOTE",
        fase: 2,
      },
      {
        label: "Documento en litigio",
        code: "DOCUMENT_IN_LITIGATION",
        fase: 2,
      },
    ],
  },
  {
    label: "Envío estado de cuenta",
    code: "STATEMENT_SENT",
    executive_comments: [
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 1,
      },
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 1,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 1,
      },
      {
        label: "Se envió pdf de factura",
        code: "INVOICE_PDF_SENT",
        fase: 1,
      },
    ],
  },
  {
    label: "Documentos sin compromiso de pago",
    code: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
    executive_comments: [
      {
        label: "Deudor inubicable",
        code: "DEBTOR_UNREACHABLE",
        fase: 1,
      },
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 1,
      },
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 1,
      },
      {
        label: "Sin contacto",
        code: "NO_CONTACT",
        fase: 1,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 1,
      },
      {
        label: "Se solicitará reunión a Deudor",
        code: "MEETING_WITH_DEBTOR_REQUESTED",
        fase: 1,
      },
    ],
  },
  {
    label: "Pago realizado e identificado",
    code: "PAYMENT_MADE_AND_IDENTIFIED",
    executive_comments: [
      {
        label: "Pago parcial o detalle incompleto",
        code: "PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL",
        fase: 1,
      },
    ],
  },
  {
    label: "Solicito envío de Notas de Crédito",
    code: "REQUEST_CREDIT_NOTES_SENDING",
    executive_comments: [
      {
        label: "Envío de información",
        code: "REQUEST_CREDIT_NOTES_SENDING",
        fase: 3,
      },
    ],
  },
  {
    label: "Solicito acuse de recibo",
    code: "REQUEST_ACKNOWLEDGMENT_OF_RECEIPT",
    executive_comments: [
      {
        label: "Aplicar N/C",
        code: "APPLY_CREDIT_NOTE",
        fase: 3,
      },
      {
        label: "Confirmar abono en cartola",
        code: "CONFIRM_PAYMENT_IN_STATEMENT",
        fase: 7,
      },
      {
        label: "Documento en litigio",
        code: "DOCUMENT_IN_LITIGATION",
        fase: 2,
      },
    ],
  },
  {
    label: "Solicita aplicar nota de crédito disponible",
    code: "REQUEST_APPLY_AVAILABLE_CREDIT_NOTE",
    executive_comments: [
      {
        label: "Aplicar N/C",
        code: "APPLY_CREDIT_NOTE",
        fase: 4,
      },
    ],
  },
  {
    label: "Problemas de Caja",
    code: "CASH_FLOW_PROBLEMS",
    executive_comments: [
      {
        label: "Deudor inubicable",
        code: "DEBTOR_UNREACHABLE",
        fase: 1,
      },
      {
        label: "Se sugiere enviar a Dicom",
        code: "SUGGEST_SEND_TO_DICOM",
        fase: 1,
      },
    ],
  },
  {
    label: "Informado Bloqueo de Pedidos",
    code: "INFORMED_ORDER_BLOCKING",
    executive_comments: [
      {
        label: "Corte de Servicio",
        code: "SERVICE_CUT",
        fase: 1,
      },
    ],
  },
  {
    label: "Informado Documento Protestado",
    code: "INFORMED_PROTESTED_DOCUMENT",
    executive_comments: [
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 4,
      },
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 4,
      },
      {
        label: "Redepositar documento",
        code: "REDEPOSIT_DOCUMENT",
        fase: 4,
      },
    ],
  },
  {
    label: "Envío Cedible/ Guía de Despacho",
    code: "ASSIGNABLE_DOCUMENT_DISPATCH_GUIDE_SENT",
    executive_comments: [
      {
        label: "Enviar copia cedible factura",
        code: "SEND_ASSIGNABLE_INVOICE_COPY",
        fase: 1,
      },
      {
        label: "Envío de Guía de Despacho",
        code: "DISPATCH_GUIDE_SENT",
        fase: 1,
      },
    ],
  },
  {
    label: "Revisará tema",
    code: "WILL_REVIEW_ISSUE",
    executive_comments: [
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 1,
      },
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 1,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 1,
      },
    ],
  },
  {
    label: "Cheque Confirmado",
    code: "CHECK_CONFIRMED",
    executive_comments: [
      {
        label: "Con Compromiso de pago",
        code: "WITH_PAYMENT_COMMITMENT",
        fase: 5,
      },
    ],
  },
  {
    label: "Necesito Plan de Pago",
    code: "NEED_PAYMENT_PLAN",
    executive_comments: [
      {
        label: "Solicitud de aprobación de Plan de Pago",
        code: "PAYMENT_PLAN_APPROVAL_REQUEST",
        fase: 4,
      },
    ],
  },
  {
    label: "Contabilizada sin Compromiso de Pago",
    code: "ACCOUNTED_WITHOUT_PAYMENT_COMMITMENT",
    executive_comments: [
      {
        label: "Sin contacto",
        code: "NO_CONTACT",
        fase: 4,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 4,
      },
    ],
  },
  {
    label: "Compromiso incumplido",
    code: "COMMITMENT_BREACHED",
    executive_comments: [
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 6,
      },
      {
        label: "Sin contacto",
        code: "NO_CONTACT",
        fase: 6,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 6,
      },
    ],
  },
  {
    label: "Motivo de no pago",
    code: "REASON_FOR_NON_PAYMENT",
    executive_comments: [
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 4,
      },
    ],
  },
  {
    label: "Notificado de Posible Bloqueo de Pedidos",
    code: "NOTIFIED_POSSIBLE_ORDER_BLOCKING",
    executive_comments: [
      {
        label: "Sugerir Bloqueo de pedidos",
        code: "SUGGEST_ORDER_BLOCKING",
        fase: 1,
      },
    ],
  },
  {
    label: "Informo Motivo de rechazo SII",
    code: "INFORM_SII_REJECTION_REASON",
    executive_comments: [
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 2,
      },
    ],
  },
  {
    label: "Factura registrada en Contabilidad",
    code: "INVOICE_REGISTERED_IN_ACCOUNTING",
    executive_comments: [
      {
        label: "Contabilizada",
        code: "ACCOUNTED",
        fase: 4,
      },
    ],
  },
  {
    label: "Factura no registrada en contabilidad",
    code: "INVOICE_NOT_REGISTERED_IN_ACCOUNTING",
    executive_comments: [
      {
        label: "No contabilizada",
        code: "NOT_ACCOUNTED",
        fase: 3,
      },
    ],
  },
  {
    label: "Notificado de Publicación en Informes Comerciales",
    code: "NOTIFIED_COMMERCIAL_REPORTS_PUBLICATION",
    executive_comments: [
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 1,
      },
    ],
  },
];

export const FACTORING_CLIENTS = [
  {
    label: "Contacto no responde",
    code: "CONTACT_NOT_RESPONDING",
    executive_comments: [
      {
        label: "Deudor inubicable",
        code: "DEBTOR_UNREACHABLE",
        fase: 1,
      },
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 1,
      },
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 1,
      },
      {
        label: "Sin contacto",
        code: "NO_CONTACT",
        fase: 1,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 1,
      },
    ],
  },
  {
    label: "Sin Fondos",
    code: "NO_FUNDS",
    executive_comments: [
      {
        label: "Se sugiere enviar a Dicom",
        code: "SUGGEST_SEND_TO_DICOM",
        fase: 1,
      },
    ],
  },
  {
    label: "Envío Estado de Cuenta",
    code: "STATEMENT_SENT",
    executive_comments: [
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 1,
      },
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 1,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 1,
      },
      {
        label: "Se envió pdf de factura",
        code: "INVOICE_PDF_SENT",
        fase: 1,
      },
    ],
  },
  {
    label: "Documentos Sin compromiso de pago",
    code: "DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT",
    executive_comments: [
      {
        label: "Deudor inubicable",
        code: "DEBTOR_UNREACHABLE",
        fase: 1,
      },
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 1,
      },
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 1,
      },
      {
        label: "Sin contacto",
        code: "NO_CONTACT",
        fase: 1,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 1,
      },
    ],
  },
  {
    label: "Pago realizado e identificado",
    code: "PAYMENT_MADE_AND_IDENTIFIED",
    executive_comments: [
      {
        label: "Pago parcial o detalle incompleto",
        code: "PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL",
        fase: 1,
      },
    ],
  },
  {
    label: "Revisará tema",
    code: "WILL_REVIEW_ISSUE",
    executive_comments: [
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 1,
      },
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 1,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 1,
      },
    ],
  },
  {
    label: "Solicito Certificado de Cesión de Factura",
    code: "SOLICITO_CERTIFICADO_DE_CESI_N_DE_FACTURA",
    executive_comments: [
      {
        label: "Envío de Cesión",
        code: "ENV_O_DE_CESI_N",
        fase: 1,
      },
    ],
  },
  {
    label: "Factura con Litigio",
    code: "INVOICE_WITH_LITIGATION",
    executive_comments: [
      {
        label: "Documento en litigio",
        code: "DOCUMENT_IN_LITIGATION",
        fase: 2,
      },
    ],
  },
  {
    label: "Factura en Litigio Pagada al Cliente",
    code: "FACTURA_EN_LITIGIO_PAGADA_AL_CLIENTE",
    executive_comments: [
      {
        label: "Factura Pagada al Cliente",
        code: "FACTURA_PAGADA_AL_CLIENTE",
        fase: 2,
      },
    ],
  },
  {
    label: "Factura no registrada en contabilidad",
    code: "INVOICE_NOT_REGISTERED_IN_ACCOUNTING",
    executive_comments: [
      {
        label: "No contabilizada",
        code: "NOT_ACCOUNTED",
        fase: 3,
      },
    ],
  },
  {
    label: "Informado Documento Protestado",
    code: "INFORMED_PROTESTED_DOCUMENT",
    executive_comments: [
      {
        label: "Envío de información",
        code: "INFORMATION_SENT",
        fase: 4,
      },
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 4,
      },
      {
        label: "Redepositar documento",
        code: "REDEPOSIT_DOCUMENT",
        fase: 4,
      },
    ],
  },
  {
    label: "Necesito Plan de Pago",
    code: "NEED_PAYMENT_PLAN",
    executive_comments: [
      {
        label: "Solicitud de aprobación de Plan de Pago",
        code: "PAYMENT_PLAN_APPROVAL_REQUEST",
        fase: 4,
      },
    ],
  },
  {
    label: "Contabilizada sin Compromiso de Pago",
    code: "ACCOUNTED_WITHOUT_PAYMENT_COMMITMENT",
    executive_comments: [
      {
        label: "Sin contacto",
        code: "NO_CONTACT",
        fase: 4,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 4,
      },
    ],
  },
  {
    label: "Pago Parcial",
    code: "PARTIAL_PAYMENT",
    executive_comments: [
      {
        label: "Pago parcial o detalle incompleto",
        code: "PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL",
        fase: 4,
      },
    ],
  },
  {
    label: "Motivo de no pago",
    code: "REASON_FOR_NON_PAYMENT",
    executive_comments: [
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 4,
      },
    ],
  },
  {
    label: "Factura registrada en Contabilidad",
    code: "INVOICE_REGISTERED_IN_ACCOUNTING",
    executive_comments: [
      {
        label: "Contabilizada",
        code: "ACCOUNTED",
        fase: 4,
      },
    ],
  },
  {
    label: "Depositará o hará transferencia",
    code: "WILL_DEPOSIT_OR_TRANSFER",
    executive_comments: [
      {
        label: "Con Compromiso de pago",
        code: "WITH_PAYMENT_COMMITMENT",
        fase: 5,
      },
    ],
  },
  {
    label: "Cheque Confirmado",
    code: "CHECK_CONFIRMED",
    executive_comments: [
      {
        label: "Con Compromiso de pago",
        code: "WITH_PAYMENT_COMMITMENT",
        fase: 5,
      },
    ],
  },
  {
    label: "Compromiso incumplido",
    code: "COMMITMENT_BREACHED",
    executive_comments: [
      {
        label: "Aumentar Presión",
        code: "INCREASE_PRESSURE",
        fase: 6,
      },
      {
        label: "Sin contacto",
        code: "NO_CONTACT",
        fase: 6,
      },
      {
        label: "Sin progreso",
        code: "NO_PROGRESS",
        fase: 6,
      },
    ],
  },
  {
    label: "Depositó o transfirió",
    code: "DEPOSITED_OR_TRANSFERRED",
    executive_comments: [
      {
        label: "Confirmar abono en cartola",
        code: "CONFIRM_PAYMENT_IN_STATEMENT",
        fase: 7,
      },
    ],
  },
];
