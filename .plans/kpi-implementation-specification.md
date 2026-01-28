# Especificación de Implementación de KPIs - My Quiron (Superadmin)

**Fecha:** 27 de Enero de 2026
**Proyecto:** My Quiron - Dashboard Superadmin
**Repositorio Frontend:** `fe-manager-quironix`
**Repositorio Backend:** [Especificar]

---

## 📋 Contexto

Los KPIs descritos en este documento están destinados para el **panel de superadministrador "My Quiron"**, no para el proyecto `fe-clients-quironix`.

**Diferencia Clave:**
- **fe-clients-quironix:** Dashboard del cliente individual (17 KPIs existentes)
- **fe-manager-quironix:** Dashboard del superadmin del SaaS (**15 KPIs nuevos y únicos**)

Este dashboard de superadmin consolida métricas de alto nivel de **todos los clientes** de la plataforma SaaS Quironix.

---

## 🎯 KPIs a Implementar en My Quiron (15 KPIs Nuevos)

### Categoría: Calidad Producida (5 KPIs)

---

#### KPI-CP-01: Total de Deudores
**Descripción:** Cantidad total de deudores en cartera consolidada de todos los clientes del SaaS.

**Especificación Técnica:**
- **ID:** `TOTAL_DEBTORS`
- **Tipo:** Volumen
- **Unidad:** `nº`
- **Fórmula:** `COUNT(DISTINCT debtors) WHERE client_id IN (all_clients)`
- **SLA:** N/A (métrica de volumen)
- **Criterio Aceptación:** N/A
- **Granularidad:** Diario + Mensual
- **Fuente de Datos:** `debtors` table (consolidada)
- **Visualización:** Card con número grande + tendencia mensual

**Request API:**
```http
GET /v2/superadmin/kpis/total-debtors?period=monthly&from=2026-01-01&to=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "TOTAL_DEBTORS",
  "name": "Total de Deudores",
  "value": 15847,
  "unit": "nº",
  "period": {
    "from": "2026-01-01",
    "to": "2026-01-31",
    "type": "monthly"
  },
  "breakdown": {
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "debtors": 5234
      },
      {
        "client_id": "client-2",
        "client_name": "Empresa B",
        "debtors": 3891
      }
    ],
    "by_region": [
      {
        "region": "Metropolitana",
        "debtors": 8234
      },
      {
        "region": "Valparaíso",
        "debtors": 3456
      }
    ]
  },
  "trend": {
    "previous_month": 15234,
    "change": 613,
    "change_percentage": 4.0
  }
}
```

---

#### KPI-CP-02: Deuda Total
**Descripción:** Monto total de deuda en cartera de todos los clientes del SaaS.

**Especificación Técnica:**
- **ID:** `TOTAL_DEBT`
- **Tipo:** Monetario
- **Unidad:** `$` (CLP)
- **Fórmula:** `SUM(debt_amount) WHERE client_id IN (all_clients)`
- **SLA:** N/A (métrica de volumen)
- **Criterio Aceptación:** N/A
- **Granularidad:** Diario + Mensual
- **Fuente de Datos:** `debtors` table, campo `outstanding_balance`
- **Visualización:** Card con formato moneda + gráfico de composición

**Request API:**
```http
GET /v2/superadmin/kpis/total-debt?period=monthly&from=2026-01-01&to=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "TOTAL_DEBT",
  "name": "Deuda Total",
  "value": 45678900000,
  "unit": "$",
  "period": {
    "from": "2026-01-01",
    "to": "2026-01-31",
    "type": "monthly"
  },
  "breakdown": {
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "debt": 18500000000
      }
    ],
    "by_status": [
      {
        "status": "vigente",
        "amount": 30123400000,
        "percentage": 65.9
      },
      {
        "status": "vencida",
        "amount": 15555500000,
        "percentage": 34.1
      }
    ]
  },
  "trend": {
    "previous_month": 43234500000,
    "change": 2444400000,
    "change_percentage": 5.7
  }
}
```

---

#### KPI-CP-03: Tasa de Recuperación
**Descripción:** Porcentaje de deuda recuperada respecto al total de deuda en cartera (consolidado).

**Especificación Técnica:**
- **ID:** `RECOVERY_RATE`
- **Tipo:** Porcentaje
- **Unidad:** `%`
- **Fórmula:** `(SUM(recovered_amount) / SUM(total_debt)) * 100`
- **SLA:** ≥ 70%
- **Criterio Aceptación:** ≥ 60%
- **Dirección:** Ascendente (mayor es mejor)
- **Granularidad:** Mensual
- **Fuente de Datos:** `payments` + `debtors` tables
- **Visualización:** Gauge con colores (rojo < 60%, amarillo 60-70%, verde > 70%)

**Request API:**
```http
GET /v2/superadmin/kpis/recovery-rate?period=monthly&from=2026-01-01&to=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "RECOVERY_RATE",
  "name": "Tasa de Recuperación",
  "value": 72.5,
  "unit": "%",
  "thresholds": {
    "sla": 70,
    "acceptance_criteria": 60,
    "direction": "ascending"
  },
  "status": "success",
  "period": {
    "from": "2026-01-01",
    "to": "2026-01-31",
    "type": "monthly"
  },
  "breakdown": {
    "total_debt": 45678900000,
    "recovered_amount": 33117303000,
    "pending_amount": 12561597000,
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "recovery_rate": 78.3
      }
    ]
  },
  "trend": {
    "previous_month": 68.2,
    "change": 4.3,
    "change_percentage": 6.3
  }
}
```

---

#### KPI-CP-04: Cartera Vencida
**Descripción:** Monto total de deuda vencida en todos los clientes del SaaS.

**Especificación Técnica:**
- **ID:** `OVERDUE_PORTFOLIO`
- **Tipo:** Monetario
- **Unidad:** `$` (CLP)
- **Fórmula:** `SUM(debt_amount) WHERE due_date < CURRENT_DATE`
- **SLA:** ≤ 20% de deuda total
- **Criterio Aceptación:** ≤ 25%
- **Dirección:** Descendente (menor es mejor)
- **Granularidad:** Diario
- **Fuente de Datos:** `debtors` table WHERE `status = 'overdue'`
- **Visualización:** Card con indicador de alerta + porcentaje respecto al total

