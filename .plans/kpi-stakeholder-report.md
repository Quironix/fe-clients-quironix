# Especificación de KPIs - My Quiron (Dashboard Superadmin)

- **Fecha:** 27 de Enero de 2026
- **Versión:** 1.0
- **Destinatarios:** Stakeholders y Product Owners
- **Proyecto:** My Quiron

---

## Resumen Ejecutivo

Este documento presenta la selección final de **15 KPIs estratégicos** para el dashboard del superadministrador "My Quiron". Estos indicadores consolidarán métricas de **todos los clientes** de la plataforma SaaS Quironix, proporcionando visibilidad total del negocio desde una única interfaz.

### Alcance

- **Dashboard:** My Quiron (Superadministrador)
- **Repositorio:** fe-manager-quironix
- **KPIs Seleccionados:** 15 indicadores clave
- **Timeline de Implementación:** 5 semanas
- **Inicio Estimado:** Febrero 2026

---

## 1. KPIs Seleccionados para Implementación (15 Total)

Los siguientes indicadores han sido seleccionados por su **alto valor estratégico** para la toma de decisiones a nivel ejecutivo y su **factibilidad técnica** de implementación.

### 1.1 Categoría: Calidad Producida (5 KPIs)

Estos indicadores miden la efectividad en la generación de valor y recuperación de cartera.

---

#### KPI 1: Total de Deudores

**Descripción:** Cantidad total de deudores en cartera consolidada de todos los clientes del SaaS.

**¿Por qué fue seleccionado?**

- ✅ Métrica fundamental de volumen operativo
- ✅ Permite dimensionar el alcance total del negocio
- ✅ Datos fácilmente disponibles en base de datos actual
- ✅ KPI comparable mes a mes para identificar crecimiento

**Valor de Negocio:** Permite a la gerencia entender el tamaño total de la operación y detectar tendencias de crecimiento o contracción.

**Desglose:** Por cliente, por región

---

#### KPI 2: Deuda Total

**Descripción:** Monto total en pesos chilenos (CLP) de deuda en cartera de todos los clientes.

**¿Por qué fue seleccionado?**

- ✅ Indicador crítico del valor total bajo gestión
- ✅ Métrica base para calcular otros indicadores (%, ratios)
- ✅ Esencial para reportes financieros y proyecciones
- ✅ Alta relevancia para inversionistas y directorio

**Valor de Negocio:** Visibilidad inmediata del valor monetario total bajo gestión de cobranza.

**Desglose:** Por cliente, por estado (vigente/vencida)

---

#### KPI 3: Tasa de Recuperación

**Descripción:** Porcentaje de deuda recuperada respecto al total de deuda en cartera.

**¿Por qué fue seleccionado?**

- ✅ KPI crítico de efectividad operacional
- ✅ Permite medir ROI de las operaciones de cobranza
- ✅ Comparable con estándares de la industria
- ✅ Indicador directo de salud financiera

**Valor de Negocio:** Mide la efectividad real del negocio de cobranza. Un aumento de 1% puede representar millones en recuperación.

**Thresholds:**

- 🟢 SLA: ≥ 70%
- 🟡 Aceptable: ≥ 60%
- 🔴 Crítico: < 60%

**Desglose:** Por cliente, monto recuperado vs pendiente

---

#### KPI 4: Cartera Vencida

**Descripción:** Monto total de deuda que ya superó su fecha de vencimiento.

**¿Por qué fue seleccionado?**

- ✅ Indicador temprano de riesgo de incobrabilidad
- ✅ Permite tomar acciones preventivas
- ✅ Requerido para cálculo de provisiones contables
- ✅ Métrica clave para análisis de riesgo

**Valor de Negocio:** Identifica problemas de cobro antes de que se conviertan en pérdidas definitivas.

**Thresholds:**

- 🟢 SLA: ≤ 20% de deuda total
- 🟡 Aceptable: ≤ 25%
- 🔴 Crítico: > 25%

**Desglose:** Por cliente, por rango de antigüedad (1-30, 31-60, 61-90, >90 días)

---

#### KPI 5: Antigüedad Promedio de Deuda

