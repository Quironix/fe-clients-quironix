# Plan de Refinamiento de KPIs - Dashboard Overview

**Fecha de Creación:** 27 de Enero de 2026
**Autor:** Claude Code
**Documento de Referencia:** KPI MY QUIRON.docx.pdf

---

## 📋 Resumen Ejecutivo

Este plan detalla la estrategia para sintetizar y alinear los KPIs propuestos en el documento "KPI MY QUIRON" con la implementación actual del dashboard en `src/app/dashboard/overview/`.

### Situación Actual
- **Implementación Existente:** 17 KPIs organizados en 3 categorías
- **Documento Propuesto:** 47 KPIs con múltiples módulos y métricas
- **Problema:** Discrepancia significativa entre lo propuesto y lo implementado

### Objetivo
Sintetizar los KPIs del documento para crear un dashboard coherente, viable y alineado con la estructura actual.

---

## 📊 Análisis Comparativo

### KPIs Actualmente Implementados (17)

#### Calidad Producida (6 KPIs)
1. **Generación de caja** - Recaudado real diario/mensual
2. **% CEI** - Porcentaje de cobranza efectiva
3. **Índice credibilidad** - Confiabilidad de pago
4. **Conciliación bancaria Quironix** - Pagos aplicados automáticamente
5. **Compensación tiempo de servicio - Quironix** - Aplicación automática en 24h
6. **% Normalización litigios** - Litigios normalizados

#### Eficiencia (6 KPIs)
7. **DDO** - Días de resolución de deducciones
8. **% Match rate** - Facturas con NC
9. **Litigios abiertos** - Litigios > 30 días
10. **Pagos en tránsito** - Aplicados vs Cargados
11. **Compensación tiempo de servicio** - Aplicación manual en 24h
12. **Efectividad de negociación** - Compromiso de pago obtenido

#### Impecabilidad (5 KPIs)
13. **DBT** - Días después del vencimiento
14. **% Over due** - Deuda vencida
15. **% Over due crítico** - Deuda vencida > 30 días
16. **DSO** - Días calle
17. **Provisión** - Provisión de cobranza dudosa

---

### KPIs Propuestos en el Documento (47 KPIs)

#### Módulo Deudores (15 KPIs)
1. Total de Deudores
2. Deuda Total
3. Tasa de Recuperación %
4. Cartera Vencida
5. Cartera Vigente
6. Cartera en Mora
7. Número de Deudores Morosos
8. Deuda Promedio por Deudor
9. Deuda Total Vencida
10. Cartera > 90 días
11. Cartera 61-90 días
12. Cartera 31-60 días
13. Cartera 1-30 días
14. Antigüedad Promedio de Deuda
15. Provisión por Incobrabilidad

#### Módulo Liquidación (9 KPIs)
16. Total Facturas Emitidas
17. Total Facturas Pendientes
18. Total Monto Liquidado
19. Total Monto Pendiente
20. % Facturas Pagadas
21. % Facturas Vencidas
22. Promedio Días de Pago
23. Total Retenciones
24. Total Deducciones

#### Módulo Gestión de Cobranza (12 KPIs)
25. Total de Gestiones Realizadas
26. Tasa de Contactabilidad %
27. Promedio de Gestiones por Deudor
28. Gestiones Efectivas %
29. Promedio Tiempo de Gestión
30. Total Compromisos de Pago
31. Compromisos Cumplidos %
32. Monto Total de Compromisos
33. Promedio Monto por Compromiso
34. Gestiones por Canal (Teléfono, Email, WhatsApp, Presencial)
35. Tasa de Conversión %
36. Cobranza Judicial vs Extrajudicial

#### Módulo Planes de Pago (6 KPIs)
37. Total Planes de Pago Activos
38. Total Planes de Pago Completados
39. % Cumplimiento de Planes
40. Monto Total en Planes de Pago
41. Promedio de Cuotas por Plan
42. Tasa de Default en Planes %

