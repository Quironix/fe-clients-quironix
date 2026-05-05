import { CaseData } from "../types/track";

/**
 * Parameters for generating email body descriptions
 */
export interface MessageGeneratorParams {
  debtorComment: string;
  executiveComment: string;
  isFactoring: boolean;
  caseData?: CaseData;
}

/**
 * 27 predefined business messages extracted from .plans/management_emails.md
 * Each message corresponds to a specific debtor_comment or executive_comment type
 */
const MESSAGES: Record<string, string> = {
  // 1. Solicitó envío de notas de crédito
  REQUEST_CREDIT_NOTES_SENDING:
    "En nuestro compromiso por brindarle una oportuna información le hacemos llegar adjunto las siguientes Notas de Crédito solicitadas por su empresa:",

  // 2. Cheque confirmado
  CHECK_CONFIRMED:
    "Le informamos que su pago ha sido registrado e ingresado a la ruta de recaudación del día: {date} Correspondiente al pago de las siguientes facturas:",

  // 3. Compromiso incumplido
  COMMITMENT_BREACHED:
    "Su compromiso de pago por {amount} para el {date} vinculado a las siguientes facturas fue incumplido:\n\nLe agradeceremos confirmar el estado de su pago o informarnos la nueva fecha comprometida a la brevedad.",

  // 4. Contabilizada sin compromiso de pago
  ACCOUNTED_WITHOUT_PAYMENT_COMMITMENT:
    "Agradecemos su confirmación de contabilización de la(s) siguiente(s) factura(s), sin embargo; requerimos un compromiso de pago sobre la(s) misma(s):\n\nMonto total adeudado: {amount}\n\nSi desea realizar el pago de estos documentos, debe hacerlo a la siguiente cuenta corriente:\n{bank_account_info}",

  // 5. Contacto no responde
  CONTACT_NOT_RESPONDING:
    "Hemos intentado comunicarnos por teléfono con usted en varias ocasiones, pero ha sido imposible contactarlo para recordarle que se encuentra pendiente el pago de {amount}, correspondiente a las siguientes facturas:",

  // 6. Depositará o hará transferencia
  WILL_DEPOSIT_OR_TRANSFER:
    "Hemos registrado su compromiso de pago por {amount} programado para el {date} correspondiente a las siguientes facturas:\n\nUna vez realizado el pago, envíe boleta de depósito o comprobante con el detalle del pago al mail {email_company} para poder actualizar su cuenta.",

  // 7. Depositó o transfirió
  DEPOSITED_OR_TRANSFERRED:
    "De acuerdo a lo conversado, registramos su confirmación de pago correspondiente a las siguientes facturas:\n\nPara acreditar la recaudación y actualizar su cuenta, le agradeceremos enviar el comprobante de transferencia o boleta de depósito con el detalle de la operación.",

  // 8. Documento sin compromiso de pago
  DOCUMENTS_WITHOUT_PAYMENT_COMMITMENT:
    "A pesar de nuestra notificación anterior, a la fecha aún figura en nuestros registros las siguientes facturas pendientes de pago:\n\nMonto total adeudado: {amount}\n\nLe solicitamos gentilmente confirmar la fecha de pago o efectuar la regularización a más tardar dentro de los próximos 2 días hábiles.",

  // 9. Envio cedible
  ASSIGNABLE_DOCUMENT_DISPATCH_GUIDE_SENT:
    "De acuerdo con su solicitud, enviamos adjunto la copia cedible/guía recepcionada correspondiente al siguiente detalle de facturas:\n\nPara nosotros es importante mantenerlo informado de todos los movimientos de su cuenta, así lo ayudamos a tener una relación financiera exitosa.",

  // 10. Envio estado de cuenta
  STATEMENT_SENT:
    "Para nosotros es importante mantenerlo informado de todos los movimientos de su cuenta, así lo ayudamos a tener una relación financiera exitosa.\n\nMonto total adeudado: {amount}\n\nPor favor no olvide confirmar la contabilización de estos documentos. En este estado de cuenta no se incluyen facturas ya informadas con alguna discrepancia que están en revisión, ni las facturas rechazadas.",

  // 11. Factura con litigio (Variant 1 - Solicitar respaldos)
  // TODO: Implementar variante 2 cuando backend agregue isPaidToClient
  INVOICE_WITH_LITIGATION:
    "De acuerdo a lo conversado, agradecemos su colaboración en enviarnos los respaldos y causales que avalan la solicitud de Emisión de Notas de Crédito, así como el monto asociado a cada caso y relacionado con las siguientes facturas:\n\nSi cuenta con alguna autorización al respecto, por favor también remita la información para entregarle una respuesta a la brevedad sobre los documentos mencionados.",

  // 12. Factura registrada en contabilidad
  INVOICE_REGISTERED_IN_ACCOUNTING:
    "Según lo informado las siguientes facturas fueron contabilizadas para pago , le estaremos contactando nuevamente para confirmar fecha de pago:\n\nMonto total adeudado: {amount}\n\nSi desea realizar el pago de estos documentos, debe hacerlo a la siguiente cuenta corriente:\n{bank_account_info}",

  // 13. Informado bloqueo de pedidos
  INFORMED_ORDER_BLOCKING:
    "Nos dirigimos a usted para informarle que a la fecha no hemos recibido el pago de su deuda vencida y lamentablemente nos vemos en la obligación de suspender los próximos despachos a su empresa por requerimiento del Departamento de Riesgo.\n\nPara habilitar la liberación de nuevos pedidos le invitamos a cancelar los siguientes documentos vencidos que continúan en nuestro sistema como impagos:",

  // 14. Informado documento protestado
  INFORMED_PROTESTED_DOCUMENT:
    "Por medio de la presente cumplimos en informarle que los cheques recibidos para la cancelación de sus facturas han sido protestados por el Banco, por lo que ahora contamos con los siguientes documentos en su cuenta corriente:\n\nPor favor, le agradeceremos depositar inmediatamente este monto en efectivo o transferir directamente en nuestra cuenta corriente:\n{bank_account_info}",

  // 15. Informo motivo de rechazo sii
  INFORM_SII_REJECTION_REASON:
    "Con la finalidad de mantener su cuenta al día solicitamos de su colaboración para notificarnos el motivo por el cual las siguientes facturas electrónicas han sido rechazadas:\n\nAgradecemos su apoyo en hacernos llegar esta información en los próximos 5 días hábiles a fin de poder realizar oportunamente la gestión correspondiente. Le recuerdo que en caso de no notificar las causales del rechazo nuestras Políticas de Crédito nos obligan a limitar su crédito y/o restringir la liberación de nuevos pedidos.",

  // 16. Motivo no pago
  REASON_FOR_NON_PAYMENT:
    "Para mantener una impecable relación, es necesario dar cumplimiento a los acuerdos comerciales y respetar los plazos de pago establecido. Tomando en cuenta la información suministrada le recordamos que las siguientes facturas se mantienen sin compromiso de pago:\n\nMonto total adeudado: {amount}\n\nSi desea realizar el pago de estos documentos, debe hacerlo a la siguiente cuenta corriente:\n{bank_account_info}",

  // 17. Necesito plan de pago
  NEED_PAYMENT_PLAN:
    "Su solicitud de plan de pago ha sido registrada satisfactoriamente, la misma está siendo evaluada y en las próximas horas le será comunicado su aprobación o rechazo.\n\nMe despido sin antes recordarle que su preferencia nos anima a seguir esforzándonos por ofrecerle un mejor servicio y la más completa información.",

  // 18. Notificado de publicacion en informes comerciales
  NOTIFIED_COMMERCIAL_REPORTS_PUBLICATION:
    "Es nuestro compromiso brindarle una atención oportuna y de calidad, por esta razón le escribo para informarle que dada la morosidad de su cuenta nuestra área de Crédito ha procedido a publicar las siguientes facturas en Informes Comerciales.\n\nLe agradeceremos que apenas cancele estas facturas vencidas o bien si ya lo ha realizado, nos envíe el comprobante para poder regularizar su situación a la brevedad. Es nuestro interés que esta medida no se prolongue por lo que si usted tiene alguna causal específica para el no pago nos la haga saber para revisarla con el área involucrada.",

  // 19. Notificado posible bloqueo de pedidos
  NOTIFIED_POSSIBLE_ORDER_BLOCKING:
    "Le contacto para manifestarle nuestra auténtica preocupación por la baja disponibilidad crediticia que tiene su empresa para realizar nuevos pedidos.\n\nEn reiteradas ocasiones he tratado de obtener un compromiso de pago efectivo por parte de ustedes, y a pesar de que le hemos notificado, a la fecha aún figura en nuestros registros las siguientes facturas vencidas y pendientes de pago:\n\nEn caso de haber regularizado el estado de sus facturas su pago quedará compensado dentro de las próximas 24 horas.",

  // 20. Pago parcial (EXECUTIVE_COMMENT - highest priority)
  PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL:
    "Le agradecemos el abono recibido por un monto de {amount}, correspondiente al pago parcial de la(s) siguiente(s) factura(s):\n\nDe acuerdo con lo conversado, el saldo pendiente será abonado el día {date}. Le recordamos la importancia de cumplir con esta fecha a fin de mantener su cuenta regularizada.\n\nAgradecemos su colaboración y quedamos atentos a la confirmación del siguiente pago o a cualquier antecedente adicional que desee compartir.",

  // 21. Pago realizado e identificado
  PAYMENT_MADE_AND_IDENTIFIED:
    "Se ha recibido un abono por {amount} con fecha {date}\n\nSegún nuestros registros usted tiene las siguientes facturas pendientes de pago:\n\nAgradeciendo el envío del detalle de pago, me despido sin antes recordarle que su preferencia nos anima a seguir esforzándonos por ofrecerle un mejor servicio y la más completa información.",

  // 22. Problemas de caja
  CASH_FLOW_PROBLEMS:
    "Nos dirigimos a usted para comunicarle que mantiene las siguientes facturas impagas y que a pesar de nuestras gestiones de cobro anteriores, a la fecha la deuda no ha sido pagada:\n\nConsiderando lo expresado, le informamos que de acuerdo a las Políticas de Crédito de nuestra empresa se procederá a publicar estos documentos en el Boletín Comercial si en los próximos 3 días hábiles no recibimos el pago correspondiente.\nLamentamos esta situación y esperamos su pronta respuesta.",

  // 23. Revisará tema
  WILL_REVIEW_ISSUE:
    "Es nuestro compromiso brindarle una atención oportuna y de calidad, por esta razón le escribo para solicitar confirmación de recepción, contabilización del documento adjunto.\nPara nosotros es importante mantenerlo informado de todos los movimientos de su cuenta, así lo ayudamos a tener una relación financiera exitosa.",

  // 24. Solicita aplicar nota de credito disponible
  REQUEST_APPLY_AVAILABLE_CREDIT_NOTE:
    "Ofrecerle una atención de calidad y mantener su cuenta actualizada es nuestra prioridad, por estas razones le hacemos llegar la siguiente propuesta de Netting para los documentos que se encuentran abiertos en su cuenta corriente:\n\nEn caso de existir alguna diferencia, solicito indicar la fecha de pago asociada al monto del saldo adeudado.\n\nPara nosotros es importante mantenerlo informado de todos los movimientos de su cuenta, así lo ayudamos a tener una relación financiera exitosa.",

  // 25. Solicito acuse de recibo
  REQUEST_ACKNOWLEDGMENT_OF_RECEIPT:
    "Agradecemos su colaboración por el pronto envío de esta información, le confirmo que la misma ha sido satisfactoriamente recibida y está siendo validada por el área correspondiente.\n\nPara nosotros es importante mantenerlo informado de todos los movimientos de su cuenta, así lo ayudamos a tener una relación financiera exitosa.",

  // 26. Solicito certificado de cesion de factura
  REQUEST_ASSIGNMENT_CERTIFICATE:
    "Le recordamos que las siguientes facturas han sido cedidas por su emisor a {name_client} por lo cual le solicitamos confirmarnos recepción, contabilización y fecha de pago:\n\nMonto total adeudado: {amount}\n\nSegún lo establecido en la ley 19.983 estas facturas deben ser pagadas directamente a {name_client}.\n\nPara nosotros es importante mantenerlo informado de todos los movimientos de su cuenta, así lo ayudamos a tener una relación financiera exitosa.",
};