**Descripción:** Promedio de días transcurridos desde la emisión de la deuda.

**¿Por qué fue seleccionado?**

- ✅ Indicador de eficiencia en rotación de cartera
- ✅ Permite detectar deterioro en calidad de cartera
- ✅ Útil para ajustar estrategias de cobranza por tramo
- ✅ Comparable con benchmarks de industria

**Valor de Negocio:** Deudas más antiguas tienen menor probabilidad de recuperación. Este KPI alerta cuando la cartera envejece.

**Thresholds:**

- 🟢 SLA: ≤ 45 días
- 🟡 Aceptable: ≤ 60 días
- 🔴 Crítico: > 60 días

**Desglose:** Por cliente, por estado (vigente vs vencida)

---

### 1.2 Categoría: Eficiencia (5 KPIs)

Estos indicadores miden la productividad y efectividad de las operaciones de cobranza.

---

#### KPI 6: Total de Gestiones Realizadas

**Descripción:** Cantidad total de acciones de cobranza realizadas (llamadas, emails, WhatsApp, presencial).

**¿Por qué fue seleccionado?**

- ✅ Indicador de actividad operacional
- ✅ Permite dimensionar recursos necesarios
- ✅ Base para calcular productividad por agente
- ✅ Identifica tendencias de actividad

**Valor de Negocio:** Mayor actividad de gestión generalmente correlaciona con mayor recuperación. Permite optimizar dotación.

**Thresholds:**

- 🟢 SLA: ≥ 10,000/mes
- 🟡 Aceptable: ≥ 8,000/mes
- 🔴 Crítico: < 8,000/mes

**Desglose:** Por cliente, por canal (teléfono, email, WhatsApp, presencial), por semana

---

#### KPI 7: Tasa de Contactabilidad

**Descripción:** Porcentaje de gestiones donde se logró contactar efectivamente al deudor.

**¿Por qué fue seleccionado?**

- ✅ Indicador de calidad de base de datos de contacto
- ✅ Mide efectividad de canales de comunicación
- ✅ Permite optimizar horarios y métodos de contacto
- ✅ Base para mejorar estrategias de outreach

**Valor de Negocio:** Sin contacto no hay negociación. Mejorar este KPI impacta directamente en recuperación.

**Thresholds:**

- 🟢 SLA: ≥ 60%
- 🟡 Aceptable: ≥ 50%
- 🔴 Crítico: < 50%

**Desglose:** Por cliente, por canal de comunicación

---

#### KPI 8: Gestiones Efectivas

**Descripción:** Porcentaje de gestiones que resultaron en un compromiso de pago por parte del deudor.

**¿Por qué fue seleccionado?**

- ✅ Indicador de calidad de gestión, no solo cantidad
- ✅ Mide habilidad de negociación de equipos
- ✅ Permite identificar mejores prácticas
- ✅ KPI crítico para capacitación y entrenamiento

**Valor de Negocio:** Distingue gestiones productivas de mero "ruido operacional". Permite enfocarse en calidad.

**Thresholds:**

- 🟢 SLA: ≥ 40%
- 🟡 Aceptable: ≥ 30%
- 🔴 Crítico: < 30%

**Desglose:** Por cliente, por tipo de resultado (compromiso, rechazo, info incompleta)

---

#### KPI 9: Total Planes de Pago Activos

**Descripción:** Cantidad de planes de pago vigentes en todos los clientes del SaaS.

**¿Por qué fue seleccionado?**

- ✅ Indicador de volumen de acuerdos formalizados
- ✅ Representa compromiso de pago estructurado
- ✅ Permite proyectar flujos futuros
- ✅ Mide adopción de soluciones de pago flexibles

**Valor de Negocio:** Los planes de pago aumentan significativamente la tasa de recuperación versus cobranza tradicional.

**Desglose:** Por cliente, por rango de cuotas (1-6, 7-12, >12), monto total comprometido

---

#### KPI 10: Cumplimiento de Planes

**Descripción:** Porcentaje de planes de pago que se completan exitosamente versus los que incumplen.

**¿Por qué fue seleccionado?**

