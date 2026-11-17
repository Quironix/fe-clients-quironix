import { formatDateTime, formatNumber } from "@/lib/utils";
import { AuditFieldChange, AuditLog } from "./services";

export const MODULE_LABELS: Record<string, string> = {
  debtors: "Deudores",
  invoices: "Facturas",
  payments: "Pagos",
  payment_plans: "Planes de pago",
  reconciliation: "Conciliación",
  litigations: "Litigios",
  users: "Usuarios",
  roles: "Roles",
  collectors: "Collectors",
  client_settings: "Config. del cliente",
  bulk_upload: "Carga masiva",
};

export const ACTION_LABELS: Record<string, string> = {
  create: "Creó",
  update: "Editó",
  delete: "Borró",
  status_change: "Cambió estado",
  assign: "Asignó",
  approve: "Aprobó",
  reject: "Rechazó",
  object: "Objetó",
  compensate: "Compensó",
  reconcile: "Concilió",
  reverse: "Revirtió",
  normalize: "Normalizó",
  activate: "Activó",
  deactivate: "Desactivó",
  upload: "Subió",
};

// Color del badge por acción: lo destructivo en rojo, lo contable en morado.
export const ACTION_TONES: Record<string, string> = {
  create: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  activate: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  approve: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  upload: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  update: "bg-blue-50 text-blue-700 ring-blue-600/20",
  assign: "bg-blue-50 text-blue-700 ring-blue-600/20",
  normalize: "bg-blue-50 text-blue-700 ring-blue-600/20",
  status_change: "bg-amber-50 text-amber-800 ring-amber-600/20",
  object: "bg-amber-50 text-amber-800 ring-amber-600/20",
  delete: "bg-red-50 text-red-700 ring-red-600/20",
  reject: "bg-red-50 text-red-700 ring-red-600/20",
  deactivate: "bg-red-50 text-red-700 ring-red-600/20",
  reverse: "bg-red-50 text-red-700 ring-red-600/20",
  compensate: "bg-violet-50 text-violet-700 ring-violet-600/20",
  reconcile: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

// Nombres legibles de columnas; si un campo no está aquí se muestra tal cual.
const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  email: "Email",
  phone: "Teléfono",
  phone_number: "Teléfono",
  contacts: "Contactos",
  addresses: "Direcciones",
  address: "Dirección",
  category: "Categoría",
  debtor_code: "Código deudor",
  executive_id: "Ejecutivo",
  sales_person: "Vendedor",
  economic_activities: "Actividades económicas",
  value: "Valor",
  is_default: "Por defecto",
  number: "Número",
  folio: "Folio",
  amount: "Monto",
  balance: "Saldo",
  status: "Estado",
  due_date: "Vencimiento",
  issue_date: "Emisión",
  observations: "Observaciones",
  debtor_id: "Deudor",
  invoice_id: "Factura",
  payment_id: "Pago",
  company_id: "Empresa",
  payment_number: "N° de pago",
  received_at: "Recibido",
  notes: "Notas",
  total_plan_amount: "Monto del plan",
  number_of_installments: "Cuotas",
  approved_by: "Aprobado por",
  rejected_by: "Rechazado por",
  created_by: "Creado por",
  approval_comment: "Comentario de aprobación",
  rejection_comment: "Comentario de rechazo",
  objected_comment: "Comentario de objeción",
  litigation_amount: "Monto en litigio",
  description: "Descripción",
  motivo: "Motivo",
  submotivo: "Submotivo",
  normalization_reason: "Motivo de normalización",
  normalization_by_contact: "Normalizado por",
  annual_interest_rate: "Interés anual (%)",
  approved_at: "Aprobado el",
  rejected_at: "Rechazado el",
  currency: "Moneda",
  debt_concept: "Concepto de la deuda",
  document_type: "Tipo de documento",
  file: "Archivo",
  ingress_type: "Tipo de ingreso",
  initial_payment: "Pie",
  installment_amount: "Monto cuota",
  invoice_ids: "Facturas del plan",
  is_fictitious: "Ficticia",
  is_internal_document: "Documento interno",
  litigation_balance: "Saldo en litigio",
  payment_start_date: "Inicio de pagos",
  payment_end_date: "Fin de pagos",
  payment_frequency: "Frecuencia",
  payment_method: "Medio de pago",
  plan_start_date: "Inicio del plan",
  sip_code: "Código SIP",
  total_debt: "Deuda total",
  estado: "Estado",
  first_name: "Nombre",
  last_name: "Apellido",
  password: "Contraseña",
  roles: "Roles",
  permisos: "Permisos",
  subject: "Asunto",
  body_message: "Mensaje",
  filename: "Archivo",
  facturas: "Facturas",
  pagos: "Pagos",
  movimientos: "Movimientos",
  notas: "Notas",
  alcance: "Alcance",
  factura: "Factura",
  archivo: "Archivo",
  quitada: "Empresa quitada",
  validCount: "Filas válidas",
  invalidCount: "Filas con error",
  totalCount: "Filas",
  schema: "Tipo",
  movement_date: "Fecha movimiento",
  // Configuración de proyección
  consider_litigation: "Considerar litigios",
  litigation: "% litigios",
  consider_commercial_agreement_invoices: "Considerar acuerdos comerciales",
  nc_cutoff_days: "Días de corte NC",
  upper_range_percentage: "% rango superior",
  lower_range_percentage: "% rango inferior",
  consider_average_n_months: "Considerar promedio de meses",
  months: "Meses",
  factor: "Factor",
  is_active: "Activa",
  // Collectors
  type: "Tipo",
  channel: "Canal",
  debt_phases: "Fases de deuda",
  segmentations: "Segmentaciones",
  send_associate_invoices: "Adjuntar facturas",
  send_associate_receipts: "Adjuntar comprobantes",
  once_per_document: "Una vez por documento",
};