**Request API:**
```http
GET /v2/superadmin/kpis/overdue-portfolio?date=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "OVERDUE_PORTFOLIO",
  "name": "Cartera Vencida",
  "value": 8550000000,
  "unit": "$",
  "thresholds": {
    "sla": 20,
    "acceptance_criteria": 25,
    "direction": "descending"
  },
  "status": "success",
  "percentage_of_total": 18.7,
  "breakdown": {
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "overdue_amount": 3200000000,
        "percentage": 37.4
      }
    ],
    "by_age_range": [
      {
        "range": "1-30 días",
        "amount": 4100000000,
        "percentage": 47.9
      },
      {
        "range": "31-60 días",
        "amount": 2300000000,
        "percentage": 26.9
      },
      {
        "range": "61-90 días",
        "amount": 1200000000,
        "percentage": 14.0
      },
      {
        "range": "> 90 días",
        "amount": 950000000,
        "percentage": 11.1
      }
    ]
  },
  "trend": {
    "previous_period": 9100000000,
    "change": -550000000,
    "change_percentage": -6.0
  }
}
```

---

#### KPI-CP-05: Antigüedad Promedio de Deuda
**Descripción:** Promedio de días de antigüedad de la deuda consolidada.

**Especificación Técnica:**
- **ID:** `AVERAGE_DEBT_AGE`
- **Tipo:** Días
- **Unidad:** `días`
- **Fórmula:** `AVG(CURRENT_DATE - invoice_date) WHERE status IN ('pending', 'overdue')`
- **SLA:** ≤ 45 días
- **Criterio Aceptación:** ≤ 60 días
- **Dirección:** Descendente (menor es mejor)
- **Granularidad:** Diario
- **Fuente de Datos:** `invoices` + `debtors` tables
- **Visualización:** Sparkline con tendencia semanal

**Request API:**
```http
GET /v2/superadmin/kpis/average-debt-age?period=weekly&from=2026-01-01&to=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "AVERAGE_DEBT_AGE",
  "name": "Antigüedad Promedio de Deuda",
  "value": 52,
  "unit": "días",
  "thresholds": {
    "sla": 45,
    "acceptance_criteria": 60,
    "direction": "descending"
  },
  "status": "warning",
  "breakdown": {
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "average_age": 48
      }
    ],
    "by_status": [
      {
        "status": "vigente",
        "average_age": 23
      },
      {
        "status": "vencida",
        "average_age": 87
      }
    ]
  },
  "history": [
    { "date": "2026-01-07", "value": 55 },
    { "date": "2026-01-14", "value": 53 },
    { "date": "2026-01-21", "value": 51 },
    { "date": "2026-01-28", "value": 52 }
  ],
  "trend": {
    "previous_week": 51,
    "change": 1,
    "change_percentage": 2.0
  }
}
```

---

### Categoría: Eficiencia (5 KPIs)

---

#### KPI-EF-01: Total de Gestiones Realizadas
**Descripción:** Cantidad total de gestiones de cobranza realizadas por todos los clientes del SaaS.

**Especificación Técnica:**
- **ID:** `TOTAL_COLLECTIONS`
- **Tipo:** Volumen
- **Unidad:** `nº`
- **Fórmula:** `COUNT(collection_activities) WHERE client_id IN (all_clients)`
- **SLA:** ≥ 10000/mes (ajustar según volumen total)
- **Criterio Aceptación:** ≥ 8000/mes
- **Dirección:** Ascendente (mayor actividad = mejor)
- **Granularidad:** Diario + Mensual
- **Fuente de Datos:** `collection_activities` table
- **Visualización:** Card con comparativa mes anterior + gráfico de barras semanal

**Request API:**
```http
GET /v2/superadmin/kpis/total-collections?period=monthly&from=2026-01-01&to=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "TOTAL_COLLECTIONS",
  "name": "Total de Gestiones Realizadas",
  "value": 12450,
  "unit": "nº",
  "thresholds": {
    "sla": 10000,
    "acceptance_criteria": 8000,
    "direction": "ascending"
  },
  "status": "success",
  "breakdown": {
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "collections": 4320
      }
    ],
    "by_channel": [
      {
        "channel": "Teléfono",
        "count": 6780,
        "percentage": 54.5
      },
      {
        "channel": "Email",
        "count": 3120,
        "percentage": 25.1
      },
      {
        "channel": "WhatsApp",
        "count": 1890,
        "percentage": 15.2
      },
      {
        "channel": "Presencial",
        "count": 660,
        "percentage": 5.3
      }
    ],
    "by_week": [
      { "week": 1, "count": 2890 },
      { "week": 2, "count": 3120 },
      { "week": 3, "count": 3340 },
      { "week": 4, "count": 3100 }
    ]
  },
  "trend": {
    "previous_month": 11230,
    "change": 1220,
    "change_percentage": 10.9
  }
}
```

---

#### KPI-EF-02: Tasa de Contactabilidad
**Descripción:** Porcentaje de gestiones donde se logró contactar al deudor (consolidado).

**Especificación Técnica:**
- **ID:** `CONTACTABILITY_RATE`
- **Tipo:** Porcentaje
- **Unidad:** `%`
- **Fórmula:** `(COUNT(contacted) / COUNT(attempted)) * 100`
- **SLA:** ≥ 60%
- **Criterio Aceptación:** ≥ 50%
- **Dirección:** Ascendente (mayor es mejor)
- **Granularidad:** Diario + Mensual
- **Fuente de Datos:** `collection_activities` WHERE `outcome IN ('contacted', 'not_contacted')`
- **Visualización:** Gauge con colores + breakdown por canal

**Request API:**
```http
GET /v2/superadmin/kpis/contactability-rate?period=monthly&from=2026-01-01&to=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "CONTACTABILITY_RATE",
  "name": "Tasa de Contactabilidad",
  "value": 64.2,
  "unit": "%",
  "thresholds": {
    "sla": 60,
    "acceptance_criteria": 50,
    "direction": "ascending"
  },
  "status": "success",
  "breakdown": {
    "total_attempts": 12450,
    "successful_contacts": 7993,
    "failed_contacts": 4457,
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "contactability_rate": 68.5
      }
    ],
    "by_channel": [
      {
        "channel": "Teléfono",
        "rate": 58.3
      },
      {
        "channel": "Email",
        "rate": 45.2
      },
      {
        "channel": "WhatsApp",
        "rate": 78.9
      },
      {
        "channel": "Presencial",
        "rate": 92.1
      }
    ]
  },
  "trend": {
    "previous_month": 61.8,
    "change": 2.4,
    "change_percentage": 3.9
  }
}
```

---

#### KPI-EF-03: Gestiones Efectivas
**Descripción:** Porcentaje de gestiones que generaron un compromiso de pago.