- ✅ Mide efectividad de estructuración de planes
- ✅ Indicador de riesgo crediticio
- ✅ Permite ajustar políticas de aprobación
- ✅ KPI clave para análisis de sostenibilidad

**Valor de Negocio:** Un plan incumplido representa tiempo y recursos perdidos. Este KPI permite optimizar criterios de otorgamiento.

**Thresholds:**

- 🟢 SLA: ≥ 70%
- 🟡 Aceptable: ≥ 60%
- 🔴 Crítico: < 60%

**Desglose:** Por cliente, por rango de cuotas

---

### 1.3 Categoría: Impecabilidad (5 KPIs)

Estos indicadores miden la calidad de la cartera y riesgos asociados.

---

#### KPI 11: Cartera en Mora

**Descripción:** Monto total de deuda con atraso confirmado (cualquier día de mora).

**¿Por qué fue seleccionado?**

- ✅ Indicador temprano de problemas de pago
- ✅ Permite activar acciones correctivas oportunas
- ✅ Requerido para gestión de riesgo
- ✅ Base para cálculo de provisiones

**Valor de Negocio:** Detectar mora tempranamente aumenta significativamente la probabilidad de recuperación.

**Thresholds:**

- 🟢 SLA: ≤ 15% de deuda total
- 🟡 Aceptable: ≤ 20%
- 🔴 Crítico: > 20%

**Desglose:** Por cliente, por rango de días en mora

---

#### KPI 12: Cartera > 90 días

**Descripción:** Deuda con más de 90 días de mora - indicador crítico de riesgo de incobrabilidad.

**¿Por qué fue seleccionado?**

- ✅ KPI estándar de la industria financiera
- ✅ Indicador de pérdida esperada
- ✅ Requerido por normativas contables
- ✅ Señal de alerta para provisión 100%

**Valor de Negocio:** Deuda > 90 días tiene menos de 20% de probabilidad de recuperación. Requiere atención inmediata o provisión.

**Thresholds:**

- 🟢 SLA: ≤ 10% de deuda total
- 🟡 Aceptable: ≤ 15%
- 🔴 Crítico: > 15%

**Desglose:** Por cliente, por sub-rangos (91-180, 181-365, >365 días)

---

#### KPI 13: Total Facturas Pendientes

**Descripción:** Cantidad de facturas emitidas que aún no han sido liquidadas.

**¿Por qué fue seleccionado?**

- ✅ Indicador de eficiencia administrativa
- ✅ Mide velocidad de procesamiento
- ✅ Identifica cuellos de botella operacionales
- ✅ Afecta flujo de caja del negocio

**Valor de Negocio:** Facturas pendientes retrasan el reconocimiento de ingresos y pueden indicar problemas de proceso.

**Thresholds:**

- 🟢 SLA: ≤ 500 facturas
- 🟡 Aceptable: ≤ 700 facturas
- 🔴 Crítico: > 700 facturas

**Desglose:** Por cliente, por antigüedad (<30, 30-60, >60 días), monto total

---

#### KPI 14: % Facturas Vencidas

**Descripción:** Porcentaje de facturas pendientes que ya superaron su fecha de vencimiento.

**¿Por qué fue seleccionado?**

- ✅ Complemento de "Total Facturas Pendientes"
- ✅ Mide calidad de cartera de facturas
- ✅ Indicador de deterioro administrativo
- ✅ Permite priorizar gestión de cobranza

**Valor de Negocio:** Facturas vencidas requieren gestión activa. Este KPI alerta cuando el problema crece.

**Thresholds:**

- 🟢 SLA: ≤ 15%
- 🟡 Aceptable: ≤ 20%
- 🔴 Crítico: > 20%

**Desglose:** Por cliente, monto total vencido

---

#### KPI 15: Promedio Días de Pago

**Descripción:** Promedio de días transcurridos desde emisión de factura hasta pago efectivo.

**¿Por qué fue seleccionado?**

- ✅ Indicador directo de eficiencia de cobranza
- ✅ Mide velocidad de rotación de cartera
- ✅ Comparable con términos contractuales (NET 30, NET 45)
- ✅ Impacta directamente en flujo de caja

