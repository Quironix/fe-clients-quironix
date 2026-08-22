# Route → Scope Map

Fuente de verdad para el mapeo entre rutas del dashboard y scopes del backend.
Usado para normalizar `ROUTE_SCOPE_MAP` en `src/middleware.ts`.

## Convenciones

- **Ruta padre** cubre todas sus subrutas por el match de prefijo en el middleware.
- **Subruta explícita** solo cuando el scope granular es distinto al del padre.
- **Sin scope** = ruta pública dentro del dashboard (no requiere validación de scope).
- **Pendiente** = ruta existe en el filesystem pero el scope correcto no está confirmado.

---

## Mapa completo

| Ruta                                          | Scope requerido                        | Estado        | Notas |
|-----------------------------------------------|----------------------------------------|---------------|-------|
| `/dashboard/home`                             | `client.dashboard`                     | ✅ mapeado    | Ruta canónica del dashboard (ex `dashboard_v2`) |
| `/dashboard/overview`                         | `client.dashboard`                     | ✅ mapeado    | Legacy — redirige a `/dashboard/home`, código conservado en `overview/legacy-page.tsx` |
| `/dashboard/dashboard_v2`                     | `client.dashboard`                     | ✅ mapeado    | Legacy — redirige a `/dashboard/home` |
| `/dashboard/kpi`                              | `client.dashboard.kpis`                | ✅ mapeado    | |
| `/dashboard/kpi_2`                            | `client.dashboard.kpis`                | ✅ mapeado    | Mismo scope que kpi — confirmar si kpi_2 es la versión activa |
| `/dashboard/companies`                        | `client.onboarding.companies`          | ✅ mapeado    | Solo clientes FACTORING — validación extra en middleware |
| `/dashboard/settings`                         | `client.onboarding.settings`           | ✅ mapeado    | |
| `/dashboard/integrations`                     | `client.onboarding.integrations`       | ✅ mapeado    | |
| `/dashboard/banks`                            | `client.onboarding.banks`              | ✅ mapeado    | |
| `/dashboard/users`                            | `client.users.users`                   | ✅ mapeado    | |
| `/dashboard/roles`                            | `client.users.roles`                   | ✅ mapeado    | |
| `/dashboard/actions-history`                  | `client.users.actions_history`         | ✅ mapeado    | |
| `/dashboard/debtors`                          | `client.settings_account.debtors`      | ✅ mapeado    | |
| `/dashboard/monthly-period`                   | `client.settings_account.monthly_period` | ✅ mapeado  | Sin página en filesystem — confirmar si existe |
| `/dashboard/cash-flow`                        | `client.settings_account.cash_flow`    | ✅ mapeado    | |
| `/dashboard/communications`                   | `client.settings_account.communications` | ✅ mapeado  | Sin página en filesystem — confirmar si existe |
| `/dashboard/indicators`                       | `client.settings_account.indicators`   | ✅ mapeado    | Sin página en filesystem — confirmar si existe |
| `/dashboard/transactions/dte`                 | `client.transactions.dte`              | ✅ mapeado    | |
| `/dashboard/transactions/payments`            | `client.transactions.payments`         | ✅ mapeado    | |
| `/dashboard/transactions/movements`           | `client.transactions.movements`        | ✅ mapeado    | |
| `/dashboard/debtor-management`                | `client.debtor_management`             | ✅ mapeado    | Cubre managements-list y subrutas de [id] |
| `/dashboard/collectors`                       | `client.collectors`                    | ✅ mapeado    | |
| `/dashboard/litigation`                       | `client.litigations`                   | ✅ mapeado    | Scope en plural (`litigations`) |
| `/dashboard/payment-netting`                  | `client.payment_netting`               | ✅ mapeado    | |
| `/dashboard/payment-plans`                    | `client.payment_plans`                 | ✅ mapeado    | |
| `/dashboard/payment-plans/approval`           | `client.payment_plans.approval`        | ✅ mapeado    | Scope granular distinto al padre |
| `/dashboard/payment-projection`               | `client.payment_projection`            | ✅ mapeado    | |
| `/dashboard/payment-projection/settings`      | `client.payment_projection.settings`   | ✅ mapeado    | |
| `/dashboard/access-denied`                    | —                                      | sin scope     | Explícitamente permitida en el middleware |
| `/dashboard/profile`                          | —                                      | sin scope     | Accesible para cualquier usuario autenticado |
| `/dashboard/template`                         | —                                      | sin scope     | Confirmar si es interna/dev |
| `/dashboard/overview-backup`                  | —                                      | sin scope     | Confirmar si es interna/dev |

---

## Scopes del backend sin ruta mapeada

Estos scopes existen en el backend pero no tienen página propia en el filesystem.
Son permisos granulares dentro de rutas ya mapeadas o funcionalidades pendientes de implementar.

| Scope                                  | Probable uso                                      | Acción |
|----------------------------------------|---------------------------------------------------|--------|
| `client.managements.indicators`        | Widget/sección dentro de debtor-management        | Confirmar — posible guard por componente, no por ruta |
| `client.managements.collection-profiles` | Sección dentro de debtor-management             | Confirmar |
| `client.managements.collect`           | Sección dentro de debtor-management               | Confirmar |
| `client.managements.collect.view-all`  | Sub-permiso de collect                            | Confirmar |
| `client.managements.tasks`             | Sección dentro de debtor-management               | Confirmar |
| `client.managements.tracks`            | Sección dentro de debtor-management               | Confirmar |
| `client.payment_plans.approvers`       | Rol/permiso dentro de payment-plans               | Confirmar si tiene ruta propia |
| `client.payment_netting`               | Ya mapeado a `/dashboard/payment-netting`         | ✅ |
| `client.projection_configuration`      | Sin página identificada                           | Pendiente |
| `client.reports.payment_projection`    | Sin página identificada                           | Pendiente |
| `client.accounting_interface_api`      | Sin página identificada — posible integración API | Pendiente |
| `client.settings.api-keys`             | Sin página identificada — posible sub-ruta de settings | Pendiente |
| `client.dashboard.debtors`             | Widget en overview                                | Confirmar |
| `client.dashboard.indicators`          | Widget en overview                                | Confirmar |

---

## Scopes legacy / sin uso claro

Presentes en el listado del backend pero con nombres que no siguen la convención `client.*.*`:

| Scope              | Observación |
|--------------------|-------------|
| `client_roles`     | Formato legacy — posiblemente reemplazado por `client.users.roles` |
| `client_users`     | Formato legacy — posiblemente reemplazado por `client.users.users` |
| `client_debtors`   | Formato legacy — posiblemente reemplazado por `client.settings_account.debtors` |
| `client_invoices`  | Formato legacy — sin ruta mapeada |
| `client_companies` | Formato legacy — posiblemente reemplazado por `client.onboarding.companies` |
| `client_subscriptions` | Formato legacy — sin ruta mapeada |

---

## Scopes padre (no se mapean a rutas)

Son scopes de agrupación — el middleware valida por scope específico, no por padre.

| Scope                  | Hijos que cubre |
|------------------------|-----------------|
| `client.onboarding`    | companies, settings, integrations, banks |
| `client.users`         | users, roles, actions_history |
| `client.settings_account` | debtors, monthly_period, cash_flow, communications, indicators |
| `client.transactions`  | dte, payments, movements |
| `client.payment_plans` | approval, approvers |
| `client.dashboard`     | kpis, debtors, indicators |
| `client.managements`   | indicators, collection-profiles, collect, tasks, tracks |
