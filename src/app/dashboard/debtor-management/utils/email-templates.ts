import { ManagementCombination } from "../config/management-types";
import { CaseData } from "../types/track";

export function generateBodyDescription(
  managementCombination: ManagementCombination,
  caseData: CaseData,
  invoicesCount: number
): string {
  const combinationId = managementCombination.id;

  switch (combinationId) {
    case "payment_commitment":
      return generatePaymentCommitmentHTML(caseData);

    case "payment_declared":
      return generatePaymentDeclaredHTML(caseData);

    case "non_payment_reason":
      return generateNonPaymentReasonHTML(caseData);

    case "pending_communication":
      return generatePendingCommunicationHTML(caseData);

    case "payment_identified":
      return generatePaymentIdentifiedHTML(caseData);

    case "invoice_not_registered":
      return generateInvoiceNotRegisteredHTML(caseData);

    case "litigation":
      return generateLitigationHTML(invoicesCount);

    case "litigation-normalization":
      return generateLitigationNormalizationHTML(invoicesCount, caseData);

    case "payment_plan_request":
      return generatePaymentPlanRequestHTML(caseData);

    case "check_pickup":
      return generateCheckPickupHTML(caseData);

    default:
      return `<p>Se ha registrado una nueva gestión de tipo: <strong>${managementCombination.label}</strong></p>`;
  }
}

function formatCurrency(amount: string | number): string {
  const numValue = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(numValue);
}