// Estados que llegan como códigos (facturas, movimientos, litigios, planes).
const VALUE_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  CANCELED: "Anulada",
  CANCELLED: "Cancelado",
  LITIGATION: "En litigio",
  PARTIAL_PAYMENT: "Pago parcial",
  IN_PAYMENT_PLAN: "En plan de pago",
  PROCESSED: "Procesado",
  REJECTED: "Rechazado",
  ELIMINATED: "Eliminado",
  ELIMINATED_NO_TRACKING: "Eliminado (sin seguimiento)",
  ELIMINATED_NEGATIVE_AMOUNT: "Eliminado (monto negativo)",
  COMPENSATED: "Compensado",
  PAYMENT_CREATED: "Pago creado",
  REJECTED_DUPLICATE: "Rechazado (duplicado)",
  MAINTAINED: "Mantenido",
  MULTIPLE_SUGGESTIONS: "Varias sugerencias",
  IN_REVIEW: "En revisión",
  APPROVED: "Aprobado",
  NORMALIZED: "Normalizado",
  OBJECTED: "Objetado",
  DUE_DATE_CHANGE: "Cambio de vencimiento",
  RECEPTION_RECEIPT_FOUND: "Acuse de recibo encontrado",
  DISCOUNT_NOT_APPLICABLE: "Descuento no aplica",
  COMMERCIAL_INVOICE_NOT_APPLICABLE: "Factura comercial no aplica",
  ADMINISTRATIVE_CREDIT_NOTE_ISSUED: "Nota de crédito emitida",
  RISK_CLASSIFICATION: "Clasificación de riesgo",
  CREDIT_LINE: "Línea de crédito",
  CREDIT_LINE_AMOUNT: "Monto línea de crédito",
  CREDIT_LINE_TOLERANCE: "Tolerancia línea de crédito",
  CREDIT_STATUS: "Estado de crédito",
  PAYMENT_METHOD: "Medio de pago",
  PAYMENT_TERMS: "Condición de pago",
  RISK_SCORE: "Puntaje de riesgo",
  CUSTOM: "Dato personalizado",
  manual_correction: "Corrección manual",
  customer_dispute: "Disputa del cliente",
  system_error: "Error del sistema",
  accounting_adjustment: "Ajuste contable",
  CLIENT: "Propio",
  TEMPLATE: "Plantilla",
  FREQ_7_DAYS: "Cada 7 días",
  FREQ_15_DAYS: "Cada 15 días",
  FREQ_30_DAYS: "Cada 30 días",
  FREQ_45_DAYS: "Cada 45 días",
  DEBTORS: "Deudores",
  INVOICES: "Facturas",
  PAYMENTS: "Pagos",
  MOVEMENTS: "Movimientos bancarios",
  COMPANIES: "Empresas",
  EMAIL: "Correo",
  BANK_TRANSFER: "Transferencia",
  MANUAL: "Manual",
};

