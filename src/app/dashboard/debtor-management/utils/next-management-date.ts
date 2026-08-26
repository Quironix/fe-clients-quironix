/**
 * Reglas de "fecha próxima gestión" — PRD_tareas_validacion_fecha_y_pdf_facturas.md §6-A.
 *
 * Extraído a funciones puras para que el picker (Calendar `disabled` matcher)
 * y el submit (zod refine) apliquen exactamente la misma regla, y para que
 * sea testeable sin renderizar el componente.
 */

export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isPastDate(date: Date, today: Date = new Date()): boolean {
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  return date < startOfToday;
}

export function isWeekendDate(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Parsea un string de fecha ("YYYY-MM-DD", con o sin hora) a un Date en
 * hora LOCAL usando sus componentes literales — evita el corrimiento de un
 * día que produce `new Date("YYYY-MM-DD")` (parseo UTC) combinado con
 * getters/setters locales como `getDate()`/`setDate()`.
 */
function parseDateOnlyLocal(dateString: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Suma `days` días hábiles a `date`, saltando fines de semana y los
 * feriados presentes en `holidaySet` (mismo Set<string> ISO "YYYY-MM-DD"
 * que ya carga StepTwo.tsx vía getHolidays()).
 */
export function addBusinessDays(
  date: Date,
  days: number,
  holidaySet: Set<string>
): Date {
  const result = new Date(date);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isWeekendDate(result) || holidaySet.has(toDateOnlyString(result))) {
      continue;
    }
    remaining -= 1;
  }
  return result;
}

/**
 * Tope = SI alguna factura seleccionada está vencida (due_date < hoy)
 *          ENTONCES hoy + 2 días hábiles
 *        SINO min( fecha_vencimiento_mas_proxima, hoy + 30 días hábiles )
 * `null` si no hay facturas seleccionadas con due_date válido (sin tope).
 */
export function computeDueDateCap(
  selectedInvoices: Array<{ due_date?: string | null }>,
  holidaySet: Set<string>,
  today: Date = new Date()
): Date | null {
  const dueDates = (selectedInvoices || [])
    .map((invoice) =>
      invoice?.due_date ? parseDateOnlyLocal(invoice.due_date) : null
    )
    .filter((date): date is Date => !!date);

  if (dueDates.length === 0) return null;

  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const hasOverdueInvoice = dueDates.some((date) => date < startOfToday);
  if (hasOverdueInvoice) {
    return addBusinessDays(startOfToday, 2, holidaySet);
  }

  const nearestDueDate = dueDates.reduce((min, date) =>
    date < min ? date : min
  );
  const maxHorizon = addBusinessDays(startOfToday, 30, holidaySet);
  return nearestDueDate < maxHorizon ? nearestDueDate : maxHorizon;
}

export function isNextManagementDateDisabled(
  date: Date,
  params: {
    holidaySet: Set<string>;
    dueDateCap: Date | null;
    today?: Date;
  }
): boolean {
  if (isPastDate(date, params.today)) return true;
  if (isWeekendDate(date)) return true;
  if (params.holidaySet.has(toDateOnlyString(date))) return true;
  if (params.dueDateCap && date > params.dueDateCap) return true;
  return false;
}
