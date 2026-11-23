export type AcceptedChannel = "EMAIL" | "PHONE" | "WHATSAPP" | "PORTAL";

export interface ContactRole {
  name: string;
  function: string;
  active: boolean;
}

export interface Salesperson {
  id: string;
  client_id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export type SalespersonInput = Pick<Salesperson, "name"> &
  Partial<Pick<Salesperson, "email" | "phone">>;

export type CalendarKind = "MONTHLY" | "WEEKLY";

export interface PaymentCalendar {
  kind: CalendarKind;
  days?: number[];
  weekday?: number;
  weeks?: number[];
  cutoff_days: number;
  cutoff_base: "DUE_DATE" | "RECEPTION";
  holiday_rule: "ADVANCE" | "POSTPONE";
}

export interface PaymentCalendarProposal {
  kind: CalendarKind;
  days?: number[];
  weekday?: number;
  coverage: number;
}

export interface PaymentProfile {
  habitual_payment_method: { via: string; last_payment_at: string } | null;
  payment_calendar_proposal: PaymentCalendarProposal | null;
  payment_calendar_alert: { out_of_calendar: number; total: number } | null;
}

export interface SuggestedContact {
  contact_id: string;
  reason: "LAST_MANAGEMENT" | "DOMINANT_CONTACT";
}

export interface SharedContactImpact {
  affected_debtors: number;
  debtors: { id: string; name: string }[];
}