**Especificación Técnica:**
- **ID:** `EFFECTIVE_COLLECTIONS_RATE`
- **Tipo:** Porcentaje
- **Unidad:** `%`
- **Fórmula:** `(COUNT(outcome = 'payment_commitment') / COUNT(contacted)) * 100`
- **SLA:** ≥ 40%
- **Criterio Aceptación:** ≥ 30%
- **Dirección:** Ascendente (mayor es mejor)
- **Granularidad:** Mensual
- **Fuente de Datos:** `collection_activities` WHERE `outcome = 'payment_commitment'`
- **Visualización:** Ring chart con desglose

**Request API:**
```http
GET /v2/superadmin/kpis/effective-collections-rate?period=monthly&from=2026-01-01&to=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "EFFECTIVE_COLLECTIONS_RATE",
  "name": "Gestiones Efectivas",
  "value": 42.7,
  "unit": "%",
  "thresholds": {
    "sla": 40,
    "acceptance_criteria": 30,
    "direction": "ascending"
  },
  "status": "success",
  "breakdown": {
    "total_contacted": 7993,
    "effective_collections": 3413,
    "non_effective_collections": 4580,
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "effectiveness_rate": 45.8
      }
    ],
    "by_outcome": [
      {
        "outcome": "Compromiso de pago",
        "count": 3413,
        "percentage": 42.7
      },
      {
        "outcome": "Rechazado",
        "count": 2890,
        "percentage": 36.2
      },
      {
        "outcome": "Información incompleta",
        "count": 1690,
        "percentage": 21.1
      }
    ]
  },
  "trend": {
    "previous_month": 38.9,
    "change": 3.8,
    "change_percentage": 9.8
  }
}
```

---

#### KPI-EF-04: Total Planes de Pago Activos
**Descripción:** Cantidad de planes de pago vigentes en todos los clientes del SaaS.

**Especificación Técnica:**
- **ID:** `ACTIVE_PAYMENT_PLANS`
- **Tipo:** Volumen
- **Unidad:** `nº`
- **Fórmula:** `COUNT(payment_plans) WHERE status = 'active'`
- **SLA:** N/A (métrica de volumen)
- **Criterio Aceptación:** N/A
- **Granularidad:** Diario
- **Fuente de Datos:** `payment_plans` table
- **Visualización:** Card con detalle de monto total + desglose por cliente

**Request API:**
```http
GET /v2/superadmin/kpis/active-payment-plans?date=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "ACTIVE_PAYMENT_PLANS",
  "name": "Total Planes de Pago Activos",
  "value": 2347,
  "unit": "nº",
  "breakdown": {
    "total_amount": 8950000000,
    "average_amount_per_plan": 3813000,
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "active_plans": 890,
        "total_amount": 3400000000
      }
    ],
    "by_installments": [
      {
        "range": "1-6 cuotas",
        "count": 1120,
        "percentage": 47.7
      },
      {
        "range": "7-12 cuotas",
        "count": 890,
        "percentage": 37.9
      },
      {
        "range": "> 12 cuotas",
        "count": 337,
        "percentage": 14.4
      }
    ]
  },
  "trend": {
    "previous_month": 2198,
    "change": 149,
    "change_percentage": 6.8
  }
}
```

---

#### KPI-EF-05: Cumplimiento de Planes
**Descripción:** Porcentaje de planes de pago completados exitosamente vs total de planes finalizados.

**Especificación Técnica:**
- **ID:** `PAYMENT_PLAN_COMPLIANCE`
- **Tipo:** Porcentaje
- **Unidad:** `%`
- **Fórmula:** `(COUNT(status = 'completed') / COUNT(status IN ('completed', 'defaulted'))) * 100`
- **SLA:** ≥ 70%
- **Criterio Aceptación:** ≥ 60%
- **Dirección:** Ascendente (mayor es mejor)
- **Granularidad:** Mensual
- **Fuente de Datos:** `payment_plans` table
- **Visualización:** Gauge + tabla de planes completados vs incumplidos

**Request API:**
```http
GET /v2/superadmin/kpis/payment-plan-compliance?period=monthly&from=2026-01-01&to=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "PAYMENT_PLAN_COMPLIANCE",
  "name": "Cumplimiento de Planes",
  "value": 73.4,
  "unit": "%",
  "thresholds": {
    "sla": 70,
    "acceptance_criteria": 60,
    "direction": "ascending"
  },
  "status": "success",
  "breakdown": {
    "total_finalized": 456,
    "completed": 335,
    "defaulted": 121,
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "compliance_rate": 76.8
      }
    ],
    "by_installments": [
      {
        "range": "1-6 cuotas",
        "compliance_rate": 81.2
      },
      {
        "range": "7-12 cuotas",
        "compliance_rate": 68.9
      },
      {
        "range": "> 12 cuotas",
        "compliance_rate": 54.3
      }
    ]
  },
  "trend": {
    "previous_month": 69.8,
    "change": 3.6,
    "change_percentage": 5.2
  }
}
```

---

### Categoría: Impecabilidad (5 KPIs)

---

#### KPI-IM-01: Cartera en Mora
**Descripción:** Monto total de deuda en mora (con atraso confirmado) en todos los clientes.

**Especificación Técnica:**
- **ID:** `PORTFOLIO_IN_ARREARS`
- **Tipo:** Monetario
- **Unidad:** `$` (CLP)
- **Fórmula:** `SUM(debt_amount) WHERE days_overdue > 0`
- **SLA:** ≤ 15% de deuda total
- **Criterio Aceptación:** ≤ 20%
- **Dirección:** Descendente (menor es mejor)
- **Granularidad:** Diario
- **Fuente de Datos:** `debtors` WHERE `status = 'in_arrears'`
- **Visualización:** Card con alerta + porcentaje del total + gráfico de tendencia

**Request API:**
```http
GET /v2/superadmin/kpis/portfolio-in-arrears?date=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "PORTFOLIO_IN_ARREARS",
  "name": "Cartera en Mora",
  "value": 6850000000,
  "unit": "$",
  "thresholds": {
    "sla": 15,
    "acceptance_criteria": 20,
    "direction": "descending"
  },
  "status": "success",
  "percentage_of_total": 15.0,
  "breakdown": {
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "arrears_amount": 2600000000,
        "percentage_of_client_total": 14.1
      }
    ],
    "by_days_range": [
      {
        "range": "1-15 días",
        "amount": 3400000000,
        "percentage": 49.6
      },
      {
        "range": "16-30 días",
        "amount": 1890000000,
        "percentage": 27.6
      },
      {
        "range": "31-60 días",
        "amount": 1100000000,
        "percentage": 16.1
      },
      {
        "range": "> 60 días",
        "amount": 460000000,
        "percentage": 6.7
      }
    ]
  },
  "trend": {
    "previous_week": 7100000000,
    "change": -250000000,
    "change_percentage": -3.5
  }
}
```