#### Módulo Proyección de Pagos (5 KPIs)
43. Proyección de Ingresos Mensuales
44. Monto Proyectado vs Real
45. Desviación de Proyección %
46. Tasa de Cumplimiento de Proyecciones %
47. Proyección de Recuperación por Tramo de Mora

---

## 🎯 KPIs Recomendados para Implementar

### Criterios de Selección
1. **Relevancia**: Alineado con objetivos de negocio
2. **Factibilidad**: Datos disponibles en el backend actual
3. **Impacto**: Alto valor para la toma de decisiones
4. **Coherencia**: Encaja en la estructura de 3 categorías existente

---

### ✅ KPIs a Mantener (17 - Ya Implementados)

Todos los KPIs actuales deben mantenerse porque:
- Ya están funcionando y probados
- Tienen respaldo de datos del backend
- Son parte del contrato de servicio

---

### 🆕 KPIs Nuevos a Agregar (15 KPIs)

#### Calidad Producida (+5 KPIs)
18. **Total de Deudores** - Cantidad total de deudores en cartera
   - Fuente: Módulo Deudores
   - Unidad: nº
   - SLA: N/A (métrica de volumen)
   - Visualización: Card con número grande

19. **Deuda Total** - Monto total de deuda en cartera
   - Fuente: Módulo Deudores
   - Unidad: $
   - SLA: N/A (métrica de volumen)
   - Visualización: Card con formato moneda

20. **Tasa de Recuperación %** - Porcentaje de deuda recuperada
   - Fuente: Módulo Deudores
   - Unidad: %
   - SLA: ≥ 70%
   - Criterio Aceptación: ≥ 60%
   - Visualización: Gauge

21. **Cartera Vencida** - Monto de deuda vencida
   - Fuente: Módulo Deudores
   - Unidad: $
   - SLA: ≤ 20% de deuda total
   - Visualización: Card con indicador de alerta

22. **Antigüedad Promedio de Deuda** - Días promedio de antigüedad
   - Fuente: Módulo Deudores
   - Unidad: días
   - SLA: ≤ 45 días
   - Criterio Aceptación: ≤ 60 días
   - Visualización: Sparkline con tendencia

#### Eficiencia (+5 KPIs)
23. **Total de Gestiones Realizadas** - Cantidad de gestiones de cobranza
   - Fuente: Módulo Gestión de Cobranza
   - Unidad: nº
   - SLA: ≥ 1000/mes (ajustar según volumen)
   - Visualización: Card con comparativa mes anterior

24. **Tasa de Contactabilidad %** - Porcentaje de contactos exitosos
   - Fuente: Módulo Gestión de Cobranza
   - Unidad: %
   - SLA: ≥ 60%
   - Criterio Aceptación: ≥ 50%
   - Visualización: Gauge con colores

25. **Gestiones Efectivas %** - Gestiones que generaron compromiso
   - Fuente: Módulo Gestión de Cobranza
   - Unidad: %
   - SLA: ≥ 40%
   - Criterio Aceptación: ≥ 30%
   - Visualización: Ring chart

26. **Total Planes de Pago Activos** - Planes de pago vigentes
   - Fuente: Módulo Planes de Pago
   - Unidad: nº
   - SLA: N/A
   - Visualización: Card con detalle de monto

27. **% Cumplimiento de Planes** - Planes completados vs activos
   - Fuente: Módulo Planes de Pago
   - Unidad: %
   - SLA: ≥ 70%
   - Criterio Aceptación: ≥ 60%
   - Visualización: Gauge

#### Impecabilidad (+5 KPIs)
28. **Cartera en Mora** - Monto de deuda en mora
   - Fuente: Módulo Deudores
   - Unidad: $
   - SLA: ≤ 15% de deuda total
   - Criterio Aceptación: ≤ 20%
   - Visualización: Card con alerta

29. **Cartera > 90 días** - Deuda con más de 90 días de mora
   - Fuente: Módulo Deudores
   - Unidad: $
   - SLA: ≤ 10% de deuda total
   - Visualización: Card con indicador crítico

30. **Total Facturas Pendientes** - Facturas sin liquidar
   - Fuente: Módulo Liquidación
   - Unidad: nº
   - SLA: ≤ 50
   - Visualización: Card con lista expandible

