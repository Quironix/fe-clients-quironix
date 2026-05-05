import { ManagementCombination } from "../config/management-types";
import { CaseData } from "../types/track";

export function generateBodyDescription(
  managementCombination: ManagementCombination,
  caseData: CaseData,
  invoicesCount: number
): string {
  const combinationId = managementCombination.id;

  switch (combinationId) {
    // EXISTING CASES (kept as-is)
    case "payment_commitment":
      return generateWillDepositOrTransferHTML(caseData);

    case "payment_declared":
      return generateDepositedOrTransferredHTML();

    case "non_payment_reason":
      return generateContactNotRespondingHTML(caseData);

    case "unreachable_debtor":
    case "information_sent":
    case "increase_pressure":
    case "no_contact":
      return generateContactNotRespondingHTML(caseData);

    case "pending_communication":
      return generatePendingCommunicationHTML(caseData);

    case "payment_identified":
      return generatePaymentIdentifiedHTML(caseData);

    case "invoice_not_registered":
      return generateInvoiceNotRegisteredHTML(caseData);

    case "litigation":
      return generateInvoiceWithLitigationProofsHTML();

    case "litigation-normalization":
      return generateLitigationNormalizationHTML(invoicesCount, caseData);

    case "payment_plan_request":
      return generatePaymentPlanRequestHTML(caseData);

    case "check_pickup":
      return generateCheckPickupHTML(caseData);

    // NEW CASES - Phase 4 implementation
    case "information_sent_request_credit_notes_sending":
      return generateRequestCreditNotesHTML();

    case "no_contact_commitment_breached":
    case "no_progress_commitment_breached":
    case "increase_pressure_commitment_breached":
      return generateCommitmentBreachedHTML(caseData);

    case "no_contact_accounted_without_payment_commitment":
    case "no_progress_accounted_without_payment_commitment":
      return generateAccountedWithoutCommitmentHTML(caseData);

    case "debtor_unreachable_no_payment_commitment":
    case "information_sent_no_payment_commitment":
    case "increasse_pressure_no_payment_commitment":
    case "no_contact_no_payment_commitment":
    case "no_progress_no_payment_commitment":
    case "meeting_wdr_no_payment_commitment":
      return generateDocumentsWithoutCommitmentHTML(caseData);

    case "dispatch_guide_sent_assignable_document_dispatch_guide_sent":
      return generateAssignableDocumentSentHTML();

    case "information_sent_statement_sent":
    case "increase_pressure_statement_sent":
    case "no_progress_statement_sent":
    case "invoice_pdf_sent":
      return generateStatementSentHTML(caseData);

    case "accounted_invoice_registered_in_accounting":
      return generateInvoiceRegisteredInAccountingHTML(caseData);

    case "service_cut_order_blocking":
      return generateInformedOrderBlockingHTML();

    case "informed_protested_document":
    case "increase_pressure_informed_protested_document":
    case "redeposit_document_informed_protested_document":
      return generateInformedProtestedDocumentHTML();

    case "information_sent_inform_sii_rejection_reason":
      return generateInformSIIRejectionHTML();

    case "no_progress_reason_for_non_payment":
      return generateReasonForNonPaymentHTML();

    case "information_sent_notified_commercial_reports_publication":
      return generateNotifiedCommercialReportsHTML();

    case "suggest_order_blocking_notified_possible_order_blocking":
      return generateNotifiedPossibleOrderBlockingHTML();

    case "debtor_unreachable_cash_flow_problems":
    case "suggest_send_to_dicom_cash_flow_problems":
      return generateCashFlowProblemsHTML();

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

// ===============================================================
// NEW HTML GENERATORS - Phase 4 Implementation
// ===============================================================

function generateRequestCreditNotesHTML(): string {
  return `
    <p>En nuestro compromiso por brindarle una oportuna información le hacemos llegar adjunto las siguientes Notas de Crédito solicitadas por su empresa.</p>
  `;
}

function generateCheckConfirmedHTML(caseData: CaseData): string {
  const date = caseData.paymentDate
    ? formatDate(caseData.paymentDate)
    : "DD-MM-YYYY";

  return `
    <p>Le informamos que su pago ha sido registrado e ingresado a la ruta de recaudación del día: <strong>${date}</strong> Correspondiente al pago de las siguientes facturas.</p>
  `;
}

function generateCommitmentBreachedHTML(caseData: CaseData): string {
  const amount = caseData.amount
    ? formatCurrency(caseData.amount)
    : "$0";
  const date = caseData.commitmentDate
    ? formatDate(caseData.commitmentDate)
    : "DD-MM-YYYY";

  return `
    <p>Su compromiso de pago por <strong>${amount}</strong> para el <strong>${date}</strong> vinculado a las siguientes facturas fue incumplido.</p>
    <p>Le agradeceremos confirmar el estado de su pago o informarnos la nueva fecha comprometida a la brevedad.</p>
  `;
}

function generateAccountedWithoutCommitmentHTML(caseData: CaseData): string {
  const amount = caseData.amount
    ? formatCurrency(caseData.amount)
    : "$0";

  return `
    <p>Agradecemos su confirmación de contabilización de la(s) siguiente(s) factura(s), sin embargo; requerimos un compromiso de pago sobre la(s) misma(s).</p>
    <p>Monto total adeudado: <strong>${amount}</strong></p>
    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
      <p style="margin: 0;"><strong>Si desea realizar el pago de estos documentos, debe hacerlo a la siguiente cuenta corriente:</strong></p>
      <p style="margin: 5px 0; font-style: italic;">Los datos bancarios se mostrarán en la sección bank_account_info del template.</p>
    </div>
  `;
}

function generateContactNotRespondingHTML(caseData: CaseData): string {
  const amount = caseData.amount
    ? formatCurrency(caseData.amount)
    : "$0";

  return `
    <p>Hemos intentado comunicarnos por teléfono con usted en varias ocasiones, pero ha sido imposible contactarlo para recordarle que se encuentra pendiente el pago de <strong>${amount}</strong>, correspondiente a las siguientes facturas.</p>
  `;
}

function generateWillDepositOrTransferHTML(caseData: CaseData): string {
  const amount = caseData.amount
    ? formatCurrency(caseData.amount)
    : "$0";
  const date = caseData.commitmentDate
    ? formatDate(caseData.commitmentDate)
    : "DD-MM-YYYY";

  return `
    <p>Hemos registrado su compromiso de pago por <strong>${amount}</strong> programado para el <strong>${date}</strong> correspondiente a las siguientes facturas.</p>
    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
      <p style="margin: 0;">Una vez realizado el pago, envíe boleta de depósito o comprobante con el detalle del pago al mail indicado en el contacto para poder actualizar su cuenta.</p>
    </div>
  `;
}

function generateDepositedOrTransferredHTML(): string {
  return `
    <p>De acuerdo a lo conversado, registramos su confirmación de pago correspondiente a las siguientes facturas.</p>
    <p>Para acreditar la recaudación y actualizar su cuenta, le agradeceremos enviar el comprobante de transferencia o boleta de depósito con el detalle de la operación.</p>
  `;
}

function generateDocumentsWithoutCommitmentHTML(caseData: CaseData): string {
  const amount = caseData.amount
    ? formatCurrency(caseData.amount)
    : "$0";

  return `
    <p>A pesar de nuestra notificación anterior, a la fecha aún figura en nuestros registros las siguientes facturas pendientes de pago.</p>
    <p>Monto total adeudado: <strong>${amount}</strong></p>
    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
      <p style="margin: 0;">Le solicitamos gentilmente confirmar la fecha de pago o efectuar la regularización a más tardar dentro de los próximos 2 días hábiles.</p>
    </div>
  `;
}

function generateAssignableDocumentSentHTML(): string {
  return `
    <p>De acuerdo con su solicitud, enviamos adjunto la copia cedible/guía recepcionada correspondiente al siguiente detalle de facturas.</p>
    <p>Para nosotros es importante mantenerlo informado de todos los movimientos de su cuenta, así lo ayudamos a tener una relación financiera exitosa.</p>
  `;
}

function generateStatementSentHTML(caseData: CaseData): string {
  const amount = caseData.amount
    ? formatCurrency(caseData.amount)
    : "$0";

  return `
    <p>Para nosotros es importante mantenerlo informado de todos los movimientos de su cuenta, así lo ayudamos a tener una relación financiera exitosa.</p>
    <p>Monto total adeudado: <strong>${amount}</strong></p>
    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
      <p style="margin: 0;">Por favor no olvide confirmar la contabilización de estos documentos. En este estado de cuenta no se incluyen facturas ya informadas con alguna discrepancia que están en revisión, ni las facturas rechazadas.</p>
    </div>
  `;
}

function generateInvoiceWithLitigationProofsHTML(): string {
  return `
    <p>De acuerdo a lo conversado, agradecemos su colaboración en enviarnos los respaldos y causales que avalan la solicitud de Emisión de Notas de Crédito, así como el monto asociado a cada caso y relacionado con las siguientes facturas.</p>
    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
      <p style="margin: 0;">Si cuenta con alguna autorización al respecto, por favor también remita la información para entregarle una respuesta a la brevedad sobre los documentos mencionados.</p>
    </div>
  `;
}

function generateInvoiceRegisteredInAccountingHTML(caseData: CaseData): string {
  const amount = caseData.amount
    ? formatCurrency(caseData.amount)
    : "$0";

  return `
    <p>Según lo informado las siguientes facturas fueron contabilizadas para pago, le estaremos contactando nuevamente para confirmar fecha de pago.</p>
    <p>Monto total adeudado: <strong>${amount}</strong></p>
    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
      <p style="margin: 0;"><strong>Si desea realizar el pago de estos documentos, debe hacerlo a la siguiente cuenta corriente:</strong></p>
      <p style="margin: 5px 0; font-style: italic;">Los datos bancarios se mostrarán en la sección bank_account_info del template.</p>
    </div>
  `;
}

function generateInformedOrderBlockingHTML(): string {
  return `
    <p>Nos dirigimos a usted para informarle que a la fecha no hemos recibido el pago de su deuda vencida y lamentablemente nos vemos en la obligación de suspender los próximos despachos a su empresa por requerimiento del Departamento de Riesgo.</p>
    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
      <p style="margin: 0;">Para habilitar la liberación de nuevos pedidos le invitamos a cancelar los siguientes documentos vencidos que continúan en nuestro sistema como impagos.</p>
    </div>
  `;
}

function generateInformedProtestedDocumentHTML(): string {
  return `
    <p>Por medio de la presente cumplimos en informarle que los cheques recibidos para la cancelación de sus facturas han sido protestados por el Banco, por lo que ahora contamos con los siguientes documentos en su cuenta corriente.</p>
    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
      <p style="margin: 0;"><strong>Por favor, le agradeceremos depositar inmediatamente este monto en efectivo o transferir directamente en nuestra cuenta corriente:</strong></p>
      <p style="margin: 5px 0; font-style: italic;">Los datos bancarios se mostrarán en la sección bank_account_info del template.</p>
    </div>
  `;
}

function generateInformSIIRejectionHTML(): string {
  return `
    <p>Con la finalidad de mantener su cuenta al día solicitamos de su colaboración para notificarnos el motivo por el cual las siguientes facturas electrónicas han sido rechazadas.</p>
    <p>Agradecemos su apoyo en hacernos llegar esta información en los próximos 5 días hábiles a fin de poder realizar oportunamente la gestión correspondiente. Le recuerdo que en caso de no notificar las causales del rechazo nuestras Políticas de Crédito nos obligan a limitar su crédito y/o restringir la liberación de nuevos pedidos.</p>
  `;
}

function generateReasonForNonPaymentHTML(): string {
  return `
    <p>Para mantener una impecable relación, es necesario dar cumplimiento a los acuerdos comerciales y respetar los plazos de pago establecido. Tomando en cuenta la información suministrada le recordamos que las siguientes facturas se mantienen sin compromiso de pago.</p>
    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
      <p style="margin: 0;"><strong>Si desea realizar el pago de estos documentos, debe hacerlo a la siguiente cuenta corriente:</strong></p>
      <p style="margin: 5px 0; font-style: italic;">Los datos bancarios se mostrarán en la sección bank_account_info del template.</p>
    </div>
  `;
}

function generateNotifiedCommercialReportsHTML(): string {
  return `
    <p>Es nuestro compromiso brindarle una atención oportuna y de calidad, por esta razón le escribo para informarle que dada la morosidad de su cuenta nuestra área de Crédito ha procedido a publicar las siguientes facturas en Informes Comerciales.</p>
    <p>Le agradeceremos que apenas cancele estas facturas vencidas o bien si ya lo ha realizado, nos envíe el comprobante para poder regularizar su situación a la brevedad. Es nuestro interés que esta medida no se prolongue por lo que si usted tiene alguna causal específica para el no pago nos la haga saber para revisarla con el área involucrada.</p>
  `;
}

function generateNotifiedPossibleOrderBlockingHTML(): string {
  return `
    <p>Le contacto para manifestarle nuestra auténtica preocupación por la baja disponibilidad crediticia que tiene su empresa para realizar nuevos pedidos.</p>
    <p>En reiteradas ocasiones he tratado de obtener un compromiso de pago efectivo por parte de ustedes, y a pesar de que le hemos notificado, a la fecha aún figura en nuestros registros las siguientes facturas vencidas y pendientes de pago.</p>
    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
      <p style="margin: 0;">En caso de haber regularizado el estado de sus facturas su pago quedará compensado dentro de las próximas 24 horas.</p>
    </div>
  `;
}

function generateCashFlowProblemsHTML(): string {
  return `
    <p>Nos dirigimos a usted para comunicarle que mantiene las siguientes facturas impagas y que a pesar de nuestras gestiones de cobro anteriores, a la fecha la deuda no ha sido pagada.</p>
    <p>Considerando lo expresado, le informamos que de acuerdo a las Políticas de Crédito de nuestra empresa se procederá a publicar estos documentos en el Boletín Comercial si en los próximos 3 días hábiles no recibimos el pago correspondiente.</p>
    <p>Lamentamos esta situación y esperamos su pronta respuesta.</p>
  `;
}
