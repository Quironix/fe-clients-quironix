import type { Contact } from "../types";
import type { ContactRole, PaymentCalendar } from "../types/technical-file";

export function hasCollectorCoverage(contacts: Contact[] = []): boolean {
  return contacts.some(
    (contact) =>
      contact.enabled !== false &&
      ((contact.collector_ids?.length ?? 0) > 0 ||
        contact.send_pdf === true ||
        contact.overdue_invoices === true),
  );
}

export function functionOfRole(
  roles: ContactRole[],
  roleName: string | undefined | null,
): string {
  return roles.find((role) => role.name === roleName)?.function ?? "";
}

export function functionsWithoutDefault(contacts: Contact[] = []): string[] {
  const groups = new Map<string, boolean>();
  contacts
    .filter((contact) => contact.enabled !== false && contact.function)
    .forEach((contact) => {
      const fn = contact.function as string;
      groups.set(fn, (groups.get(fn) ?? false) || contact.default === true);
    });
  return [...groups].filter(([, hasDefault]) => !hasDefault).map(([fn]) => fn);
}

export const isSavedContact = (contact: Pick<Contact, "id">): boolean =>
  Boolean(contact.id);

const WEEKDAY_LABELS = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

export function describeCalendar(
  calendar: Pick<PaymentCalendar, "kind" | "days" | "weekday" | "weeks">,
): string {
  if (calendar.kind === "MONTHLY") {
    return `días ${(calendar.days ?? []).join(" y ")}`;
  }
  const weekday = WEEKDAY_LABELS[(calendar.weekday ?? 1) - 1];
  return calendar.weeks?.length
    ? `${weekday} de las semanas ${calendar.weeks.join(" y ")}`
    : `todos los ${weekday}`;
}

const DISMISS_DAYS = 30;
const dismissKey = (debtorId: string) =>
  `calendar-proposal-dismissed:${debtorId}`;

export function dismissProposal(debtorId: string, now = Date.now()): void {
  try {
    localStorage.setItem(dismissKey(debtorId), String(now));
  } catch {}
}

export function isProposalDismissed(
  debtorId: string,
  now = Date.now(),
): boolean {
  try {
    const stored = Number(localStorage.getItem(dismissKey(debtorId)));
    return stored > 0 && now - stored < DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}
