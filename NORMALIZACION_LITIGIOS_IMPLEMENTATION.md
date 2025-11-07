# Implementación de Normalización de Litigios en Gestión de Deudores

**Fecha de implementación:** 2025-01-06
**Módulo:** `/dashboard/debtor-management`
**Ruta relacionada:** `/dashboard/litigation`

---

## 📋 Resumen General

Se implementó el flujo completo de normalización de litigios dentro del wizard de gestión de deudores. Este módulo permite a los usuarios seleccionar facturas con litigios asociados y normalizarlas mediante el endpoint `bulk-normalize`.

---

## 🏗️ Arquitectura

### Archivos Modificados/Creados

```
src/app/dashboard/debtor-management/
├── components/
│   ├── normalization/
│   │   ├── ManagementNormalizedLitigationForm.tsx  ← REFACTORIZADO COMPLETO
│   │   ├── InvoiceCardLitigation.tsx                ← MODIFICADO
│   │   └── index.ts
│   └── tabs/
│       └── steps/
│           ├── StepTwo.tsx                          ← MODIFICADO (validación + fetch)
│           └── StepThree.tsx                        ← MODIFICADO (vista previa)
└── config/
    └── management-types.ts                          ← MODIFICADO (configuración)

src/app/dashboard/
└── data/
    └── index.ts                                     ← USA NORMALIZATION_REASONS
```