/**
 * Default generic message when no specific message is found
 * Different message for FACTORING vs non-FACTORING clients
 */
function getDefaultMessage(isFactoring: boolean): string {
  if (isFactoring) {
    return "Notificamos que las siguientes facturas han sido cedidas por su emisor a logoipsum, por lo cual solicitamos confirmarnos recepción, contabilización y fecha de pago.";
  }
  return "Le informamos que hemos registrado una nueva gestión asociada a las siguientes facturas. Por favor, revise la información adjunta y confirme su recepción.";
}

/**
 * Main function to generate email body description based on debtor_comment and executive_comment
 * 
 * Priority logic:
 * 1. If executive_comment is PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL, use that message (highest priority)
 * 2. If debtor_comment is INVOICE_WITH_LITIGATION, use litigation message (variant 1 always for now)
 * 3. Otherwise, use message from MESSAGES[debtor_comment]
 * 4. Fallback to getDefaultMessage() if no match found
 * 
 * @param params - MessageGeneratorParams containing comment types and context
 * @returns Plain text message string with placeholders for variable replacement
 */
export function generateBodyDescriptionByDebtorComment(
  params: MessageGeneratorParams
): string {
  const { debtorComment, executiveComment, isFactoring } = params;

  // Priority 1: PARTIAL_PAYMENT executive_comment takes precedence
  if (executiveComment === "PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL") {
    return MESSAGES.PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL;
  }

  // Priority 2: INVOICE_WITH_LITIGATION special handling
  if (debtorComment === "INVOICE_WITH_LITIGATION") {
    // TODO: Implementar variante 2 cuando backend agregue isPaidToClient
    // Por ahora siempre retornamos la variante 1 (solicitar respaldos)
    return MESSAGES.INVOICE_WITH_LITIGATION;
  }

  // Priority 3: Regular message lookup
  const message = MESSAGES[debtorComment];

  if (message) {
    return message;
  }

  // Priority 4: Fallback to default message
  console.warn(
    `No message found for debtor_comment: ${debtorComment}. Using default message.`
  );
  return getDefaultMessage(isFactoring);
}