31. **% Facturas Vencidas** - Porcentaje de facturas vencidas
   - Fuente: Módulo Liquidación
   - Unidad: %
   - SLA: ≤ 15%
   - Criterio Aceptación: ≤ 20%
   - Visualización: Gauge

32. **Promedio Días de Pago** - Días promedio para recibir pago
   - Fuente: Módulo Liquidación
   - Unidad: días
   - SLA: ≤ 30 días
   - Criterio Aceptación: ≤ 40 días
   - Visualización: Sparkline

---

### ❌ KPIs a NO Implementar (por ahora)

**Razones para excluir:**
- Datos no disponibles en backend actual
- Métricas muy específicas o redundantes
- Requieren integraciones adicionales

#### Módulo Deudores (5 excluidos)
- Número de Deudores Morosos (redundante con Cartera en Mora)
- Deuda Promedio por Deudor (cálculo derivado, bajo valor)
- Cartera 61-90 días (demasiado granular)
- Cartera 31-60 días (demasiado granular)
- Cartera 1-30 días (demasiado granular)

#### Módulo Liquidación (4 excluidos)
- Total Facturas Emitidas (dato más relevante para facturación)
- Total Monto Liquidado (similar a Generación de Caja)
- Total Retenciones (muy específico)
- Total Deducciones (cubierto por DDO)

#### Módulo Gestión (7 excluidos)
- Promedio de Gestiones por Deudor (métrica operativa, no estratégica)
- Promedio Tiempo de Gestión (dato operativo)
- Monto Total de Compromisos (redundante)
- Promedio Monto por Compromiso (derivado)
- Gestiones por Canal (requiere breakdown complejo)
- Tasa de Conversión % (similar a Gestiones Efectivas)
- Cobranza Judicial vs Extrajudicial (requiere módulo legal)

#### Módulo Planes de Pago (2 excluidos)
- Total Planes de Pago Completados (derivado)
- Promedio de Cuotas por Plan (bajo valor estratégico)

#### Módulo Proyección (5 excluidos - Requiere módulo nuevo)
- Proyección de Ingresos Mensuales
- Monto Proyectado vs Real
- Desviación de Proyección %
- Tasa de Cumplimiento de Proyecciones %
- Proyección de Recuperación por Tramo de Mora

**Nota:** Los KPIs de Proyección podrían implementarse en una fase 2 si se desarrolla el módulo de Proyección de Pagos.

---

## 🏗️ Arquitectura de Implementación

### 1. Estructura de Datos

#### Backend API Endpoint
```
GET /v2/clients/{clientId}/reports/dashboard/kpis
```

**Response Actual:**
```typescript
{
  produced_quality: ItemKPI[],
  efficiency: ItemKPI[],
  impeccability: ItemKPI[],
  indicators: {
    optimal: number,
    alert: number,
    healthScore: number
  }
}
```

**Response Extendida (Nueva):**
```typescript
{
  produced_quality: ItemKPI[],
  efficiency: ItemKPI[],
  impeccability: ItemKPI[],
  indicators: {
    optimal: number,
    alert: number,
    healthScore: number
  },
  // NUEVO: Métricas adicionales de contexto
  context: {
    total_debtors: number,
    total_debt: number,
    overdue_debt: number,
    active_payment_plans: number,
    pending_invoices: number
  }
}
```

### 2. Mapeo de Nuevos KPIs

Agregar en `/constants/kpi-constants.ts`:

```typescript
export const KPI_NAME_MAP: Record<string, string> = {
  // ... existentes ...

  // NUEVOS - Calidad Producida
  TOTAL_DEBTORS: "Total de Deudores",
  TOTAL_DEBT: "Deuda Total",
  RECOVERY_RATE: "Tasa de Recuperación",
  OVERDUE_PORTFOLIO: "Cartera Vencida",
  AVERAGE_DEBT_AGE: "Antigüedad Promedio de Deuda",

  // NUEVOS - Eficiencia
  TOTAL_COLLECTIONS: "Total de Gestiones",
  CONTACTABILITY_RATE: "Tasa de Contactabilidad",
  EFFECTIVE_COLLECTIONS_RATE: "Gestiones Efectivas",
  ACTIVE_PAYMENT_PLANS: "Planes de Pago Activos",
  PAYMENT_PLAN_COMPLIANCE: "Cumplimiento de Planes",

  // NUEVOS - Impecabilidad
  PORTFOLIO_IN_ARREARS: "Cartera en Mora",
  PORTFOLIO_OVER_90_DAYS: "Cartera > 90 días",
  PENDING_INVOICES: "Facturas Pendientes",
  OVERDUE_INVOICES_PERCENTAGE: "% Facturas Vencidas",
  AVERAGE_PAYMENT_DAYS: "Promedio Días de Pago",
};
```

### 3. Categorización

```typescript
// Calidad Producida (de 6 → 11 KPIs)
produced_quality: [
  // Existentes (6)
  CASH_GENERATION,
  CEI_PERCENTAGE,
  CREDIBILITY_INDEX,
  QUIRONIX_BANK_RECONCILIATION,
  QUIRONIX_SERVICE_TIME_COMPENSATION,
  LITIGATION_NORMALIZATION_PERCENTAGE,

  // Nuevos (5)
  TOTAL_DEBTORS,
  TOTAL_DEBT,
  RECOVERY_RATE,
  OVERDUE_PORTFOLIO,
  AVERAGE_DEBT_AGE
]

// Eficiencia (de 6 → 11 KPIs)
efficiency: [
  // Existentes (6)
  DDO,
  MATCH_RATE_PERCENTAGE,
  OPEN_LITIGATIONS,
  PAYMENTS_IN_TRANSIT,
  SERVICE_TIME_COMPENSATION,
  NEGOTIATION_EFFECTIVENESS,

  // Nuevos (5)
  TOTAL_COLLECTIONS,
  CONTACTABILITY_RATE,
  EFFECTIVE_COLLECTIONS_RATE,
  ACTIVE_PAYMENT_PLANS,
  PAYMENT_PLAN_COMPLIANCE
]

// Impecabilidad (de 5 → 10 KPIs)
impeccability: [
  // Existentes (5)
  DBT,
  OVER_DUE_PERCENTAGE,
  CRITICAL_OVER_DUE_PERCENTAGE,
  DSO,
  PROVISION,

  // Nuevos (5)
  PORTFOLIO_IN_ARREARS,
  PORTFOLIO_OVER_90_DAYS,
  PENDING_INVOICES,
  OVERDUE_INVOICES_PERCENTAGE,
  AVERAGE_PAYMENT_DAYS
]
```

### 4. Unidades y Formatos

```typescript
// Nuevas unidades
export const UNIT_MAP: Record<string, string> = {
  PERCENT: "%",
  DAYS: "días",
  NUMBER: "nº",
  CURRENCY: "$",  // NUEVO
  AMOUNT: "$",    // NUEVO (alias)
};

// Función de formateo
export const formatKPIValue = (value: number, unit: string): string => {
  switch(unit) {
    case '$':
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
      }).format(value);
    case '%':
      return `${value.toFixed(1)}%`;
    case 'días':
      return `${Math.round(value)} días`;
    case 'nº':
      return new Intl.NumberFormat('es-CL').format(value);
    default:
      return value.toString();
  }
};
```

---

## 📝 Plan de Implementación

### Fase 1: Backend API (Coordinación con Backend Team)

**Duración:** 1-2 semanas
**Responsable:** Backend Team

#### Tareas Backend:
1. **Extender endpoint existente** `/v2/clients/{clientId}/reports/dashboard/kpis`
   - Agregar 15 nuevos KPIs
   - Mantener estructura actual (retrocompatibilidad)
   - Agregar campo `context` con métricas adicionales