---

#### KPI-IM-02: Cartera > 90 días
**Descripción:** Deuda con más de 90 días de mora (consolidado). Indicador crítico de riesgo de incobrabilidad.

**Especificación Técnica:**
- **ID:** `PORTFOLIO_OVER_90_DAYS`
- **Tipo:** Monetario
- **Unidad:** `$` (CLP)
- **Fórmula:** `SUM(debt_amount) WHERE days_overdue > 90`
- **SLA:** ≤ 10% de deuda total
- **Criterio Aceptación:** ≤ 15%
- **Dirección:** Descendente (menor es mejor)
- **Granularidad:** Semanal
- **Fuente de Datos:** `debtors` WHERE `days_overdue > 90`
- **Visualización:** Card con indicador crítico + % del total

**Request API:**
```http
GET /v2/superadmin/kpis/portfolio-over-90-days?date=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "PORTFOLIO_OVER_90_DAYS",
  "name": "Cartera > 90 días",
  "value": 3420000000,
  "unit": "$",
  "thresholds": {
    "sla": 10,
    "acceptance_criteria": 15,
    "direction": "descending"
  },
  "status": "warning",
  "percentage_of_total": 7.5,
  "breakdown": {
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "amount": 1300000000,
        "percentage_of_client_total": 7.0
      }
    ],
    "by_age_range": [
      {
        "range": "91-180 días",
        "amount": 2100000000,
        "percentage": 61.4
      },
      {
        "range": "181-365 días",
        "amount": 980000000,
        "percentage": 28.7
      },
      {
        "range": "> 365 días",
        "amount": 340000000,
        "percentage": 9.9
      }
    ]
  },
  "trend": {
    "previous_week": 3560000000,
    "change": -140000000,
    "change_percentage": -3.9
  }
}
```

---

#### KPI-IM-03: Total Facturas Pendientes
**Descripción:** Cantidad de facturas sin liquidar en todos los clientes del SaaS.

**Especificación Técnica:**
- **ID:** `PENDING_INVOICES`
- **Tipo:** Volumen
- **Unidad:** `nº`
- **Fórmula:** `COUNT(invoices) WHERE status = 'pending'`
- **SLA:** ≤ 500
- **Criterio Aceptación:** ≤ 700
- **Dirección:** Descendente (menor es mejor)
- **Granularidad:** Diario
- **Fuente de Datos:** `invoices` table
- **Visualización:** Card con lista expandible + monto total

**Request API:**
```http
GET /v2/superadmin/kpis/pending-invoices?date=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "PENDING_INVOICES",
  "name": "Total Facturas Pendientes",
  "value": 423,
  "unit": "nº",
  "thresholds": {
    "sla": 500,
    "acceptance_criteria": 700,
    "direction": "descending"
  },
  "status": "success",
  "breakdown": {
    "total_amount": 5600000000,
    "average_amount": 13240000,
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "pending_invoices": 156,
        "total_amount": 2100000000
      }
    ],
    "by_age": [
      {
        "range": "< 30 días",
        "count": 245,
        "percentage": 57.9
      },
      {
        "range": "30-60 días",
        "count": 112,
        "percentage": 26.5
      },
      {
        "range": "> 60 días",
        "count": 66,
        "percentage": 15.6
      }
    ]
  },
  "trend": {
    "previous_week": 445,
    "change": -22,
    "change_percentage": -4.9
  }
}
```

---

#### KPI-IM-04: % Facturas Vencidas
**Descripción:** Porcentaje de facturas vencidas respecto al total de facturas pendientes.

**Especificación Técnica:**
- **ID:** `OVERDUE_INVOICES_PERCENTAGE`
- **Tipo:** Porcentaje
- **Unidad:** `%`
- **Fórmula:** `(COUNT(invoices WHERE status = 'overdue') / COUNT(invoices WHERE status IN ('pending', 'overdue'))) * 100`
- **SLA:** ≤ 15%
- **Criterio Aceptación:** ≤ 20%
- **Dirección:** Descendente (menor es mejor)
- **Granularidad:** Diario
- **Fuente de Datos:** `invoices` table
- **Visualización:** Gauge + breakdown por cliente

**Request API:**
```http
GET /v2/superadmin/kpis/overdue-invoices-percentage?date=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "OVERDUE_INVOICES_PERCENTAGE",
  "name": "% Facturas Vencidas",
  "value": 12.3,
  "unit": "%",
  "thresholds": {
    "sla": 15,
    "acceptance_criteria": 20,
    "direction": "descending"
  },
  "status": "success",
  "breakdown": {
    "total_invoices": 423,
    "overdue_invoices": 52,
    "pending_invoices": 371,
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "overdue_percentage": 10.9
      }
    ],
    "overdue_amount": 780000000,
    "overdue_amount_percentage": 13.9
  },
  "trend": {
    "previous_week": 14.6,
    "change": -2.3,
    "change_percentage": -15.8
  }
}
```

---

#### KPI-IM-05: Promedio Días de Pago
**Descripción:** Promedio de días transcurridos desde la emisión de factura hasta el pago efectivo.

**Especificación Técnica:**
- **ID:** `AVERAGE_PAYMENT_DAYS`
- **Tipo:** Días
- **Unidad:** `días`
- **Fórmula:** `AVG(payment_date - invoice_date) WHERE status = 'paid'`
- **SLA:** ≤ 30 días
- **Criterio Aceptación:** ≤ 40 días
- **Dirección:** Descendente (menor es mejor)
- **Granularidad:** Mensual
- **Fuente de Datos:** `invoices` WHERE `status = 'paid'`
- **Visualización:** Sparkline con tendencia mensual + comparativa por cliente

**Request API:**
```http
GET /v2/superadmin/kpis/average-payment-days?period=monthly&from=2026-01-01&to=2026-01-31
```