**Valor de Negocio:** Reducir días de pago en 5 días puede liberar millones en capital de trabajo.

**Thresholds:**

- 🟢 SLA: ≤ 30 días
- 🟡 Aceptable: ≤ 40 días
- 🔴 Crítico: > 40 días

**Desglose:** Por cliente, por rango de pago (0-15, 16-30, 31-45, >45 días)

---

## 2. KPIs NO Seleccionados (32 Total)

Los siguientes indicadores del documento original **no serán implementados** en esta fase por las razones detalladas.

### 2.1 Excluidos por Redundancia (8 KPIs)

Estos KPIs proporcionan información que ya está cubierta por otros indicadores seleccionados.

| KPI                            | Razón de Exclusión                                                             |
| ------------------------------ | ------------------------------------------------------------------------------ |
| **Cartera Vigente**            | Redundante: Cartera Vigente = Deuda Total - Cartera Vencida (cálculo derivado) |
| **Número de Deudores Morosos** | Redundante: Ya cubierto por "Cartera en Mora" en términos monetarios           |
| **Deuda Total Vencida**        | Redundante: Duplica "Cartera Vencida"                                          |
| **Total Planes Completados**   | Redundante: Derivado de "Cumplimiento de Planes"                               |
| **% Facturas Pagadas**         | Redundante: Inverso matemático de "% Facturas Vencidas"                        |
| **Total Compromisos de Pago**  | Redundante: Cubierto por "Gestiones Efectivas"                                 |
| **Compromisos Cumplidos %**    | Redundante: Similar a "Cumplimiento de Planes"                                 |
| **Tasa de Conversión %**       | Redundante: Equivalente a "Gestiones Efectivas"                                |

**Impacto:** Ninguno. La información sigue disponible a través de los KPIs seleccionados.

---

### 2.2 Excluidos por Granularidad Excesiva (6 KPIs)

Estos KPIs son demasiado específicos para un dashboard de nivel estratégico. La información está disponible en los breakdowns de otros KPIs.

| KPI                                  | Razón de Exclusión                                                   |
| ------------------------------------ | -------------------------------------------------------------------- |
| **Cartera 1-30 días**                | Incluido como breakdown en "Cartera Vencida" y "Cartera en Mora"     |
| **Cartera 31-60 días**               | Incluido como breakdown en "Cartera Vencida" y "Cartera en Mora"     |
| **Cartera 61-90 días**               | Incluido como breakdown en "Cartera Vencida" y "Cartera en Mora"     |
| **Promedio de Gestiones por Deudor** | Métrica operativa, no estratégica. Disponible en reportes de detalle |
| **Promedio Tiempo de Gestión**       | Métrica operativa. Relevante para supervisores, no para C-level      |
| **Gestiones por Canal**              | Incluido como breakdown en "Total de Gestiones Realizadas"           |

**Impacto:** Ninguno. Los datos están disponibles como sub-métricas de los KPIs principales.

---

### 2.3 Excluidos por Bajo Valor Estratégico (5 KPIs)

Estos KPIs tienen valor operativo pero bajo impacto en decisiones estratégicas del negocio.

| KPI                               | Razón de Exclusión                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Deuda Promedio por Deudor**     | Métrica derivada (Deuda Total / Total Deudores). Útil para análisis ad-hoc, no para dashboard ejecutivo |
| **Promedio de Cuotas por Plan**   | Bajo impacto en decisiones estratégicas. Relevante para operaciones, no para dirección                  |
| **Promedio Monto por Compromiso** | Métrica derivada. No afecta decisiones de alto nivel                                                    |
| **Total Facturas Emitidas**       | Dato más relevante para módulo de facturación que para cobranza                                         |
| **Monto Total de Compromisos**    | Información redundante con otros KPIs monetarios                                                        |

**Impacto:** Bajo. Pueden agregarse en Fase 2 si hay demanda específica.

---

### 2.4 Excluidos por Falta de Datos (6 KPIs)

Estos KPIs requieren datos que actualmente no están disponibles en el sistema o requieren integraciones adicionales.

