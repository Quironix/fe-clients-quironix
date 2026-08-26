import { describe, expect, it } from "vitest";
import {
  addBusinessDays,
  computeDueDateCap,
  isNextManagementDateDisabled,
  isPastDate,
  isWeekendDate,
  toDateOnlyString,
} from "./next-management-date";

describe("next-management-date (PRD_tareas_validacion_fecha_y_pdf_facturas.md §6-A)", () => {
  describe("isWeekendDate", () => {
    it("flags Saturday and Sunday as weekend", () => {
      expect(isWeekendDate(new Date(2026, 0, 3))).toBe(true); // Saturday
      expect(isWeekendDate(new Date(2026, 0, 4))).toBe(true); // Sunday
    });

    it("does not flag a plain weekday", () => {
      expect(isWeekendDate(new Date(2026, 0, 2))).toBe(false); // Friday
    });
  });

  describe("isPastDate", () => {
    it("flags a date before today", () => {
      const today = new Date(2026, 5, 15);
      expect(isPastDate(new Date(2026, 5, 14), today)).toBe(true);
    });

    it("does not flag today itself", () => {
      const today = new Date(2026, 5, 15, 18, 30);
      expect(isPastDate(new Date(2026, 5, 15), today)).toBe(false);
    });

    it("does not flag a future date", () => {
      const today = new Date(2026, 5, 15);
      expect(isPastDate(new Date(2026, 5, 16), today)).toBe(false);
    });
  });

  describe("addBusinessDays", () => {
    it("skips weekends", () => {
      // 2026-01-15 es jueves
      const result = addBusinessDays(new Date(2026, 0, 15), 2, new Set());
      // vie 16, sáb/dom saltados -> lun 19
      expect(toDateOnlyString(result)).toBe("2026-01-19");
    });

    it("skips holidays in holidaySet", () => {
      const holidaySet = new Set(["2026-01-16"]); // viernes feriado
      const result = addBusinessDays(new Date(2026, 0, 15), 2, holidaySet);
      // vie 16 feriado, sáb/dom saltados, lun 19, mar 20
      expect(toDateOnlyString(result)).toBe("2026-01-20");
    });
  });

  describe("computeDueDateCap", () => {
    const today = new Date(2026, 0, 15); // jueves

    it("returns null when there are no selected invoices", () => {
      expect(computeDueDateCap([], new Set(), today)).toBeNull();
    });

    it("returns null when due_date is missing or invalid", () => {
      expect(
        computeDueDateCap(
          [{ due_date: undefined }, { due_date: "not-a-date" }],
          new Set(),
          today
        )
      ).toBeNull();
    });

    it("caps at today + 2 business days when an invoice is overdue", () => {
      const cap = computeDueDateCap(
        [{ due_date: "2026-01-10" }], // vencida
        new Set(),
        today
      );
      expect(toDateOnlyString(cap as Date)).toBe("2026-01-19");
    });

    it("caps at min(nearest due date, today + 30 business days) when nothing is overdue and nearest due date is closer", () => {
      const cap = computeDueDateCap(
        [{ due_date: "2026-01-20" }, { due_date: "2026-02-01" }],
        new Set(),
        today
      );
      expect(toDateOnlyString(cap as Date)).toBe("2026-01-20");
    });

    it("caps at today + 30 business days when nothing is overdue and nearest due date is farther out", () => {
      const cap = computeDueDateCap(
        [{ due_date: "2026-12-31" }],
        new Set(),
        today
      );
      const expected = addBusinessDays(today, 30, new Set());
      expect(toDateOnlyString(cap as Date)).toBe(toDateOnlyString(expected));
    });

    it("the overdue rule wins when there is a mix of overdue and non-overdue invoices", () => {
      const cap = computeDueDateCap(
        [{ due_date: "2026-01-10" }, { due_date: "2026-01-16" }],
        new Set(),
        today
      );
      // vencida manda: hoy + 2 hábiles, no min(due_date, hoy+30h)
      expect(toDateOnlyString(cap as Date)).toBe("2026-01-19");
    });

    it("skips holidays when computing the overdue cap", () => {
      const holidaySet = new Set(["2026-01-16"]);
      const cap = computeDueDateCap(
        [{ due_date: "2026-01-10" }],
        holidaySet,
        today
      );
      expect(toDateOnlyString(cap as Date)).toBe("2026-01-20");
    });
  });

  describe("isNextManagementDateDisabled", () => {
    const today = new Date(2026, 0, 1); // 2026-01-01, a Thursday holiday

    it("disables a past date", () => {
      expect(
        isNextManagementDateDisabled(new Date(2025, 11, 31), {
          holidaySet: new Set(),
          dueDateCap: null,
          today,
        })
      ).toBe(true);
    });

    it("disables a weekend date", () => {
      expect(
        isNextManagementDateDisabled(new Date(2026, 0, 3), {
          holidaySet: new Set(),
          dueDateCap: null,
          today,
        })
      ).toBe(true);
    });

    it("disables a date present in the holiday set", () => {
      expect(
        isNextManagementDateDisabled(new Date(2026, 0, 1), {
          holidaySet: new Set(["2026-01-01"]),
          dueDateCap: null,
          today,
        })
      ).toBe(true);
    });

    it("disables a date beyond the due-date cap", () => {
      const dueDateCap = new Date(2026, 0, 5);
      expect(
        isNextManagementDateDisabled(new Date(2026, 0, 6), {
          holidaySet: new Set(),
          dueDateCap,
          today,
        })
      ).toBe(true);
    });

    it("allows a plain business day within the cap and with no holiday", () => {
      const dueDateCap = new Date(2026, 0, 10);
      expect(
        isNextManagementDateDisabled(new Date(2026, 0, 2), {
          holidaySet: new Set(),
          dueDateCap,
          today,
        })
      ).toBe(false);
    });

    it("allows any future business day when there is no due-date cap", () => {
      expect(
        isNextManagementDateDisabled(new Date(2026, 5, 15), {
          holidaySet: new Set(),
          dueDateCap: null,
          today,
        })
      ).toBe(false);
    });
  });
});