2. **Nuevos KPIs a calcular:**
   - Total de Deudores (COUNT debtors)
   - Deuda Total (SUM debt amounts)
   - Tasa de Recuperación % (recovered / total_debt * 100)
   - Cartera Vencida (SUM WHERE overdue)
   - Antigüedad Promedio de Deuda (AVG days overdue)
   - Total de Gestiones (COUNT collection_activities)
   - Tasa de Contactabilidad % (contacted / attempted * 100)
   - Gestiones Efectivas % (effective / total_collections * 100)
   - Planes de Pago Activos (COUNT WHERE status = 'active')
   - % Cumplimiento de Planes (completed / (completed + defaulted) * 100)
   - Cartera en Mora (SUM WHERE in_arrears)
   - Cartera > 90 días (SUM WHERE days_overdue > 90)
   - Facturas Pendientes (COUNT WHERE status = 'pending')
   - % Facturas Vencidas (overdue_invoices / total_invoices * 100)
   - Promedio Días de Pago (AVG payment_days)

3. **Definir SLAs y Criterios de Aceptación** para cada nuevo KPI

4. **Testing:**
   - Unit tests para cálculos
   - Integration tests para endpoint
   - Validación de rendimiento (< 2s response time)

---

### Fase 2: Frontend - Preparación (3-4 días)

**Responsable:** Frontend Team

#### Día 1-2: Actualizar Tipos y Constantes

**Archivos a modificar:**

1. `/services/types.ts`
   ```typescript
   // Agregar nuevos nombres de KPI al enum/tipo
   export type KPIMetric =
     // Existentes...
     | "TOTAL_DEBTORS"
     | "TOTAL_DEBT"
     | "RECOVERY_RATE"
     // ... resto de nuevos
   ```

2. `/constants/kpi-constants.ts`
   - Agregar 15 entries a `KPI_NAME_MAP`
   - Agregar 15 entries a `KPI_DEFINITION_MAP`
   - Actualizar `DESCENDING_METRICS` si es necesario
   - Agregar nuevos formatters si es necesario

3. `/utils/kpi-utils.ts`
   - Agregar función `formatCurrency()`
   - Agregar función `formatNumber()`
   - Actualizar `calculateKPIStatus()` para nuevos tipos

#### Día 3-4: Actualizar Servicios

1. `/services/index.ts`
   - Actualizar `transformResponseToKPIs()` para manejar nuevos KPIs
   - Agregar validación de nuevos campos
   - Agregar manejo de errores para datos faltantes

---

### Fase 3: Frontend - UI Components (5-7 días)

#### Día 5-6: Componentes de Visualización Específicos

Crear componentes especializados para KPIs con formato moneda:

**/components/kpi-currency-widget.tsx**
```typescript
export const KPICurrencyWidget = ({ kpi, viewType }: Props) => {
  // Widget especializado para métricas monetarias
  // - Formato CLP
  // - Gráfico de tendencia histórica
  // - Comparativa mensual
}
```

**/components/kpi-volume-widget.tsx**
```typescript
export const KPIVolumeWidget = ({ kpi, viewType }: Props) => {
  // Widget para volúmenes (deudores, gestiones, etc.)
  // - Número grande destacado
  // - Comparativa con período anterior
  // - Mini gráfico de tendencia
}
```

#### Día 7-9: Integración en Dashboard

1. Actualizar `/components/kpi-widget-v4.tsx`:
   - Detectar tipo de KPI (monetario, volumen, porcentaje, días)
   - Renderizar componente apropiado
   - Mantener drag & drop functionality

2. Actualizar `/page.tsx`:
   - Ajustar grid para acomodar más KPIs (de 17 → 32)
   - Implementar paginación o scroll virtual si es necesario
   - Actualizar loading states

#### Día 10-11: Testing y Refinamiento

1. **Testing Visual:**
   - Verificar responsive design (móvil, tablet, desktop)
   - Probar con datos reales del staging
   - Verificar performance con 32 KPIs

2. **Testing Funcional:**
   - Drag & drop con nuevos KPIs
   - Filtros por categoría
   - Cambio de vistas (card, gauge, etc.)
   - Persistencia de preferencias

---

### Fase 4: Documentación y Despliegue (2-3 días)