| KPI                                    | Razón de Exclusión                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| **Total Retenciones**                  | Requiere integración con sistema contable. Datos no disponibles en BD actual          |
| **Total Deducciones**                  | Parcialmente cubierto por KPI "DDO" existente. Requiere módulo específico             |
| **Cobranza Judicial vs Extrajudicial** | Requiere módulo legal que no está implementado                                        |
| **Total Monto Liquidado**              | Datos incompletos. Sistema de liquidación en desarrollo                               |
| **Total Monto Pendiente**              | Derivado de "Total Facturas Pendientes" con datos actualmente inconsistentes          |
| **Provisión por Incobrabilidad**       | Ya existe en fe-clients-quironix (KPI individual). No se consolida a nivel superadmin |

**Impacto:** Medio. Estos KPIs podrían implementarse cuando los sistemas fuente estén disponibles.

---

### 2.5 Excluidos para Fase 2 - Módulo de Proyección (5 KPIs)

Estos KPIs requieren un módulo completamente nuevo de proyección que está fuera del alcance actual.

| KPI                                      | Razón de Exclusión                                       |
| ---------------------------------------- | -------------------------------------------------------- |
| **Proyección de Ingresos Mensuales**     | Requiere módulo de proyección con algoritmos predictivos |
| **Monto Proyectado vs Real**             | Requiere sistema de forecasting que no existe            |
| **Desviación de Proyección %**           | Requiere baseline de proyecciones históricas             |
| **Tasa de Cumplimiento de Proyecciones** | Requiere módulo de proyección completo                   |
| **Proyección de Recuperación por Tramo** | Requiere modelos predictivos avanzados                   |

**Impacto:** Medio-Alto. Estos KPIs tienen alto valor pero requieren desarrollo significativo.

**Recomendación:** Evaluar implementación en Q3 2026 como proyecto separado "Módulo de Proyección y Forecasting".

---

### 2.6 Excluidos por Complejidad Técnica (2 KPIs)

Estos KPIs requieren desarrollo técnico complejo que excede el timeline actual.

| KPI                                          | Razón de Exclusión                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Provisión por Incobrabilidad Consolidada** | Requiere integración con múltiples sistemas contables de clientes. Complejidad legal y normativa |
| **Cobranza Judicial vs Extrajudicial**       | Requiere tracking específico de procesos legales que no está estandarizado                       |

**Impacto:** Bajo-Medio. Valor estratégico pero complejidad alta.

---

## 3. Criterios de Selección Aplicados

Los 15 KPIs seleccionados fueron evaluados bajo los siguientes criterios:

### 3.1 Relevancia Estratégica (Peso: 35%)

- ¿Impacta decisiones de nivel ejecutivo?
- ¿Es comparable con estándares de industria?
- ¿Tiene valor para inversionistas/directorio?

### 3.2 Factibilidad Técnica (Peso: 30%)

- ¿Los datos están disponibles en BD actual?
- ¿Requiere integraciones complejas?
- ¿Es calculable en tiempo real o cercano?

### 3.3 Accionabilidad (Peso: 20%)

- ¿Permite tomar acciones correctivas?
- ¿Identifica problemas tempranos?
- ¿Se puede mejorar con intervenciones?

### 3.4 Unicidad (Peso: 15%)

- ¿Proporciona información no duplicada?
- ¿Es complementario a otros KPIs?
- ¿Agrega valor distintivo?

---

## 4. Beneficios Esperados

### 4.1 Visibilidad Total del Negocio

- **Dashboard único** con visión consolidada de todos los clientes
- **Comparativas** entre clientes para identificar mejores prácticas
- **Alertas tempranas** de deterioro en métricas clave

### 4.2 Toma de Decisiones Data-Driven

- **15 KPIs estratégicos** en lugar de docenas de métricas operativas
- **Thresholds claros** (SLA, aceptable, crítico) para cada indicador
- **Tendencias históricas** para identificar patrones

### 4.3 Optimización de Recursos

- **Identificación de clientes** con bajo desempeño
- **Redistribución de recursos** hacia oportunidades de mayor retorno
- **Mejora continua** basada en benchmarking interno