// Booleanos con un nombre mejor que Sí/No.
const BOOLEAN_LABELS: Record<string, [string, string]> = {
  status: ["Activo", "Inactivo"],
  is_active: ["Activa", "Inactiva"],
};

const MONEY_FIELDS = new Set([
  "amount",
  "balance",
  "total_plan_amount",
  "litigation_amount",
  "total_debt",
  "installment_amount",
  "initial_payment",
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const fieldLabel = (field: string) => FIELD_LABELS[field] ?? field;

export const formatValue = (field: string, value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") {
    const [yes, no] = BOOLEAN_LABELS[field] ?? ["Sí", "No"];
    return value ? yes : no;
  }
  if (MONEY_FIELDS.has(field) && !Number.isNaN(Number(value))) {
    return formatNumber(Number(value));
  }
  if (Array.isArray(value)) {
    return value.map((v) => formatValue(field, v)).join(", ") || "—";
  }
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string") {
    if (VALUE_LABELS[value]) return VALUE_LABELS[value];
    if (ISO_DATE.test(value)) return formatDateTime(value);
    if (DATE_ONLY.test(value)) return value.split("-").reverse().join("-");
  }
  return String(value);
};

/** Un cambio ya traducido, listo para pintar. */
export interface ChangeEntry {
  field: string;
  label: string;
  kind: "diff" | "list" | "value";
  before?: string;
  after?: string;
  added?: string[];
  removed?: string[];
  value?: string;
}

const toEntry = (field: string, change: AuditFieldChange): ChangeEntry => {
  const label = fieldLabel(field);
  const hasValue = (v: unknown) => v !== null && v !== undefined && v !== "";
  const fmtList = (list?: unknown[]) =>
    (list ?? []).map((v) => formatValue(field, v));
  if ("value" in change) {
    return {
      field,
      label,
      kind: "value",
      value: formatValue(field, change.value),
    };
  }
  if (change.added || change.removed) {
    return {
      field,
      label,
      kind: "list",
      added: fmtList(change.added),
      removed: fmtList(change.removed),
    };
  }
  return {
    field,
    label,
    kind: "diff",
    // Un lado vacío no se pinta: "agregó X" o "quitó X" en vez de "— → X".
    before: hasValue(change.before)
      ? formatValue(field, change.before)
      : undefined,
    after: hasValue(change.after)
      ? formatValue(field, change.after)
      : undefined,
  };
};

export const changeEntries = (log: AuditLog): ChangeEntry[] =>
  Object.entries(log.changes ?? {}).map(([field, change]) =>
    toEntry(field, change),
  );

/** Texto plano de un cambio (CSV y tooltip). */
export const describeEntry = (e: ChangeEntry) => {
  if (e.kind === "value") return `${e.label}: ${e.value}`;
  if (e.kind === "list") {
    const parts = [];
    if (e.added?.length) parts.push(`agregó ${e.added.join(", ")}`);
    if (e.removed?.length) parts.push(`quitó ${e.removed.join(", ")}`);
    return `${e.label}: ${parts.join(" · ")}`;
  }
  if (e.before === undefined) return `${e.label}: ${e.after}`;
  if (e.after === undefined) return `${e.label}: ${e.before}`;
  return `${e.label}: ${e.before} → ${e.after}`;
};

export const describeChanges = (log: AuditLog) =>
  changeEntries(log).map(describeEntry);
