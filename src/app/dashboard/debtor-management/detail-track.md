# Suite Completa de Datos de Prueba para Tracks

Ejemplos JSON listos para producción de todos los tipos de casos de track con explicaciones de campos.

---

## 1. Compromiso de Pago

**Comentario del Deudor**: "Depositará o hará transferencia" (`WILL_DEPOSIT_OR_TRANSFER`)
**Comentario del Ejecutivo**: "Con Compromiso de pago" (`WITH_PAYMENT_COMMITMENT`)
**Fase Objetivo**: 5

### JSON de Solicitud

```json
{
  "debtor_id": "550e8400-e29b-41d4-a716-446655440000",
  "management_type": "WILL_DEPOSIT_OR_TRANSFER",
  "contact": {
    "type": "PHONE",
    "value": "+56912345678"
  },
  "observation": "Deudor confirmó compromiso de pago para la próxima semana",
  "debtor_comment": "WILL_DEPOSIT_OR_TRANSFER",
  "executive_comment": "WITH_PAYMENT_COMMITMENT",
  "next_management_date": "2025-01-26T10:00:00Z",
  "case_data": {
    "commitmentDate": "2025-01-25",
    "amount": 500000
  },
  "invoice_ids": ["inv-001", "inv-002"]
}
```

### Explicación de Campos

- `debtor_id`: UUID del deudor que se está gestionando
- `management_type`: Código del tipo de acción de gestión
- `contact.type`: Canal utilizado para contacto (PHONE, EMAIL, WHATSAPP, SMS, LETTER)
- `contact.value`: Valor del contacto (número de teléfono, correo electrónico, etc.)
- `observation`: Descripción en texto libre de la interacción
- `debtor_comment`: Código de respuesta/situación del deudor
- `executive_comment`: Código de evaluación del ejecutivo
- `next_management_date`: Fecha ISO para el próximo seguimiento
- `case_data.commitmentDate`: Fecha en que el deudor se comprometió a pagar (YYYY-MM-DD)
- `case_data.amount`: Monto comprometido a pagar (numérico)
- `invoice_ids`: Array de UUIDs de facturas a vincular y transicionar a fase 5

---

## 2. Pago Declarado

**Comentario del Deudor**: "Depositó o transfirió" (`DEPOSITED_OR_TRANSFERRED`)
**Comentario del Ejecutivo**: "Confirmar abono en cartola" (`CONFIRM_PAYMENT_IN_STATEMENT`)
**Fase Objetivo**: 7

### JSON de Solicitud

```json
{
  "debtor_id": "550e8400-e29b-41d4-a716-446655440000",
  "management_type": "DEPOSITED_OR_TRANSFERRED",
  "contact": {
    "type": "EMAIL",
    "value": "finance@debtor.com"
  },
  "observation": "Deudor afirma que realizó el pago, necesita verificación en cartola bancaria",
  "debtor_comment": "DEPOSITED_OR_TRANSFERRED",
  "executive_comment": "CONFIRM_PAYMENT_IN_STATEMENT",
  "next_management_date": "2025-01-20T14:00:00Z",
  "case_data": {
    "paymentDate": "2025-01-18",
    "paymentAmount": 750000
  },
  "invoice_ids": ["inv-003"]
}
```

### Explicación de Campos

- `case_data.paymentDate`: Fecha en que el deudor afirma haber realizado el pago (YYYY-MM-DD)
- `case_data.paymentAmount`: Monto que el deudor afirma haber pagado (numérico)
- Todas las facturas transicionan a fase 7 para confirmación de pago

---

## 3. Motivo de No Pago

**Comentario del Deudor**: "Contacto no responde" (`CONTACT_NOT_RESPONDING`)
**Comentario del Ejecutivo**: "Sin progreso" (`NO_PROGRESS`)
**Fase Objetivo**: 1

### JSON de Solicitud

```json
{
  "debtor_id": "550e8400-e29b-41d4-a716-446655440000",
  "management_type": "CONTACT_NOT_RESPONDING",
  "contact": {
    "type": "PHONE",
    "value": "+56923456789"
  },
  "observation": "Múltiples intentos de contacto fallidos, sin respuesta del deudor",
  "debtor_comment": "CONTACT_NOT_RESPONDING",
  "executive_comment": "NO_PROGRESS",
  "next_management_date": "2025-01-22T09:00:00Z",
  "case_data": {
    "nonPaymentReason": "LACK_OF_COMMUNICATION",
    "customReason": "Deudor no responde llamadas ni correos desde hace 2 semanas"
  },
  "invoice_ids": ["inv-004", "inv-005"]
}
```

### Explicación de Campos

- `case_data.nonPaymentReason`: Código de razón para el no pago
- `case_data.customReason`: Explicación opcional en texto libre para detalles específicos
- Las facturas permanecen en fase 1 (contacto inicial)