**Response API:**
```json
{
  "kpi_id": "AVERAGE_PAYMENT_DAYS",
  "name": "Promedio Días de Pago",
  "value": 35,
  "unit": "días",
  "thresholds": {
    "sla": 30,
    "acceptance_criteria": 40,
    "direction": "descending"
  },
  "status": "warning",
  "breakdown": {
    "total_paid_invoices": 1234,
    "by_client": [
      {
        "client_id": "client-1",
        "client_name": "Empresa A",
        "average_days": 32
      }
    ],
    "by_payment_range": [
      {
        "range": "0-15 días",
        "count": 345,
        "percentage": 28.0
      },
      {
        "range": "16-30 días",
        "count": 456,
        "percentage": 37.0
      },
      {
        "range": "31-45 días",
        "count": 289,
        "percentage": 23.4
      },
      {
        "range": "> 45 días",
        "count": 144,
        "percentage": 11.7
      }
    ]
  },
  "history": [
    { "month": "2025-10", "value": 38 },
    { "month": "2025-11", "value": 36 },
    { "month": "2025-12", "value": 37 },
    { "month": "2026-01", "value": 35 }
  ],
  "trend": {
    "previous_month": 37,
    "change": -2,
    "change_percentage": -5.4
  }
}
```

---

## ❌ KPIs NO Implementar (Fase 2 o Descartados)

Los siguientes KPIs del documento original **NO se implementarán** en esta versión por las razones indicadas:

### Módulo Deudores (5 KPIs excluidos)
1. **Cartera Vigente** - Redundante (= Deuda Total - Cartera Vencida)
2. **Número de Deudores Morosos** - Redundante con Cartera en Mora
3. **Deuda Promedio por Deudor** - Métrica derivada, bajo valor estratégico
4. **Cartera 61-90 días** - Demasiado granular (incluido en breakdown de Cartera Vencida)
5. **Cartera 31-60 días** - Demasiado granular (incluido en breakdown de Cartera Vencida)
6. **Cartera 1-30 días** - Demasiado granular (incluido en breakdown de Cartera Vencida)
7. **Provisión por Incobrabilidad** - Ya existe en fe-clients-quironix (KPI individual)
8. **Deuda Total Vencida** - Redundante con Cartera Vencida

### Módulo Liquidación (4 KPIs excluidos)
9. **Total Facturas Emitidas** - Dato más relevante para módulo de facturación
10. **Total Monto Liquidado** - Similar a métricas de recaudación existentes
11. **Total Monto Pendiente** - Derivado de Facturas Pendientes
12. **% Facturas Pagadas** - Inverso de % Facturas Vencidas
13. **Total Retenciones** - Muy específico, requiere módulo contable
14. **Total Deducciones** - Muy específico, requiere módulo contable

### Módulo Gestión de Cobranza (7 KPIs excluidos)
15. **Promedio de Gestiones por Deudor** - Métrica operativa, no estratégica
16. **Promedio Tiempo de Gestión** - Dato operativo, bajo valor para superadmin
17. **Total Compromisos de Pago** - Cubierto por Gestiones Efectivas
18. **Compromisos Cumplidos %** - Similar a Cumplimiento de Planes
19. **Monto Total de Compromisos** - Redundante
20. **Promedio Monto por Compromiso** - Métrica derivada
21. **Gestiones por Canal** - Incluido como breakdown en Total de Gestiones
22. **Tasa de Conversión %** - Similar a Gestiones Efectivas
23. **Cobranza Judicial vs Extrajudicial** - Requiere módulo legal específico

### Módulo Planes de Pago (3 KPIs excluidos)
24. **Total Planes de Pago Completados** - Derivado de Cumplimiento de Planes
25. **Monto Total en Planes de Pago** - Incluido en breakdown de Planes Activos
26. **Promedio de Cuotas por Plan** - Bajo valor estratégico para superadmin
27. **Tasa de Default en Planes %** - Inverso de Cumplimiento de Planes

### Módulo Proyección de Pagos (5 KPIs excluidos - Fase 2)
28. **Proyección de Ingresos Mensuales** - Requiere módulo de proyección nuevo
29. **Monto Proyectado vs Real** - Requiere módulo de proyección nuevo
30. **Desviación de Proyección %** - Requiere módulo de proyección nuevo
31. **Tasa de Cumplimiento de Proyecciones %** - Requiere módulo de proyección nuevo
32. **Proyección de Recuperación por Tramo de Mora** - Requiere módulo de proyección nuevo

**Nota:** Los 5 KPIs de Proyección podrían implementarse en **Fase 2** si se desarrolla el módulo de Proyección de Pagos en fe-manager-quironix.

---

## 🏗️ API Backend - Arquitectura Propuesta

### Endpoint Principal

```http
GET /v2/superadmin/kpis
```

**Query Parameters:**
- `period`: `daily` | `weekly` | `monthly` (default: `monthly`)
- `from`: Fecha inicio (ISO 8601) - opcional
- `to`: Fecha fin (ISO 8601) - opcional
- `category`: `calidad_producida` | `eficiencia` | `impecabilidad` | `all` (default: `all`)
- `client_id`: Filtrar por cliente específico - opcional

**Response Structure:**
```json
{
  "metadata": {
    "period": "monthly",
    "from": "2026-01-01",
    "to": "2026-01-31",
    "generated_at": "2026-01-31T23:59:59Z",
    "total_clients": 45
  },
  "calidad_producida": [
    {
      "kpi_id": "TOTAL_DEBTORS",
      "name": "Total de Deudores",
      "value": 15847,
      "unit": "nº",
      "status": null,
      "thresholds": null,
      "breakdown": { ... },
      "trend": { ... }
    },
    // ... 4 KPIs más
  ],
  "eficiencia": [
    // ... 5 KPIs
  ],
  "impecabilidad": [
    // ... 5 KPIs
  ],
  "summary": {
    "optimal": 10,
    "warning": 3,
    "error": 2,
    "health_score": 78.5
  }
}
```

### Endpoints Individuales

Cada KPI tiene su endpoint específico para obtener datos detallados:

```http
GET /v2/superadmin/kpis/total-debtors
GET /v2/superadmin/kpis/total-debt
GET /v2/superadmin/kpis/recovery-rate
GET /v2/superadmin/kpis/overdue-portfolio
GET /v2/superadmin/kpis/average-debt-age
GET /v2/superadmin/kpis/total-collections
GET /v2/superadmin/kpis/contactability-rate
GET /v2/superadmin/kpis/effective-collections-rate
GET /v2/superadmin/kpis/active-payment-plans
GET /v2/superadmin/kpis/payment-plan-compliance
GET /v2/superadmin/kpis/portfolio-in-arrears
GET /v2/superadmin/kpis/portfolio-over-90-days
GET /v2/superadmin/kpis/pending-invoices
GET /v2/superadmin/kpis/overdue-invoices-percentage
GET /v2/superadmin/kpis/average-payment-days
```

