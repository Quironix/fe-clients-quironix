import { describe, expect, it } from "vitest";
import {
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

  describe("computeDueDateCap", () => {
    it("returns null when there are no selected invoices", () => {
      expect(computeDueDateCap([])).toBeNull();
    });

    it("returns min(due_date) + 2 días corridos", () => {
      const cap = computeDueDateCap([
        { due_date: "2026-06-20" },
        { due_date: "2026-06-10" },
        { due_date: "2026-06-30" },
      ]);
      expect(cap).not.toBeNull();
      expect(toDateOnlyString(cap as Date)).toBe("2026-06-12");
    });

    it("ignores invoices with a missing or invalid due_date", () => {
      const cap = computeDueDateCap([
        { due_date: undefined },
        { due_date: "not-a-date" },
        { due_date: "2026-06-10" },
      ]);
      expect(toDateOnlyString(cap as Date)).toBe("2026-06-12");
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