### 4.4 Reporteo Ejecutivo Simplificado

- **Reportes automáticos** listos para directorio
- **Exportación a formatos** ejecutivos (PDF, Excel)
- **Filtros por período** (diario, semanal, mensual)

---

## 5. Timeline de Implementación

### Fase 1: Backend API (2 semanas)

**Semana 1:**

- Diseño de queries de agregación
- Endpoint principal `/v2/superadmin/kpis`
- 5 KPIs de Calidad Producida

**Semana 2:**

- 5 KPIs de Eficiencia
- 5 KPIs de Impecabilidad
- Testing y optimización (response time < 2s)

### Fase 2: Frontend Dashboard (2 semanas)

**Semana 3:**

- Setup estructura fe-manager-quironix
- Tipos TypeScript y servicios
- Widgets especializados (monetarios, porcentajes, volumen, días)

**Semana 4:**

- Grid layout con 15 KPIs
- Filtros (período, categoría, cliente)
- Summary header con health score

### Fase 3: Testing y Deploy (1 semana)

**Semana 5:**

- QA testing completo
- Staging deployment
- Production deployment
- Capacitación usuarios

**Total: 5 semanas**

---

## 6. Arquitectura Técnica (Resumen)

### 6.1 Backend

- **Endpoint Principal:** `GET /v2/superadmin/kpis`
- **Autenticación:** Bearer token con scope `superadmin.kpis.read`
- **Performance:** Response time < 2 segundos
- **Agregación:** Datos consolidados de todos los clientes

### 6.2 Frontend

- **Stack:** Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **State Management:** Zustand + TanStack Query
- **Caché:** 5 minutos (configurable)
- **Responsive:** Móvil, tablet, desktop

### 6.3 Características

- ✅ Filtros por período (diario, semanal, mensual)
- ✅ Filtros por categoría (Calidad, Eficiencia, Impecabilidad)
- ✅ Filtros por cliente individual
- ✅ Breakdown detallado en cada KPI
- ✅ Gráficos de tendencia histórica
- ✅ Colores de estado según thresholds
- ✅ Exportación de reportes

---

## 7. Criterios de Aceptación

### 7.1 Funcionales

- [ ] 15 KPIs visibles en dashboard
- [ ] Todos los KPIs con breakdown por cliente
- [ ] Filtros funcionales (período, categoría, cliente)
- [ ] Datos actualizados con máximo 5 minutos de lag
- [ ] Colores de estado correctos según thresholds

### 7.2 No Funcionales

- [ ] Tiempo de carga < 2 segundos
- [ ] Responsive en todos los dispositivos
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] Disponibilidad > 99.5%

### 7.3 Negocio

- [ ] Dashboard aprobado por stakeholders
- [ ] Capacitación completada (usuarios superadmin)
- [ ] Documentación de usuario entregada
- [ ] Plan de soporte post-implementación

---

## 8. Riesgos y Mitigaciones

### Riesgo 1: Calidad de Datos Inconsistente

**Probabilidad:** Media | **Impacto:** Alto

**Mitigación:**

- Validación de datos en fase de desarrollo
- Alertas automáticas de inconsistencias
- Proceso de limpieza de datos pre-implementación

### Riesgo 2: Performance con Alto Volumen

**Probabilidad:** Baja | **Impacto:** Alto

**Mitigación:**

- Queries optimizadas con índices
- Caché de 5 minutos en frontend
- Materialización de vistas en BD si es necesario

### Riesgo 3: Cambios de Requerimientos

**Probabilidad:** Media | **Impacto:** Medio

**Mitigación:**

- Arquitectura modular para agregar KPIs fácilmente
- Revisión con stakeholders al 50% del desarrollo
- Proceso de change request documentado

---

## 9. Próximos Pasos

### Inmediatos (Esta Semana)

1. ✅ Aprobación de stakeholders de este documento
2. ✅ Kick-off con equipos backend y frontend
3. ✅ Provisión de accesos y ambientes de desarrollo

### Corto Plazo (Próximas 2 Semanas)

4. ⏳ Desarrollo backend - Fase 1
5. ⏳ Diseño UI/UX del dashboard
6. ⏳ Setup de repositorio fe-manager-quironix