### Autenticación

```http
Authorization: Bearer {superadmin_token}
```

**Scope Requerido:** `superadmin.kpis.read`

---

## 🎨 Frontend - Arquitectura Propuesta para fe-manager-quironix

### Estructura de Archivos

```
fe-manager-quironix/
├── src/
│   ├── app/
│   │   └── dashboard/
│   │       └── kpis/
│   │           ├── page.tsx                    # Página principal KPIs
│   │           ├── components/
│   │           │   ├── kpi-summary-header.tsx  # Header con resumen
│   │           │   ├── kpi-widget.tsx          # Widget individual
│   │           │   ├── kpi-currency-widget.tsx # Widget monetario
│   │           │   ├── kpi-volume-widget.tsx   # Widget volumen
│   │           │   ├── kpi-percentage-widget.tsx # Widget porcentaje
│   │           │   ├── kpi-days-widget.tsx     # Widget días
│   │           │   ├── kpi-filters.tsx         # Filtros
│   │           │   └── kpi-client-selector.tsx # Selector de cliente
│   │           ├── services/
│   │           │   ├── index.ts                # API calls
│   │           │   └── types.ts                # TypeScript types
│   │           ├── store/
│   │           │   └── index.tsx               # Zustand store
│   │           ├── hooks/
│   │           │   ├── useKPIData.ts           # React Query hook
│   │           │   └── useKPIFilters.ts        # Filtros hook
│   │           ├── constants/
│   │           │   └── kpi-constants.ts        # Constantes y mapeos
│   │           └── utils/
│   │               ├── kpi-formatters.ts       # Formatters
│   │               └── kpi-calculators.ts      # Cálculos
```

### Tipos TypeScript

**`services/types.ts`:**
```typescript
export type KPICategory = 'calidad_producida' | 'eficiencia' | 'impecabilidad';

export type KPIMetric =
  | 'TOTAL_DEBTORS'
  | 'TOTAL_DEBT'
  | 'RECOVERY_RATE'
  | 'OVERDUE_PORTFOLIO'
  | 'AVERAGE_DEBT_AGE'
  | 'TOTAL_COLLECTIONS'
  | 'CONTACTABILITY_RATE'
  | 'EFFECTIVE_COLLECTIONS_RATE'
  | 'ACTIVE_PAYMENT_PLANS'
  | 'PAYMENT_PLAN_COMPLIANCE'
  | 'PORTFOLIO_IN_ARREARS'
  | 'PORTFOLIO_OVER_90_DAYS'
  | 'PENDING_INVOICES'
  | 'OVERDUE_INVOICES_PERCENTAGE'
  | 'AVERAGE_PAYMENT_DAYS';

export type KPIUnit = 'nº' | '$' | '%' | 'días';

export type KPIStatus = 'success' | 'warning' | 'error' | null;

export interface KPIThresholds {
  sla: number;
  acceptance_criteria: number;
  direction: 'ascending' | 'descending';
}

export interface KPITrend {
  previous_period: number;
  change: number;
  change_percentage: number;
}

export interface KPIBreakdown {
  by_client?: Array<{
    client_id: string;
    client_name: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface KPI {
  kpi_id: KPIMetric;
  name: string;
  value: number;
  unit: KPIUnit;
  status?: KPIStatus;
  thresholds?: KPIThresholds;
  breakdown?: KPIBreakdown;
  trend?: KPITrend;
  history?: Array<{ date: string; value: number }>;
}

export interface KPIResponse {
  metadata: {
    period: 'daily' | 'weekly' | 'monthly';
    from: string;
    to: string;
    generated_at: string;
    total_clients: number;
  };
  calidad_producida: KPI[];
  eficiencia: KPI[];
  impecabilidad: KPI[];
  summary: {
    optimal: number;
    warning: number;
    error: number;
    health_score: number;
  };
}
```

### Constantes

**`constants/kpi-constants.ts`:**
```typescript
export const KPI_NAME_MAP: Record<string, string> = {
  TOTAL_DEBTORS: 'Total de Deudores',
  TOTAL_DEBT: 'Deuda Total',
  RECOVERY_RATE: 'Tasa de Recuperación',
  OVERDUE_PORTFOLIO: 'Cartera Vencida',
  AVERAGE_DEBT_AGE: 'Antigüedad Promedio de Deuda',
  TOTAL_COLLECTIONS: 'Total de Gestiones Realizadas',
  CONTACTABILITY_RATE: 'Tasa de Contactabilidad',
  EFFECTIVE_COLLECTIONS_RATE: 'Gestiones Efectivas',
  ACTIVE_PAYMENT_PLANS: 'Planes de Pago Activos',
  PAYMENT_PLAN_COMPLIANCE: 'Cumplimiento de Planes',
  PORTFOLIO_IN_ARREARS: 'Cartera en Mora',
  PORTFOLIO_OVER_90_DAYS: 'Cartera > 90 días',
  PENDING_INVOICES: 'Facturas Pendientes',
  OVERDUE_INVOICES_PERCENTAGE: '% Facturas Vencidas',
  AVERAGE_PAYMENT_DAYS: 'Promedio Días de Pago',
};

export const KPI_DEFINITION_MAP: Record<string, string> = {
  TOTAL_DEBTORS: 'Cantidad total de deudores en cartera consolidada de todos los clientes',
  TOTAL_DEBT: 'Monto total de deuda en cartera de todos los clientes del SaaS',
  RECOVERY_RATE: 'Porcentaje de deuda recuperada respecto al total de deuda',
  OVERDUE_PORTFOLIO: 'Monto total de deuda vencida en todos los clientes',
  AVERAGE_DEBT_AGE: 'Promedio de días de antigüedad de la deuda consolidada',
  TOTAL_COLLECTIONS: 'Cantidad total de gestiones de cobranza realizadas',
  CONTACTABILITY_RATE: 'Porcentaje de gestiones donde se logró contactar al deudor',
  EFFECTIVE_COLLECTIONS_RATE: 'Porcentaje de gestiones que generaron compromiso de pago',
  ACTIVE_PAYMENT_PLANS: 'Cantidad de planes de pago vigentes en todos los clientes',
  PAYMENT_PLAN_COMPLIANCE: 'Porcentaje de planes de pago completados exitosamente',
  PORTFOLIO_IN_ARREARS: 'Monto total de deuda en mora (con atraso confirmado)',
  PORTFOLIO_OVER_90_DAYS: 'Deuda con más de 90 días de mora - Riesgo crítico',
  PENDING_INVOICES: 'Cantidad de facturas sin liquidar en todos los clientes',
  OVERDUE_INVOICES_PERCENTAGE: 'Porcentaje de facturas vencidas respecto al total',
  AVERAGE_PAYMENT_DAYS: 'Promedio de días desde emisión de factura hasta pago efectivo',
};

export const CATEGORIES: Array<{ id: KPICategory; name: string }> = [
  { id: 'calidad_producida', name: 'Calidad Producida' },
  { id: 'eficiencia', name: 'Eficiencia' },
  { id: 'impecabilidad', name: 'Impecabilidad' },
];

export const KPI_UNIT_FORMAT: Record<KPIUnit, (value: number) => string> = {
  'nº': (value) => new Intl.NumberFormat('es-CL').format(value),
  '$': (value) => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value),
  '%': (value) => `${value.toFixed(1)}%`,
  'días': (value) => `${Math.round(value)} días`,
};
```