---

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Usuario selecciona deudor y facturas               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Selección de tipo de gestión                       │
│                                                             │
│ 1. Tipo de gestión: "Llamada saliente"                     │
│ 2. Comentario del deudor: "Factura con litigio"            │
│ 3. Comentario del ejecutivo: "Normalización de litigio" ←  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FETCH AUTOMÁTICO DE LITIGIOS                               │
│                                                             │
│ GET /v2/clients/{client_id}/litigations/debtor/{debtor_id} │
│                                                             │
│ Response: Array<LitigationItem>                            │
│   - id                                                      │
│   - invoice_id                                              │
│   - litigation_amount                                       │
│   - motivo, submotivo, status, etc.                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ VALIDACIÓN DE FACTURAS                                      │
│                                                             │
│ - Solo facturas con invoice_id en litigios son             │
│   seleccionables                                            │
│ - Facturas sin litigio se deshabilitan con mensaje:        │
│   "No pertenece a litigios abiertos"                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FORMULARIO DE NORMALIZACIÓN                                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ [Grid de tarjetas de facturas]                      │   │
│ │ - Muestra: Nº factura, deudor, monto litigio,      │   │
│ │   fase, vencimiento, monto, saldo                   │   │
│ │ - Checkbox para selección                           │   │
│ │ - Facturas sin litigio: deshabilitadas              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Totalizador                                          │   │
│ │ Monto litigios de factura seleccionadas: $XXX.XXX   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Razón de normalización * [Select]                   │   │
│ │ - Cambio de vencimiento                             │   │
│ │ - Comprobante de recepción encontrado               │   │
│ │ - Descuento no corresponde                          │   │
│ │ - Factura Comercial no corresponde                  │   │
│ │ - Nota de Crédito Administrativa emitida            │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Comentario * [Textarea]                             │   │
│ │ Descripción detallada de la normalización           │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ DATOS DE LA GESTIÓN (Sección común del wizard)             │
│                                                             │
│ - Tipo de contacto (PHONE, EMAIL, etc.)                    │
│ - Valor de contacto ← SE USA PARA normalization_by_contact │
│ - Observación                                               │
│ - Fecha/Hora próxima gestión                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Vista previa                                       │
│                                                             │
│ Muestra:                                                    │
│ - Datos del deudor                                          │
│ - Datos de la gestión                                       │
│ - Facturas seleccionadas (tabla)                           │
│ - Sección "Normalización de Litigios":                     │
│   • Facturas seleccionadas: X                              │
│   • Monto total: $XXX.XXX                                  │
│   • Razón de normalización: [label legible]               │
│   • Comentario: [texto completo]                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ SUBMIT FINAL (al hacer click en "Crear gestión")           │
│                                                             │
│ POST /v2/clients/{client_id}/litigations/bulk-normalize    │
│                                                             │
│ Payload:                                                    │
│ {                                                           │
│   "litigation_ids": ["id1", "id2", ...],                   │
│   "normalization_reason": "DUE_DATE_CHANGE",               │
│   "normalization_by_contact": "Juan Pérez - 555-1234",     │
│   "comment": "Comentario detallado..."                     │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Principales

### 1. ManagementNormalizedLitigationForm.tsx

**Ubicación:** `src/app/dashboard/debtor-management/components/normalization/`

**Props:**
```typescript
interface ManagementNormalizedLitigationFormProps {
  value?: any;
  onChange: (data: any) => void;
  selectedInvoices?: Invoice[];
  litigations?: LitigationItem[];  // ← Recibe litigios del debtor
}
```

**Estado interno:**
```typescript
const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
const [reason, setReason] = useState<string>("");
const [comment, setComment] = useState<string>("");
```

**Datos enviados vía onChange:**
```typescript
{
  selectedInvoiceIds: string[],       // IDs de facturas seleccionadas
  litigationIds: string[],            // IDs de litigios (para bulk-normalize)
  reason: string,                     // Código de razón (ej: "DUE_DATE_CHANGE")
  comment: string,                    // Comentario del usuario
  totalAmount: number,                // Suma de litigation_amount
  _isValid: boolean                   // Estado de validación Zod
}
```

**Funciones clave:**

```typescript
// Extrae invoice_ids de todos los litigios
const getInvoiceIdsWithLitigation = (): string[] => {
  return litigations.map((litigation) => litigation.invoice_id);
};

// Verifica si una factura tiene litigio asociado
const hasLitigation = (invoiceId: string): boolean => {
  return getInvoiceIdsWithLitigation().includes(invoiceId);
};

// Obtiene el monto del litigio para mostrar en la tarjeta
const getLitigationNumber = (invoiceId: string): string | undefined => {
  const litigation = litigations.find((lit) => lit.invoice_id === invoiceId);
  if (!litigation?.litigation_amount) return undefined;
  return new Intl.NumberFormat("es-CL").format(Number(litigation.litigation_amount));
};

// Suma los montos de litigios de las facturas seleccionadas
const getTotalAmount = (): number => {
  return selectedInvoiceIds
    .map((invoiceId) => {
      const litigation = litigations.find((lit) => lit.invoice_id === invoiceId);
      return Number(litigation?.litigation_amount || 0);
    })
    .reduce((sum, amount) => sum + amount, 0);
};

// Extrae los litigation_ids basados en las facturas seleccionadas
const getLitigationIds = (): string[] => {
  return selectedInvoiceIds
    .map((invoiceId) => {
      const litigation = litigations.find((lit) => lit.invoice_id === invoiceId);
      return litigation?.id;
    })
    .filter(Boolean) as string[];
};
```

**Validación Zod:**
```typescript
const normalizationFormSchema = z.object({
  selectedInvoiceIds: z
    .array(z.string())
    .min(1, "Debes seleccionar al menos una factura"),
  reason: z.string().min(1, "La razón de normalización es requerida"),
  comment: z.string().min(1, "El comentario es requerido"),
});
```

---

### 2. InvoiceCardLitigation.tsx

**Ubicación:** `src/app/dashboard/debtor-management/components/normalization/`

**Props actualizadas:**
```typescript
interface InvoiceCardLitigationProps {
  invoice: Invoice;
  isSelected: boolean;
  onToggleSelect: (invoice: Invoice) => void;
  isDisabled?: boolean;
  litigationAmount?: string;
  onAmountChange?: (amount: string) => void;
  showAmountInput?: boolean;         // ← Controla si muestra input de monto
  disabledReason?: string;            // ← Mensaje cuando está deshabilitada
  litigationNumber?: string;          // ← Monto del litigio formateado
}
```

**Características:**
- Muestra "Monto litigio: $XXX.XXX" cuando `litigationNumber` está presente
- Input de monto es opcional (`showAmountInput`)
- Mensaje de error cuando está deshabilitada (`disabledReason`)
- Estados visuales:
  - Seleccionada: borde naranja, fondo naranja claro
  - Deshabilitada: gris, opacidad reducida, cursor not-allowed
  - Normal: hover con borde naranja

---

### 3. StepTwo.tsx - Fetch Automático de Litigios

**Ubicación:** `src/app/dashboard/debtor-management/components/tabs/steps/`

**Estado agregado:**
```typescript
const [debtorLitigations, setDebtorLitigations] = useState<any[]>([]);
const [loadingLitigations, setLoadingLitigations] = useState(false);
```

**useEffect para fetch automático:**
```typescript
useEffect(() => {
  const fetchLitigations = async () => {
    if (
      selectedCombination?.executive_comment === "LITIGATION_NORMALIZATION" &&
      dataDebtor?.id &&
      session?.token &&
      profile?.client_id
    ) {
      setLoadingLitigations(true);
      try {
        const response = await getLitigationsByDebtor(
          session.token,
          profile.client_id,
          dataDebtor.id
        );
        if (response.success) {
          setDebtorLitigations(response.data || []);
        } else {
          setDebtorLitigations([]);
          console.error("Error fetching litigations:", response.message);
        }
      } catch (error) {
        console.error("Error fetching litigations:", error);
        setDebtorLitigations([]);
      } finally {
        setLoadingLitigations(false);
      }
    } else {
      setDebtorLitigations([]);
    }
  };

  fetchLitigations();
}, [selectedCombination?.executive_comment, dataDebtor?.id, session?.token, profile?.client_id]);
```

**Paso de litigations al componente:**
```typescript
<DynamicField
  key={field.name}
  field={field}
  control={form.control}
  dataDebtor={dataDebtor}
  selectedInvoices={selectedInvoices}
  litigations={debtorLitigations}  // ← Pasa los litigios
/>
```

**Esquema Zod para normalización:**
```typescript
baseSchema.caseData = z.object({
  litigationData: z.object({
    selectedInvoiceIds: z.array(z.string()).min(1, "Debe seleccionar al menos una factura"),
    litigationIds: z.array(z.string()).optional(),
    reason: z.string().min(1, "La razón de normalización es requerida"),
    comment: z.string().min(1, "El comentario es requerido"),
    totalAmount: z.number().optional(),
    _isValid: z.boolean().optional(),
  }).refine((data) => data._isValid !== false, {
    message: "Debe completar todos los campos requeridos de la normalización",
  }),
});
```

---

### 4. StepThree.tsx - Vista Previa

**Ubicación:** `src/app/dashboard/debtor-management/components/tabs/steps/`

**Renderizado de normalización:**
```typescript
if (selectedConfig.executive_comment === "LITIGATION_NORMALIZATION" &&
    formData.caseData?.litigationData) {
  const normalizationData = formData.caseData.litigationData;
  const normalizationReason = require("@/app/dashboard/data").NORMALIZATION_REASONS.find(
    (r: any) => r.code === normalizationData.reason
  );

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <BookUser className="w-4 h-4 text-gray-700" />
        <h3 className="font-semibold text-sm text-gray-700">
          Normalización de Litigios
        </h3>
      </div>
      <div className="space-y-3">
        <div className="border border-gray-200 rounded p-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Facturas seleccionadas:</span>{" "}
              <span className="font-medium">
                {normalizationData.selectedInvoiceIds?.length || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Monto total:</span>{" "}
              <span className="font-medium">
                {formatCurrency(normalizationData.totalAmount || 0)}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Razón de normalización:</span>{" "}
              <span className="font-medium">
                {normalizationReason?.label || normalizationData.reason}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Comentario:</span>{" "}
              <span className="font-medium">
                {normalizationData.comment || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Estructura de Datos

### LitigationItem (Response del endpoint)

```typescript
interface LitigationItem {
  id: string;                    // ID del litigio
  invoice_id: string;            // ID de la factura asociada
  invoice: Invoice;              // Objeto factura completo
  litigation_amount: number;     // Monto en litigio
  description: string | null;
  motivo: string;
  submotivo: string;
  contact: string;
  status: string;
  normalization_reason: string | null;
  normalization_by_contact: string | null;
  created_by: string;
  creator: Creator | null;
  approved_by: string | null;
  approver: Creator | null;
  debtor_id: string;
  debtor: Debtor;
  company_id: string | null;
  company: null;
  client_id: string;
  comments: Comment[];
  created_at: string;
  updated_at: string;
}
```

### Razones de Normalización

**Ubicación:** `src/app/dashboard/data/index.ts`

```typescript
export const NORMALIZATION_REASONS = [
  { code: "DUE_DATE_CHANGE", label: "Cambio de vencimiento." },
  { code: "RECEPTION_RECEIPT_FOUND", label: "Comprobante de recepción encontrado." },
  { code: "DISCOUNT_NOT_APPLICABLE", label: "Descuento no corresponde." },
  { code: "COMMERCIAL_INVOICE_NOT_APPLICABLE", label: "Factura Comercial no corresponde." },
  { code: "ADMINISTRATIVE_CREDIT_NOTE_ISSUED", label: "Nota de Crédito Administrativa emitida." },
];
```

---

## 🔌 Endpoints Utilizados

### 1. GET Litigios por Deudor

```bash
GET /v2/clients/{client_id}/litigations/debtor/{debtor_id}
Headers:
  Authorization: Bearer {token}

Response: {
  success: true,
  message: "Litigios obtenidos correctamente",
  data: LitigationItem[]
}
```

**Servicio:**
```typescript
// src/app/dashboard/litigation/services/index.ts
export const getLitigationsByDebtor = async (
  accessToken: string,
  clientId: string,
  debtorId: string
) => { ... }
```

### 2. POST Normalización en Lote

```bash
POST /v2/clients/{client_id}/litigations/bulk-normalize
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body: {
  "litigation_ids": ["id1", "id2", ...],
  "normalization_reason": "DUE_DATE_CHANGE",
  "normalization_by_contact": "Juan Pérez - 555-1234",
  "comment": "Comentario detallado sobre la normalización..."
}

Response: {
  success: true,
  message: "Litigios normalizados correctamente",
  data: { ... }
}
```

**Servicio:**
```typescript
// src/app/dashboard/litigation/services/index.ts
export const bulkLitigatiions = async (
  accessToken: string,
  clientId: string,
  payload: {
    litigation_ids: string[];
    normalization_reason: string;
    normalization_by_contact: string;
    comment?: string;
  }
) => { ... }
```

---

## 🚀 Submit Implementation (COMPLETADO)

### Función: `normalizeLitigationsAndGetIds()`

**Ubicación:** `src/app/dashboard/debtor-management/components/tabs/add-management-tab.tsx` línea 303-339

Esta función se implementó siguiendo el mismo patrón que `createLitigationsAndGetIds()`:

```typescript
const normalizeLitigationsAndGetIds = async (): Promise<string[]> => {
  if (!managementFormData.caseData?.litigationData) {
    return [];
  }

  const { bulkLitigatiions } = await import("../../../litigation/services");
  const normalizationData = managementFormData.caseData.litigationData;

  const litigationIds = normalizationData.litigationIds || [];

  if (litigationIds.length === 0) {
    throw new Error("No hay litigios seleccionados para normalizar");
  }

  const normalizationPayload = {
    litigation_ids: litigationIds,
    normalization_reason: normalizationData.reason,
    normalization_by_contact: managementFormData.selectedContact?.id || managementFormData.contactValue,
    comment: normalizationData.comment,
  };

  console.log("📦 Normalization payload:", normalizationPayload);

  const result = await bulkLitigatiions(
    session.token,
    profile.client_id,
    normalizationPayload
  );

  console.log("🔍 Resultado de bulkLitigatiions:", result);

  if (result.success) {
    return litigationIds;
  } else {
    throw new Error(result.message || "Error al normalizar litigios");
  }
};
```

### Integración en `handleFinish()` y `handleAddManagement()`

Ambas funciones fueron actualizadas para llamar a `normalizeLitigationsAndGetIds()` cuando el tipo de gestión es normalización:

```typescript
// En handleFinish() y handleAddManagement()
let litigationIds: string[] | undefined;
if (
  managementFormData.executiveComment === "DOCUMENT_IN_LITIGATION" &&
  managementFormData.caseData?.litigationData
) {
  toast.info("Creando litigios...");
  litigationIds = await createLitigationsAndGetIds();
  toast.success(`${litigationIds.length} litigio(s) creado(s)`);
} else if (
  managementFormData.executiveComment === "LITIGATION_NORMALIZATION" &&
  managementFormData.caseData?.litigationData
) {
  toast.info("Normalizando litigios...");
  litigationIds = await normalizeLitigationsAndGetIds();
  toast.success(`${litigationIds.length} litigio(s) normalizado(s)`);
}
```

### Actualización de `buildTrackPayload()`

Se agregó una condición especial para normalización de litigios:

```typescript
// En buildTrackPayload()
else if (
  selectedCombination?.executive_comment === "LITIGATION_NORMALIZATION" &&
  litigationIds
) {
  // Caso especial: normalización de litigios
  // Solo incluir litigationIds en case_data (sin reason, comment, totalAmount)
  const validatedIds = litigationIds
    .filter(id => id && typeof id === 'string')
    .map(id => id.toString());

  payload.case_data = {
    litigationIds: validatedIds,
  };

  console.log("📦 Payload de track con normalización de litigios:", {
    litigationIds: validatedIds,
    total: validatedIds.length,
  });
}
```

### Orden de Ejecución

**IMPORTANTE:** El flujo sigue este orden exacto:

```typescript
// 1. PRIMERO: Normalizar los litigios (bulk-normalize)
if (managementFormData.executiveComment === "LITIGATION_NORMALIZATION") {
  toast.info("Normalizando litigios...");
  litigationIds = await normalizeLitigationsAndGetIds();
  // ↑ Internamente llama a bulkLitigatiions con:
  // {
  //   litigation_ids: ["lit-1", "lit-2"],
  //   normalization_reason: "DUE_DATE_CHANGE",
  //   normalization_by_contact: "contact-id",
  //   comment: "Comentario..."
  // }
  toast.success(`${litigationIds.length} litigio(s) normalizado(s)`);
}

// 2. SEGUNDO: Construir el payload del track
const payload = buildTrackPayload(litigationIds);
// ↑ Genera el payload con case_data simplificado (solo litigationIds)

// 3. TERCERO: Crear el track
const result = await createTrack(session.token, profile.client_id, payload);
```

### Formato del Track Payload Completo

```json
{
  "debtor_id": "550e8400-e29b-41d4-a716-446655440000",
  "management_type": "CALL_OUT",
  "contact": {
    "type": "PHONE",
    "value": "+56912345678"
  },
  "observation": "Multiple litigation cases for this debtor",
  "debtor_comment": "INVOICE_WITH_LITIGATION",
  "executive_comment": "LITIGATION_NORMALIZATION",
  "next_management_date": "2024-01-15T10:00:00Z",
  "invoice_ids": ["inv-1", "inv-2"],
  "case_data": {
    "litigationIds": [
      "550e8400-e29b-41d4-a716-446655440001",
      "660e8400-e29b-41d4-a716-446655440002"
    ]
  }
}
```

**Nota:** Los campos `normalization_reason`, `normalization_comment` y `totalAmount` se envían únicamente en el payload de bulk-normalize, NO en el track.

---

## 📄 Resumen de Normalización (Step 3)

El **Step 3** muestra un resumen detallado antes de finalizar la gestión:

### Componentes del Resumen

**1. Resumen General (fondo azul):**
- Número de litigios a normalizar
- Monto total de los litigios
- Razón de normalización seleccionada
- Comentario ingresado

**2. Detalle de Facturas:**
- Lista completa de facturas seleccionadas
- Cada factura muestra:
  - Badge del tipo de documento (INVOICE, CREDIT_NOTE, etc.)
  - Número de factura
  - Saldo de la factura
  - Fecha de operación

### Implementación

**Ubicación:** `src/app/dashboard/debtor-management/components/tabs/steps/StepThree.tsx` líneas 253-338

```typescript
// Resumen General
<div className="border border-gray-200 rounded p-3 bg-blue-50">
  <div className="grid grid-cols-2 gap-2 text-xs">
    <div>
      <span className="text-gray-500">Litigios a normalizar:</span>{" "}
      <span className="font-bold text-blue-700">
        {normalizationData.litigationIds?.length || 0}
      </span>
    </div>
    <div>
      <span className="text-gray-500">Monto total litigios:</span>{" "}
      <span className="font-bold text-blue-700">
        {formatCurrency(normalizationData.totalAmount || 0)}
      </span>
    </div>
    <div className="col-span-2">
      <span className="text-gray-500">Razón de normalización:</span>{" "}
      <span className="font-medium">
        {normalizationReason?.label || normalizationData.reason}
      </span>
    </div>
    <div className="col-span-2">
      <span className="text-gray-500">Comentario:</span>{" "}
      <span className="font-medium">
        {normalizationData.comment || "-"}
      </span>
    </div>
  </div>
</div>

// Detalle de Facturas
{selectedInvoicesForNormalization.length > 0 && (
  <div className="border border-gray-200 rounded p-3">
    <p className="font-semibold text-xs mb-2 text-gray-700">
      Facturas seleccionadas ({selectedInvoicesForNormalization.length})
    </p>
    <div className="space-y-2">
      {selectedInvoicesForNormalization.map((invoice) => (
        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-xs border border-gray-200">
          <div className="flex items-center gap-2">
            <DocumentTypeBadge type={invoice.type} />
            <span className="font-medium">{invoice.number}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500">
              Saldo: <span className="font-medium text-gray-700">{formatCurrency(invoice.balance)}</span>
            </span>
            <span className="text-xs text-gray-500">
              {invoice.operation_date
                ? format(new Date(invoice.operation_date), "dd/MM/yyyy")
                : "N/A"}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

### Testing Requerido

- [ ] Probar con deudor sin litigios
- [ ] Probar con facturas que no tienen litigios asociados
- [ ] Validar que el monto total sea correcto
- [ ] Validar que los litigation_ids se mapeen correctamente
- [ ] Probar el submit completo con normalización de litigios
- [ ] Verificar que el contacto se tome correctamente de "Datos de la gestión"
- [ ] Validar que se cree el track correctamente después de normalizar
- [ ] Probar flujo completo: seleccionar facturas → normalizar → verificar en backend

### Mejoras Futuras (Opcionales)

- [ ] Loading state mientras se cargan los litigios
- [ ] Mensaje cuando no hay litigios para el deudor
- [ ] Permitir búsqueda/filtrado de facturas en el grid
- [ ] Mostrar más detalles del litigio en la tarjeta (motivo, submotivo)
- [ ] Validación de montos (que el total de normalización no exceda ciertos límites)

---

## 📝 Notas Importantes

### Diferencia con Creación de Litigios

| Aspecto | Creación de Litigios | Normalización de Litigios |
|---------|---------------------|---------------------------|
| Múltiples litigios | ✅ Sí (acordeones) | ❌ No (un solo bloque) |
| Input de monto por factura | ✅ Sí (editable) | ❌ No (monto fijo del litigio) |
| Razón/motivo | Disputa (motivo + submotivo) | Normalización (5 opciones) |
| Contacto | N/A | Desde "Datos de la gestión" |
| Submit | Crear litigios nuevos | Normalizar litigios existentes |

### Mapeo de Datos

**Del formulario al backend:**
```typescript
// FormData.caseData.litigationData
{
  selectedInvoiceIds: ["inv-1", "inv-2"],
  litigationIds: ["lit-1", "lit-2"],
  reason: "DUE_DATE_CHANGE",
  comment: "Texto...",
  totalAmount: 300000,
  _isValid: true
}

// ↓ Se transforma en ↓

// Payload para bulkLitigatiions
{
  litigation_ids: ["lit-1", "lit-2"],              // ← De litigationIds
  normalization_reason: "DUE_DATE_CHANGE",         // ← De reason
  normalization_by_contact: "Juan Pérez - 555...", // ← De contactValue
  comment: "Texto..."                              // ← De comment
}
```

### Contacto de Normalización

**IMPORTANTE:** El campo `normalization_by_contact` NO se captura en el formulario de normalización. Se debe tomar del contacto seleccionado en "Datos de la gestión":

```typescript
formData.contactValue  // ← Este es el valor a usar
```

Esto permite mantener consistencia con el resto del wizard y reutilizar la lógica de selección de contactos.

---

## 🐛 Troubleshooting

### Problema: No se cargan los litigios

**Verificar:**
1. Que `selectedCombination.executive_comment === "LITIGATION_NORMALIZATION"`
2. Que `dataDebtor.id` exista
3. Que `session?.token` y `profile?.client_id` estén disponibles
4. Revisar la consola para errores del endpoint

### Problema: Todas las facturas aparecen deshabilitadas

**Causa:** Las facturas no tienen litigios asociados

**Verificar:**
1. Response del endpoint `/litigations/debtor/{debtor_id}` contiene datos
2. Los `invoice_id` del response coinciden con los IDs de las facturas seleccionadas
3. Revisar función `hasLitigation()` en ManagementNormalizedLitigationForm

### Problema: El monto total es incorrecto

**Verificar:**
1. Función `getTotalAmount()` está sumando `litigation_amount` (no `invoice.balance`)
2. Los litigations tienen el campo `litigation_amount` poblado
3. El formateo de números no está causando problemas de parsing

---

## 📚 Referencias

- **Configuración de gestión:** `src/app/dashboard/debtor-management/config/management-types.ts` línea 239-255
- **Servicio de litigios:** `src/app/dashboard/litigation/services/index.ts` línea 309-397
- **Razones de normalización:** `src/app/dashboard/data/index.ts` línea 801-816
- **Endpoint de normalización (modal):** `src/app/dashboard/litigation/components/normalize-form.tsx`

---

## ✅ Checklist de Implementación Completada

- [x] Refactorización de ManagementNormalizedLitigationForm
- [x] Eliminación de múltiples litigios y acordeones
- [x] Fetch automático de litigios al seleccionar "Normalización de litigio"
- [x] Validación de facturas contra litigios existentes
- [x] Mostrar monto del litigio en las tarjetas
- [x] Totalizador de montos de litigios
- [x] Campos de razón y comentario
- [x] Integración con razones de normalización de `/dashboard/data`
- [x] Validación Zod completa
- [x] Vista previa mejorada en StepThree con detalles completos
- [x] Generación de `litigationIds` para bulk-normalize
- [x] Eliminación del campo "Contacto de normalización" (se usa el del wizard)
- [x] **Implementación de función `normalizeLitigationsAndGetIds()`**
- [x] **Integración en `handleFinish()` y `handleAddManagement()`**
- [x] **Actualización de `buildTrackPayload()` para normalización**
- [x] **Submit completo del flujo de normalización**

---

**Última actualización:** 2025-01-06
**Estado:** ✅ **Implementación COMPLETA - Lista para testing**