### Mediano Plazo (3-5 Semanas)

7. ⏳ Desarrollo frontend completo
8. ⏳ Testing QA
9. ⏳ Deployment a producción
10. ⏳ Capacitación usuarios

---

## 10. Contactos del Proyecto

### Equipo Técnico

- **Backend Lead:** [Nombre] - [email]
- **Frontend Lead:** [Nombre] - [email]
- **QA Lead:** [Nombre] - [email]
- **DevOps:** [Nombre] - [email]

### Stakeholders

- **Product Owner:** [Nombre] - [email]
- **CEO/Director:** [Nombre] - [email]
- **CFO:** [Nombre] - [email]

---

## 11. Conclusiones

La implementación de estos **15 KPIs estratégicos** proporcionará a la gerencia de Quironix una herramienta poderosa para:

1. **Monitorear** la salud del negocio en tiempo real
2. **Identificar** oportunidades de mejora y riesgos tempranos
3. **Optimizar** la asignación de recursos entre clientes
4. **Reportar** al directorio e inversionistas con datos consolidados
5. **Comparar** desempeño entre clientes para identificar mejores prácticas

Los **32 KPIs excluidos** no representan pérdida de valor, ya que:

- 8 son redundantes (información ya cubierta)
- 6 están disponibles como sub-métricas
- 5 tienen bajo valor estratégico
- 6 requieren datos no disponibles actualmente
- 5 requieren un módulo de proyección (Fase 2)
- 2 tienen complejidad técnica excesiva

Esta selección balanceada maximiza el **ROI** de la implementación al enfocarse en indicadores de **alto impacto** con **factibilidad técnica** probada.

---

## 12. Apéndices

### Apéndice A: Glosario de Términos

- **SLA (Service Level Agreement):** Nivel de servicio óptimo esperado
- **Threshold:** Umbral o valor límite que define el estado de un KPI
- **Breakdown:** Desglose detallado de un KPI por diferentes dimensiones
- **Trend:** Tendencia histórica comparando períodos
- **Health Score:** Puntaje consolidado de salud del negocio (0-100)

### Apéndice B: Referencias

- Documento técnico completo: `.plans/kpi-implementation-specification.md`
- Plan de refinamiento: `.plans/kpi-refinement-plan.md`
- Documento fuente: "KPI MY QUIRON.docx.pdf"

### Apéndice C: Matriz de KPIs

| #   | KPI                  | Categoría         | Tipo      | SLA  | Prioridad |
| --- | -------------------- | ----------------- | --------- | ---- | --------- |
| 1   | Total de Deudores    | Calidad Producida | Volumen   | N/A  | Alta      |
| 2   | Deuda Total          | Calidad Producida | Monetario | N/A  | Alta      |
| 3   | Tasa de Recuperación | Calidad Producida | %         | ≥70% | Crítica   |
| 4   | Cartera Vencida      | Calidad Producida | Monetario | ≤20% | Alta      |
| 5   | Antigüedad Promedio  | Calidad Producida | Días      | ≤45  | Media     |
| 6   | Total Gestiones      | Eficiencia        | Volumen   | ≥10k | Media     |
| 7   | Contactabilidad      | Eficiencia        | %         | ≥60% | Alta      |
| 8   | Gestiones Efectivas  | Eficiencia        | %         | ≥40% | Alta      |
| 9   | Planes Activos       | Eficiencia        | Volumen   | N/A  | Media     |
| 10  | Cumplimiento Planes  | Eficiencia        | %         | ≥70% | Alta      |
| 11  | Cartera en Mora      | Impecabilidad     | Monetario | ≤15% | Crítica   |
| 12  | Cartera >90 días     | Impecabilidad     | Monetario | ≤10% | Crítica   |
| 13  | Facturas Pendientes  | Impecabilidad     | Volumen   | ≤500 | Media     |
| 14  | % Facturas Vencidas  | Impecabilidad     | %         | ≤15% | Media     |
| 15  | Promedio Días Pago   | Impecabilidad     | Días      | ≤30  | Alta      |