---

## 4. Comunicación Pendiente

**Comentario del Deudor**: "Envío Estado de Cuenta" (`STATEMENT_SENT`)
**Comentario del Ejecutivo**: "Envío de información" (`INFORMATION_SENT`)
**Fase Objetivo**: 1

### JSON de Solicitud

```json
{
  "debtor_id": "550e8400-e29b-41d4-a716-446655440000",
  "management_type": "STATEMENT_SENT",
  "contact": {
    "type": "EMAIL",
    "value": "accounting@debtor.com"
  },
  "observation": "Enviado estado de cuenta según solicitado por el deudor",
  "debtor_comment": "STATEMENT_SENT",
  "executive_comment": "INFORMATION_SENT",
  "next_management_date": "2025-01-24T11:00:00Z",
  "case_data": {
    "communicationPurpose": "ACCOUNT_STATEMENT_REQUEST"
  },
  "invoice_ids": ["inv-006"]
}
```

### Explicación de Campos

- `case_data.communicationPurpose`: Propósito/tipo de comunicación enviada
- Utilizado para rastrear intercambio de información con el deudor
- Las facturas permanecen en fase 1 esperando respuesta

---

## 5. Pago Identificado

**Comentario del Deudor**: "Pago realizado e identificado" (`PAYMENT_MADE_AND_IDENTIFIED`)
**Comentario del Ejecutivo**: "Pago parcial o detalle incompleto" (`PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL`)
**Fase Objetivo**: 1

### JSON de Solicitud

```json
{
  "debtor_id": "550e8400-e29b-41d4-a716-446655440000",
  "management_type": "PAYMENT_MADE_AND_IDENTIFIED",
  "contact": {
    "type": "PHONE",
    "value": "+56934567890"
  },
  "observation": "Pago parcial identificado en cartola bancaria, saldo pendiente",
  "debtor_comment": "PAYMENT_MADE_AND_IDENTIFIED",
  "executive_comment": "PARTIAL_PAYMENT_OR_INCOMPLETE_DETAIL",
  "next_management_date": "2025-01-21T15:00:00Z",
  "case_data": {
    "paymentAmount": 300000,
    "paymentDate": "2025-01-19"
  },
  "invoice_ids": ["inv-007"]
}
```

### Explicación de Campos

- `case_data.paymentAmount`: Monto del pago parcial identificado (numérico)
- `case_data.paymentDate`: Fecha en que se identificó el pago (YYYY-MM-DD)
- Utilizado para pagos parciales que requieren seguimiento
- Las facturas regresan a fase 1 para cobro del saldo restante

---

## 6. Factura No Contabilizada

**Comentario del Deudor**: "Factura no registrada en contabilidad" (`INVOICE_NOT_REGISTERED_IN_ACCOUNTING`)
**Comentario del Ejecutivo**: "No contabilizada" (`NOT_ACCOUNTED`)
**Fase Objetivo**: 3

### JSON de Solicitud

```json
{
  "debtor_id": "550e8400-e29b-41d4-a716-446655440000",
  "management_type": "INVOICE_NOT_REGISTERED_IN_ACCOUNTING",
  "contact": {
    "type": "EMAIL",
    "value": "accounting@debtor.com"
  },
  "observation": "Deudor afirma que la factura no está registrada en su sistema contable",
  "debtor_comment": "INVOICE_NOT_REGISTERED_IN_ACCOUNTING",
  "executive_comment": "NOT_ACCOUNTED",
  "next_management_date": "2025-01-23T10:00:00Z",
  "case_data": {
    "selectionOption": "SEND_INVOICE_COPY",
    "customReason": "Departamento de contabilidad nunca recibió la factura original"
  },
  "invoice_ids": ["inv-008"]
}
```

### Explicación de Campos

- `case_data.selectionOption`: Acción a tomar para factura no registrada
- `case_data.customReason`: Explicación opcional para el problema contable
- Las facturas transicionan a fase 3 (verificación contable)

---

## 7. Litigio

**Comentario del Deudor**: "Factura con Litigio" (`INVOICE_WITH_LITIGATION`)
**Comentario del Ejecutivo**: "Documento en litigio" (`DOCUMENT_IN_LITIGATION`)
**Fase Objetivo**: 2

### JSON de Solicitud

```json
{
  "debtor_id": "550e8400-e29b-41d4-a716-446655440000",
  "management_type": "INVOICE_WITH_LITIGATION",
  "contact": {
    "type": "EMAIL",
    "value": "legal@debtor.com"
  },
  "observation": "Factura en disputa, proceso legal iniciado",
  "debtor_comment": "INVOICE_WITH_LITIGATION",
  "executive_comment": "DOCUMENT_IN_LITIGATION",
  "next_management_date": "2025-02-15T09:00:00Z",
  "case_data": {
    "litigationId": "lit-12345-2025"
  },
  "invoice_ids": ["inv-009"]
}
```