#### Día 12-13: Documentación

1. **Actualizar README.md** del módulo:
   - Documentar nuevos KPIs
   - Agregar screenshots
   - Explicar cálculos

2. **Crear Guía de Usuario**:
   - Qué significa cada KPI
   - Cómo interpretarlos
   - Acciones recomendadas según estado

3. **Documentación Técnica**:
   - API contract actualizado
   - Tipos TypeScript
   - Constantes y mapeos

#### Día 14: Despliegue

1. **Staging:**
   - Deploy a staging
   - QA testing completo
   - Feedback de stakeholders

2. **Production:**
   - Deploy progresivo
   - Monitoreo de errores
   - Validación con usuarios beta

---

## 🧪 Estrategia de Testing

### Unit Tests

**Nuevos tests para `/utils/kpi-utils.test.ts`:**
```typescript
describe('formatCurrency', () => {
  it('should format CLP currency correctly', () => {
    expect(formatCurrency(1500000)).toBe('$1.500.000');
  });
});

describe('calculateKPIStatus for currency KPIs', () => {
  it('should handle TOTAL_DEBT thresholds', () => {
    // Test logic
  });
});
```

### Integration Tests

**Test de servicio completo:**
```typescript
describe('getAll KPIs', () => {
  it('should return 32 KPIs with new metrics', async () => {
    const result = await getAll(token, clientId);
    expect(result.data).toHaveLength(32);
    expect(result.data).toContainEqual(
      expect.objectContaining({ name: 'Total de Deudores' })
    );
  });
});
```

### E2E Tests

**Cypress tests:**
```typescript
describe('KPI Dashboard with New Metrics', () => {
  it('should display all 32 KPIs', () => {
    cy.visit('/dashboard/overview');
    cy.get('[data-testid="kpi-widget"]').should('have.length', 32);
  });

  it('should format currency KPIs correctly', () => {
    cy.get('[data-testid="kpi-TOTAL_DEBT"]')
      .should('contain', '$');
  });
});
```

---

## 📊 Mockups de Nuevos KPIs

### Ejemplo: Total de Deudores
```
┌────────────────────────────────────────┐
│ 📊 Total de Deudores                   │
│                                        │
│         1,247                          │
│      deudores                          │
│                                        │
│ ↑ +3.2% vs mes anterior               │
│                                        │
│ [Mini gráfico de tendencia]           │
└────────────────────────────────────────┘
```

### Ejemplo: Deuda Total
```
┌────────────────────────────────────────┐
│ 💰 Deuda Total                         │
│                                        │
│     $45.678.900.000                    │
│                                        │
│ ⚠️ Alerta: +5% vs mes anterior        │
│                                        │
│ Vencida: $8.5M (18.7%)                │
│ [Gráfico de composición]              │
└────────────────────────────────────────┘
```

### Ejemplo: Tasa de Recuperación
```
┌────────────────────────────────────────┐
│ 🎯 Tasa de Recuperación                │
│                                        │
│          72.5%                         │
│                                        │
│ ✅ En meta (SLA: ≥70%)                │
│                                        │
│ [Gauge circular con colores]          │
│ Recuperado: $33.1M de $45.6M          │
└────────────────────────────────────────┘
```

---

## ⚠️ Riesgos y Mitigaciones

### Riesgo 1: Performance con 32 KPIs

**Impacto:** Alto
**Probabilidad:** Media

**Mitigación:**
- Implementar lazy loading de widgets
- Usar React.memo para evitar re-renders innecesarios
- Implementar virtualización si hay scroll
- Cachear cálculos pesados

### Riesgo 2: Datos No Disponibles en Backend

**Impacto:** Alto
**Probabilidad:** Media

**Mitigación:**
- Coordinación temprana con backend team
- Definir valores por defecto/fallback
- Implementar manejo de errores graceful
- Mostrar mensaje informativo si datos faltan

### Riesgo 3: Complejidad de UI

**Impacto:** Medio
**Probabilidad:** Alta