### Formatters

**`utils/kpi-formatters.ts`:**
```typescript
import { KPIUnit } from '../services/types';

export const formatKPIValue = (value: number, unit: KPIUnit): string => {
  switch (unit) {
    case '$':
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
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

export const formatTrend = (trend: { change: number; change_percentage: number }): string => {
  const sign = trend.change >= 0 ? '+' : '';
  return `${sign}${trend.change_percentage.toFixed(1)}%`;
};

export const formatBreakdownValue = (value: number, key: string): string => {
  if (key.includes('amount') || key.includes('debt')) {
    return formatKPIValue(value, '$');
  }
  if (key.includes('rate') || key.includes('percentage')) {
    return formatKPIValue(value, '%');
  }
  if (key.includes('days') || key.includes('age')) {
    return formatKPIValue(value, 'días');
  }
  return formatKPIValue(value, 'nº');
};
```

### Servicios

**`services/index.ts`:**
```typescript
import { KPIResponse, KPICategory } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface GetKPIsParams {
  accessToken: string;
  period?: 'daily' | 'weekly' | 'monthly';
  from?: string;
  to?: string;
  category?: KPICategory | 'all';
  clientId?: string;
}

export const getAllKPIs = async ({
  accessToken,
  period = 'monthly',
  from,
  to,
  category = 'all',
  clientId,
}: GetKPIsParams): Promise<KPIResponse> => {
  const params = new URLSearchParams({
    period,
    ...(from && { from }),
    ...(to && { to }),
    ...(category && { category }),
    ...(clientId && { client_id: clientId }),
  });

  const response = await fetch(`${API_URL}/v2/superadmin/kpis?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch KPIs');
  }

  return response.json();
};

export const getKPIById = async (
  kpiId: string,
  accessToken: string,
  params?: { from?: string; to?: string; clientId?: string }
): Promise<any> => {
  const queryParams = new URLSearchParams({
    ...(params?.from && { from: params.from }),
    ...(params?.to && { to: params.to }),
    ...(params?.clientId && { client_id: params.clientId }),
  });

  const response = await fetch(
    `${API_URL}/v2/superadmin/kpis/${kpiId}?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch KPI ${kpiId}`);
  }

  return response.json();
};
```

### Hooks

**`hooks/useKPIData.ts`:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { getAllKPIs } from '../services';
import { KPICategory } from '../services/types';

interface UseKPIDataParams {
  accessToken: string;
  period?: 'daily' | 'weekly' | 'monthly';
  from?: string;
  to?: string;
  category?: KPICategory | 'all';
  clientId?: string;
  enabled?: boolean;
}

export const useKPIData = ({
  accessToken,
  period = 'monthly',
  from,
  to,
  category = 'all',
  clientId,
  enabled = true,
}: UseKPIDataParams) => {
  return useQuery({
    queryKey: ['superadmin-kpis', { period, from, to, category, clientId }],
    queryFn: () =>
      getAllKPIs({ accessToken, period, from, to, category, clientId }),
    enabled: enabled && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
```

### Store (Zustand)

**`store/index.tsx`:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KPICategory } from '../services/types';

interface KPIFilters {
  period: 'daily' | 'weekly' | 'monthly';
  from?: string;
  to?: string;
  category: KPICategory | 'all';
  clientId?: string;
}

interface KPIStore {
  filters: KPIFilters;
  setFilters: (filters: Partial<KPIFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: KPIFilters = {
  period: 'monthly',
  category: 'all',
};

export const useKPIStore = create<KPIStore>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: 'superadmin-kpi-filters',
    }
  )
);
```

---

## 📝 Plan de Implementación

### Fase 1: Backend API (2 semanas)

**Semana 1:**
- Días 1-2: Diseño de base de datos y queries de agregación
- Días 3-4: Implementar endpoint principal `/v2/superadmin/kpis`
- Día 5: Implementar 5 KPIs de Calidad Producida

**Semana 2:**
- Días 1-2: Implementar 5 KPIs de Eficiencia
- Días 3-4: Implementar 5 KPIs de Impecabilidad
- Día 5: Testing, optimización de queries, documentación

**Entregables:**
- [ ] Endpoint principal funcional
- [ ] 15 endpoints individuales
- [ ] Tests unitarios (> 80% coverage)
- [ ] Documentación API (Swagger/OpenAPI)
- [ ] Performance < 2s response time

---

### Fase 2: Frontend (2 semanas)

**Semana 1:**
- Día 1: Setup estructura de archivos en fe-manager-quironix
- Día 2: Implementar tipos TypeScript y constantes
- Día 3: Implementar servicios y hooks
- Día 4-5: Implementar widgets especializados (currency, volume, percentage, days)

**Semana 2:**
- Día 1-2: Implementar página principal con grid layout
- Día 3: Implementar filtros y selector de cliente
- Día 4: Implementar summary header
- Día 5: Testing, refinamiento UI, documentación

**Entregables:**
- [ ] Dashboard funcional con 15 KPIs
- [ ] Filtros por período, categoría, cliente
- [ ] Responsive design (móvil, tablet, desktop)
- [ ] Loading states y error handling
- [ ] Tests E2E

---

### Fase 3: Testing y Deploy (1 semana)

**Días 1-3: QA Testing**
- Testing funcional completo
- Testing de performance
- Testing de accesibilidad
- Bug fixes

**Días 4-5: Deploy**
- Deploy a staging
- Feedback de stakeholders
- Deploy a production
- Monitoreo

**Entregables:**
- [ ] Dashboard en producción
- [ ] Documentación de usuario
- [ ] Guía de troubleshooting

---

## ✅ Criterios de Aceptación

### Backend
- [ ] 15 KPIs implementados con datos reales
- [ ] Todos los KPIs tienen breakdown por cliente
- [ ] Response time < 2 segundos
- [ ] Tests unitarios > 80% coverage
- [ ] Documentación API completa

### Frontend
- [ ] Dashboard muestra 15 KPIs correctamente
- [ ] Filtros funcionales (período, categoría, cliente)
- [ ] Formateo correcto según unidad (moneda, porcentaje, número, días)
- [ ] Responsive en móvil, tablet, desktop
- [ ] Loading states y error handling implementados
- [ ] Persistencia de filtros en localStorage

### UX
- [ ] Colores de estado (success/warning/error) según thresholds
- [ ] Tooltips explicativos en cada KPI
- [ ] Animaciones suaves en transiciones
- [ ] Accesibilidad WCAG 2.1 AA

---

## 🧪 Estrategia de Testing

### Backend
```typescript
// Unit Tests
describe('KPI Calculations', () => {
  it('should calculate recovery rate correctly', () => {
    const result = calculateRecoveryRate(totalDebt, recoveredAmount);
    expect(result).toBe(72.5);
  });
});