### Explicación de Campos

- `case_data.litigationId`: ID de referencia al caso de litigio existente
- Vincula el track con procedimientos legales
- Las facturas transicionan a fase 2 (litigio/disputa)

---

## 8. Solicitud de Plan de Pago

**Comentario del Deudor**: "Necesito Plan de Pago" (`NEED_PAYMENT_PLAN`)
**Comentario del Ejecutivo**: "Solicitud de aprobación de Plan de Pago" (`PAYMENT_PLAN_APPROVAL_REQUEST`)
**Fase Objetivo**: 4

### JSON de Solicitud

```json
{
  "debtor_id": "550e8400-e29b-41d4-a716-446655440000",
  "management_type": "NEED_PAYMENT_PLAN",
  "contact": {
    "type": "PHONE",
    "value": "+56945678901"
  },
  "observation": "Deudor solicitó plan de pago en cuotas debido a problemas de flujo de caja",
  "debtor_comment": "NEED_PAYMENT_PLAN",
  "executive_comment": "PAYMENT_PLAN_APPROVAL_REQUEST",
  "next_management_date": "2025-01-27T13:00:00Z",
  "case_data": {
    "paymentPlanId": "plan-789-2025"
  },
  "invoice_ids": ["inv-010", "inv-011"]
}
```

### Explicación de Campos

- `case_data.paymentPlanId`: ID de referencia al plan de pago (opcional, puede ser null si está pendiente de aprobación)
- Vincula el track con negociación de plan de pago
- Las facturas transicionan a fase 4 (procesamiento de plan de pago)

---

## 9. Retiro de Cheque

**Comentario del Deudor**: "Cheque Confirmado" (`CHECK_CONFIRMED`)
**Comentario del Ejecutivo**: "Con Compromiso de pago" (`WITH_PAYMENT_COMMITMENT`)
**Fase Objetivo**: 5

### JSON de Solicitud

```json
{
  "debtor_id": "550e8400-e29b-41d4-a716-446655440000",
  "management_type": "CHECK_CONFIRMED",
  "contact": {
    "type": "PHONE",
    "value": "+56956789012"
  },
  "observation": "Deudor confirmó que el cheque está listo para retiro en su oficina",
  "debtor_comment": "CHECK_CONFIRMED",
  "executive_comment": "WITH_PAYMENT_COMMITMENT",
  "next_management_date": "2025-01-20T14:00:00Z",
  "case_data": {
    "pickupDate": "2025-01-20",
    "paymentCommitmentAmount": 850000,
    "pickupTimeFrom": "14:00",
    "pickupTimeTo": "17:00",
    "checkPickupAddress": "Av. Libertador 1234, Oficina 501, Santiago"
  },
  "invoice_ids": ["inv-012"]
}
```

### Explicación de Campos

- `case_data.pickupDate`: Fecha programada para el retiro del cheque (YYYY-MM-DD)
- `case_data.paymentCommitmentAmount`: Monto del cheque (numérico)
- `case_data.pickupTimeFrom`: Hora de inicio de la ventana de retiro (HH:mm)
- `case_data.pickupTimeTo`: Hora de fin de la ventana de retiro (HH:mm)
- `case_data.checkPickupAddress`: Dirección completa donde se recogerá el cheque
- Las facturas transicionan a fase 5 (compromiso de pago)

---

## Consideraciones por Tipo de Cliente

### Clientes NORMAL

- Soportan todos los casos mostrados arriba
- Casos adicionales específicos para clientes NORMAL incluyen aplicación de notas de crédito, notificaciones de bloqueo de pedidos

### Clientes FACTORING

- Soportan la mayoría de los casos mostrados arriba
- Tienen casos específicos como solicitud de certificado de cesión (`ENV_O_DE_CESI_N`)
- Algunos códigos de debtor_comment difieren entre tipos de cliente

### Uso de los Ejemplos

1. Reemplazar UUIDs con IDs reales de entidades de tu base de datos
2. Ajustar fechas a fechas futuras válidas
3. Asegurar que `executive_id` se establece automáticamente por el controlador desde el usuario autenticado
4. Verificar que la combinación debtor_comment + executive_comment sea válida para tu tipo de cliente
5. Todas las facturas vinculadas transicionarán automáticamente a la fase especificada

### Resultados de Transición de Fase

Cada creación exitosa de track retorna:

```json
{
  "track": {
    /* objeto track creado */
  },
  "phaseTransitions": {
    "totalInvoices": 2,
    "successfulTransitions": 2,
    "failedTransitions": 0,
    "transitions": [
      {
        "invoiceId": "inv-001",
        "success": true,
        "sourcePhase": 3,
        "targetPhase": 5
      }
    ]
  }
}
```
