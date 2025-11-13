# Componente de Plan de Pago para Gestión de Deudores

## Descripción

Este componente permite crear planes de pago directamente desde el flujo de gestión de deudores. Se integra como un caso especial en el flujo de 3 pasos de `AddManagementTab`.

## Estructura de Archivos

```
debtor-management/
├── components/
│   └── payment-plan/
│       ├── ManagementPaymentPlanForm.tsx  # Componente principal
│       └── index.ts                       # Exports
├── services/
│   └── payment-plan.ts                    # Servicio API
└── config/
    └── management-types.ts                # Configuración actualizada
```

## Flujo de Uso

1. **Paso 1**: Usuario selecciona facturas del deudor
2. **Paso 2**: Usuario selecciona tipo de gestión:
   - Management Type: `CALL_OUT`
   - Debtor Comment: `NEED_PAYMENT_PLAN`
   - Executive Comment: `PAYMENT_PLAN_APPROVAL_REQUEST`
3. **Paso 3**: Se muestra el componente `ManagementPaymentPlanForm`
4. **Finalizar**: Al finalizar la gestión:
   - Se crea el plan de pago en el backend
   - Se obtiene el ID del plan creado
   - Se crea el track con el ID en `case_data.paymentPlanIds`

## Componente: ManagementPaymentPlanForm

### Props

```typescript
interface ManagementPaymentPlanFormProps {
  value?: any;
  onChange: (data: any) => void;
  selectedInvoices?: Invoice[];
}
```

### Características

- Muestra resumen de facturas seleccionadas
- Permite configurar:
  - Pago contado
  - Número de cuotas (1-36)
  - Tasa de interés anual (0-48%)
  - Forma de pago (transferencia, cheque, etc.)
  - Frecuencia de pago (semanal, quincenal, mensual, etc.)
  - Fecha de inicio
  - Comentarios opcionales
- Calcula automáticamente la cuota en tiempo real
- Validación con Zod
- Notifica validez a través de `_isValid` en el callback `onChange`

## Servicio: createPaymentPlan

### Firma

```typescript
createPaymentPlan({
  accessToken: string,
  clientId: string,
  dataToInsert: any,
}): Promise<{ success: boolean; data?: any; message?: string }>
```

### Payload Enviado

```json
{
  "debtorId": "uuid",
  "selectedInvoices": ["invoice-id-1", "invoice-id-2"],
  "totalAmount": 1000000,
  "downPayment": 100000,
  "numberOfInstallments": 12,
  "annualInterestRate": 5,
  "paymentMethod": "DEPOSIT_OR_TRANSFER",
  "paymentFrequency": "FREQ_30_DAYS",
  "startDate": "2024-01-15",
  "comments": "Plan acordado telefónicamente"
}
```

### Respuesta Esperada

```json
{
  "id": "payment-plan-uuid",
  "debtorId": "debtor-uuid",
  ...
}
```

## Integración con Track

El track creado tendrá la siguiente estructura en `case_data`:

```json
{
  "debtor_id": "debtor-uuid",
  "management_type": "CALL_OUT",
  "debtor_comment": "NEED_PAYMENT_PLAN",
  "executive_comment": "PAYMENT_PLAN_APPROVAL_REQUEST",
  "case_data": {
    "paymentPlanIds": ["payment-plan-uuid"]
  },
  "invoice_ids": ["invoice-1", "invoice-2"],
  ...
}
```

## Configuración en management-types.ts

```typescript
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
}
```

## Validaciones

El esquema de validación en `StepTwo.tsx` incluye:

```typescript
paymentPlanData: z.object({
  downPayment: z.number().min(0, "Debe ser mayor o igual a 0"),
  numberOfInstallments: z.number().min(1, "Debe ser al menos 1"),
  annualInterestRate: z.number().min(0, "Debe ser mayor o igual a 0"),
  paymentMethod: z.string().min(1, "La forma de pago es requerida"),
  paymentFrequency: z.string().min(1, "La frecuencia es requerida"),
  startDate: z.date({ required_error: "La fecha es requerida" }),
  comments: z.string().optional(),
  _isValid: z.boolean().optional(),
})
```

## Frecuencias de Pago Soportadas

- `FREQ_7_DAYS`: Semanal (52 períodos/año)
- `FREQ_15_DAYS`: Quincenal (24 períodos/año)
- `FREQ_30_DAYS`: Mensual (12 períodos/año)
- `FREQ_45_DAYS`: Trimestral (4 períodos/año)
- `FREQ_60_DAYS`: Semestral (2 períodos/año)

## Fórmula de Cálculo de Cuota

```
Si tasa = 0:
  cuota = (totalAmount - downPayment) / numberOfInstallments

Si tasa > 0:
  principal = totalAmount - downPayment
  periodRate = annualInterestRate / 100 / frequencyFactor
  cuota = (principal * periodRate * (1 + periodRate)^n) / ((1 + periodRate)^n - 1)
```

## Notas Importantes

1. El componente NO maneja el deudor ni las facturas (ya vienen del contexto del flujo)
2. La validación en tiempo real actualiza el estado del formulario padre
3. El plan de pago se crea ANTES de crear el track
4. Si falla la creación del plan, no se crea el track
5. El flujo soporta múltiples gestiones en una misma sesión

## Ejemplo de Uso Completo

```typescript
// El usuario:
// 1. Selecciona deudor y facturas (Paso 1)
// 2. Configura tipo de gestión (Paso 2):
//    - Management Type: CALL_OUT
//    - Debtor Comment: NEED_PAYMENT_PLAN
//    - Executive Comment: PAYMENT_PLAN_APPROVAL_REQUEST
// 3. Configura el plan de pago
//    - Down Payment: $100,000
//    - Installments: 12
//    - Interest Rate: 5%
//    - Payment Method: Transferencia
//    - Frequency: Mensual
//    - Start Date: 15/01/2024
// 4. Finaliza la gestión
//
// Resultado:
// - Plan de pago creado en backend
// - Track creado con referencia al plan
// - Email enviado al deudor (si habilitado)
```