function formatDate(dateValue: string | Date): string {
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function generatePaymentCommitmentHTML(caseData: CaseData): string {
  const amount = caseData.amount
    ? formatCurrency(caseData.amount)
    : "un monto";
  const date = caseData.commitmentDate
    ? formatDate(caseData.commitmentDate)
    : "una fecha acordada";

  return `
    <p>Se ha registrado un <strong>compromiso de pago</strong>.</p>
    <p>El deudor se compromete a realizar el pago de <strong>${amount}</strong> el día <strong>${date}</strong>.</p>
    <p>Por favor, confirmar la recepción del pago en la fecha indicada.</p>
  `;
}

function generatePaymentDeclaredHTML(caseData: CaseData): string {
  const amount = caseData.paymentAmount
    ? formatCurrency(caseData.paymentAmount)
    : "un monto";
  const date = caseData.paymentDate
    ? formatDate(caseData.paymentDate)
    : "una fecha declarada";

  return `
    <p>El deudor declara haber <strong>realizado un pago</strong>.</p>
    <p>Monto declarado: <strong>${amount}</strong></p>
    <p>Fecha de pago declarada: <strong>${date}</strong></p>
    <p>Por favor, verificar y confirmar el abono en cartola.</p>
  `;
}

function generateNonPaymentReasonHTML(caseData: CaseData): string {
  const reasonMapping: { [key: string]: string } = {
    LACK_OF_COMMUNICATION: "Falta de comunicación",
    FINANCIAL_ISSUES: "Problemas financieros",
    DISPUTE: "Disputa",
    OTHER: "Otro",
  };

  const reason = reasonMapping[caseData.nonPaymentReason || ""] || caseData.nonPaymentReason || "No especificado";
  const customReason = caseData.customReason
    ? `<p>Detalles adicionales: ${caseData.customReason}</p>`
    : "";

  return `
    <p>Se ha registrado un <strong>motivo de no pago</strong>.</p>
    <p>Razón: <strong>${reason}</strong></p>
    ${customReason}
    <p>El contacto no ha respondido o no ha podido realizar el pago en el plazo establecido.</p>
  `;
}

function generatePendingCommunicationHTML(caseData: CaseData): string {
  const purposeMapping: { [key: string]: string } = {
    ACCOUNT_STATEMENT_REQUEST: "Solicitud de estado de cuenta",
    SEND_INVOICE_DETAILS: "Envío de detalles de factura",
    PAYMENT_CONFIRMATION: "Confirmación de pago",
    OTHER: "Otro",
  };

  const purpose = purposeMapping[caseData.communicationPurpose || ""] || caseData.communicationPurpose || "No especificado";

  return `
    <p>Se ha enviado <strong>información al deudor</strong>.</p>
    <p>Propósito de la comunicación: <strong>${purpose}</strong></p>
    <p>Se espera respuesta del deudor para continuar con el proceso de cobro.</p>
  `;
}

function generatePaymentIdentifiedHTML(caseData: CaseData): string {
  const amount = caseData.paymentAmount
    ? formatCurrency(caseData.paymentAmount)
    : "un monto";
  const date = caseData.paymentDate
    ? formatDate(caseData.paymentDate)
    : "una fecha";

  return `
    <p>Se ha <strong>identificado un pago</strong>.</p>
    <p>Monto del pago: <strong>${amount}</strong></p>
    <p>Fecha de identificación: <strong>${date}</strong></p>
    <p>El pago ha sido registrado y aplicado a las facturas correspondientes.</p>
  `;
}

function generateInvoiceNotRegisteredHTML(caseData: CaseData): string {
  const actionMapping: { [key: string]: string } = {
    SEND_INVOICE_COPY: "Enviar copia de factura",
    VERIFY_RECEIPT: "Verificar recepción",
    CONTACT_ACCOUNTING: "Contactar contabilidad",
    OTHER: "Otro",
  };

  const action = actionMapping[caseData.selectionOption || ""] || caseData.selectionOption || "Verificar estado";
  const customReason = caseData.customReason
    ? `<p>Explicación del problema: ${caseData.customReason}</p>`
    : "";

  return `
    <p>Se ha detectado que la factura <strong>no está contabilizada</strong>.</p>
    <p>Acción a tomar: <strong>${action}</strong></p>
    ${customReason}
    <p>Se requiere verificar con el área de contabilidad para resolver esta situación.</p>
  `;
}

function generateLitigationHTML(invoicesCount: number): string {
  return `
    <p>Se ha registrado un <strong>litigio</strong> sobre ${invoicesCount} factura(s).</p>
    <p>Las facturas han sido marcadas como documentos en litigio y se procederá con el proceso correspondiente.</p>
    <p>Se notificará cuando haya actualizaciones sobre el estado del litigio.</p>
  `;
}

function generateLitigationNormalizationHTML(
  invoicesCount: number,
  caseData: CaseData
): string {
  const reason = caseData.litigationData?.reason || "No especificado";
  const comment = caseData.litigationData?.comment
    ? `<p>Comentario: ${caseData.litigationData.comment}</p>`
    : "";

  return `
    <p>Se ha <strong>normalizado</strong> el litigio de ${invoicesCount} factura(s).</p>
    <p>Motivo de normalización: <strong>${reason}</strong></p>
    ${comment}
    <p>Las facturas han sido liberadas del estado de litigio y continúan con el proceso normal de cobro.</p>
  `;
}

function generatePaymentPlanRequestHTML(caseData: CaseData): string {
  const planId = caseData.paymentPlanId
    ? `<p>ID de plan de pago: <strong>${caseData.paymentPlanId}</strong></p>`
    : "<p>El plan de pago está pendiente de aprobación.</p>";

  return `
    <p>Se ha registrado una <strong>solicitud de plan de pago</strong>.</p>
    ${planId}
    <p>El deudor ha solicitado establecer un plan de pagos para regularizar su deuda.</p>
    <p>Se notificará cuando el plan sea aprobado.</p>
  `;
}

function generateCheckPickupHTML(caseData: CaseData): string {
  const amount = caseData.paymentCommitmentAmount
    ? formatCurrency(caseData.paymentCommitmentAmount)
    : "un monto";
  const date = caseData.pickupDate
    ? formatDate(caseData.pickupDate)
    : "una fecha";
  const timeFrom = caseData.pickupTimeFrom || "hora no especificada";
  const timeTo = caseData.pickupTimeTo || "hora no especificada";
  const address = caseData.checkPickupAddress || "dirección no especificada";

  return `
    <p>Se ha confirmado <strong>retiro de cheque</strong>.</p>
    <p>Monto del cheque: <strong>${amount}</strong></p>
    <p>Fecha de retiro: <strong>${date}</strong></p>
    <p>Horario de retiro: <strong>${timeFrom} - ${timeTo}</strong></p>
    <p>Dirección de retiro: <strong>${address}</strong></p>
    <p>Por favor, tener el cheque listo para el retiro en el horario indicado.</p>
  `;
}