// Integration Tests
describe('GET /v2/superadmin/kpis', () => {
  it('should return 15 KPIs', async () => {
    const response = await request(app)
      .get('/v2/superadmin/kpis')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.calidad_producida).toHaveLength(5);
    expect(response.body.eficiencia).toHaveLength(5);
    expect(response.body.impecabilidad).toHaveLength(5);
  });
});
```

### Frontend
```typescript
// Component Tests
describe('KPICurrencyWidget', () => {
  it('should format currency correctly', () => {
    render(<KPICurrencyWidget value={45678900000} unit="$" />);
    expect(screen.getByText(/\$45\.678\.900\.000/)).toBeInTheDocument();
  });
});

// E2E Tests (Playwright/Cypress)
describe('KPI Dashboard', () => {
  it('should load all 15 KPIs', () => {
    cy.visit('/dashboard/kpis');
    cy.get('[data-testid="kpi-widget"]').should('have.length', 15);
  });

  it('should filter by category', () => {
    cy.visit('/dashboard/kpis');
    cy.get('[data-testid="filter-category"]').select('Eficiencia');
    cy.get('[data-testid="kpi-widget"]').should('have.length', 5);
  });
});
```

---

## 📚 Documentación

### Para Backend Team
- Ver sección "API Backend - Arquitectura Propuesta"
- Todos los KPIs tienen ejemplos de Request/Response
- Incluye estructura de breakdown y trend

### Para Frontend Team
- Ver sección "Frontend - Arquitectura Propuesta"
- Estructura completa de archivos
- Tipos TypeScript listos para usar
- Ejemplos de formatters y utilidades

---

## 🚀 Prompts para Implementación

### Prompt para Backend Team

```
Necesito implementar el API de KPIs para el superadmin de My Quiron (fe-manager-quironix).

Contexto:
- Proyecto: Dashboard de superadmin del SaaS Quironix
- Stack: Node.js + Express (o tu stack actual)
- Base de datos: PostgreSQL (o tu DB actual)

Tareas:
1. Implementar endpoint principal: GET /v2/superadmin/kpis
2. Implementar 15 KPIs divididos en 3 categorías:
   - Calidad Producida (5 KPIs)
   - Eficiencia (5 KPIs)
   - Impecabilidad (5 KPIs)

Especificaciones completas en:
@.plans/kpi-implementation-specification.md

Cada KPI incluye:
- ID, nombre, fórmula de cálculo
- SLA y criterio de aceptación
- Breakdown por cliente y otras dimensiones
- Datos de tendencia (previous_period, change, change_percentage)
- Ejemplos de Request/Response

Requisitos técnicos:
- Response time < 2 segundos
- Incluir agregación por todos los clientes del SaaS
- Autenticación con scope: superadmin.kpis.read
- Tests unitarios > 80% coverage

Por favor, comienza implementando el endpoint principal y los 5 KPIs de Calidad Producida.
```

### Prompt para Frontend Team

```
Necesito implementar el dashboard de KPIs para el superadmin de My Quiron (fe-manager-quironix).

Contexto:
- Proyecto: fe-manager-quironix (superadmin del SaaS)
- Stack: Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui
- State: Zustand + TanStack Query

Tareas:
1. Crear módulo completo en src/app/dashboard/kpis/
2. Implementar 15 KPIs divididos en 3 categorías:
   - Calidad Producida (5 KPIs)
   - Eficiencia (5 KPIs)
   - Impecabilidad (5 KPIs)
3. Implementar widgets especializados:
   - KPICurrencyWidget (para KPIs monetarios)
   - KPIVolumeWidget (para contadores)
   - KPIPercentageWidget (para porcentajes con gauge)
   - KPIDaysWidget (para métricas de días)

Especificaciones completas en:
@.plans/kpi-implementation-specification.md

Arquitectura completa incluye:
- Estructura de archivos
- Tipos TypeScript
- Constantes y mapeos
- Formatters y utilidades
- Servicios API
- Hooks de React Query
- Store de Zustand

Requisitos técnicos:
- Responsive design (móvil, tablet, desktop)
- Filtros por período, categoría, cliente
- Loading states y error handling
- Formateo correcto según unidad (moneda CLP, porcentaje, número, días)
- Colores de estado según thresholds (success/warning/error)

Por favor, comienza creando la estructura de archivos y los tipos TypeScript.
```

---

## 📞 Contactos

**Product Owner:** [Nombre]
**Backend Lead:** [Nombre]
**Frontend Lead:** [Nombre]
**QA Lead:** [Nombre]

---

## 📊 Resumen Ejecutivo

| Aspecto | Detalle |
|---------|---------|
| **Total KPIs** | 15 (nuevos) |
| **Categorías** | 3 (Calidad Producida, Eficiencia, Impecabilidad) |
| **KPIs por categoría** | 5 cada una |
| **Timeline Backend** | 2 semanas |
| **Timeline Frontend** | 2 semanas |
| **Timeline Testing** | 1 semana |
| **Total Implementación** | 5 semanas |
| **Proyecto** | fe-manager-quironix (NOT fe-clients-quironix) |
| **Endpoint Principal** | GET /v2/superadmin/kpis |

---

**Documento creado:** 27 de Enero de 2026
**Última actualización:** 27 de Enero de 2026
**Versión:** 2.0 (Corregida - Solo 15 KPIs Nuevos)
**Estado:** Listo para Implementación