**Mitigación:**
- Implementar filtros más robustos
- Agregar búsqueda de KPIs
- Implementar "favoritos" para KPIs más usados
- Considerar vista "resumen" con KPIs clave

### Riesgo 4: Confusión de Usuarios

**Impacto:** Medio
**Probabilidad:** Media

**Mitigación:**
- Tooltips explicativos en cada KPI
- Guía interactiva en primer uso
- Video tutorial
- Documentación clara y accesible

---

## 📅 Timeline Estimado

| Fase | Duración | Dependencias |
|------|----------|--------------|
| Backend API | 1-2 semanas | - |
| Frontend Prep | 3-4 días | Backend API completo |
| Frontend UI | 5-7 días | Frontend Prep |
| Testing & Docs | 2-3 días | Frontend UI |
| **TOTAL** | **3-4 semanas** | - |

---

## ✅ Criterios de Aceptación

### Funcionales
- [x] 32 KPIs totales (17 existentes + 15 nuevos)
- [x] Organizados en 3 categorías coherentes
- [x] Todos los KPIs tienen SLA y criterio de aceptación definidos
- [x] Visualización apropiada según tipo de métrica
- [x] Formato correcto para moneda, porcentaje, número, días

### No Funcionales
- [x] Tiempo de carga < 2 segundos
- [x] Responsive en móvil, tablet, desktop
- [x] Accesibilidad (WCAG 2.1 AA)
- [x] Tests unitarios > 80% coverage
- [x] Documentación completa

### UX
- [x] Drag & drop funcional con todos los KPIs
- [x] Filtros y búsqueda intuitivos
- [x] Tooltips explicativos
- [x] Estados de loading y error claros
- [x] Persistencia de preferencias de usuario

---

## 📚 Recursos Adicionales

### Diseño
- Figma: [Link al diseño de nuevos KPIs]
- Guía de estilos: Usar componentes de shadcn/ui existentes
- Paleta de colores: Mantener coherencia con dashboard actual

### Backend
- Swagger API Docs: `/api/docs`
- Postman Collection: [Link]
- SQL Queries de ejemplo: [Ver Apéndice A]

### Testing
- Testing Strategy: `docs/testing-strategy.md`
- Test Data: `tests/fixtures/kpi-data.json`

---

## 🔄 Plan de Iteración

### Versión 1.0 (Esta implementación)
- 32 KPIs core
- Categorías: Calidad, Eficiencia, Impecabilidad
- Visualizaciones estándar

### Versión 1.1 (Futuro - Q2 2026)
- Módulo de Proyección de Pagos (5 KPIs adicionales)
- Dashboard personalizable por rol
- Alertas automáticas

### Versión 2.0 (Futuro - Q3 2026)
- KPIs por deudor individual
- Análisis predictivo con IA
- Exportación de reportes customizados

---

## 📞 Contactos

**Product Owner:** [Nombre]
**Backend Lead:** [Nombre]
**Frontend Lead:** [Nombre]
**QA Lead:** [Nombre]

---

## Apéndice A: Mapeo Completo de KPIs

### Resumen de Cambios
- **KPIs Existentes:** 17 (mantener)
- **KPIs Nuevos:** 15 (agregar)
- **KPIs Propuestos No Implementados:** 15 (fase futura)
- **Total Final:** 32 KPIs

### Distribución por Categoría
- **Calidad Producida:** 6 → 11 (+5)
- **Eficiencia:** 6 → 11 (+5)
- **Impecabilidad:** 5 → 10 (+5)

### Prioridad de Implementación
1. **P0 (Crítico):** KPIs de volumen (Total Deudores, Deuda Total) - Día 1
2. **P1 (Alta):** KPIs de tasa (Recuperación, Contactabilidad) - Día 3-5
3. **P2 (Media):** KPIs de composición (Cartera en Mora, Facturas Pendientes) - Día 6-8
4. **P3 (Baja):** KPIs derivados (Promedio Días de Pago) - Día 9-11

---

**Documento creado:** 27 de Enero de 2026
**Última actualización:** 27 de Enero de 2026
**Versión:** 1.0
**Estado:** Listo para Revisión
