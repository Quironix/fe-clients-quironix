import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cn,
  formatDate,
  formatDateTime,
  toISOString,
  formatNumber,
  getPendingInstallments,
} from "../utils";

describe("cn", () => {
  it("should merge multiple class strings", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toContain("px-4");
    expect(result).toContain("py-1");
    expect(result).not.toContain("px-2");
  });

  it("should handle conditional/falsy values", () => {
    expect(cn("base", false, undefined, "extra")).toBe("base extra");
  });

  it("should return empty string for no arguments", () => {
    expect(cn()).toBe("");
  });
});

describe("formatNumber", () => {
  it("should format with currency symbol by default", () => {
    const result = formatNumber(1000000);
    expect(result).toContain("$");
    expect(result).toContain("1.000.000");
  });

  it("should format without currency symbol when isCurrency is false", () => {
    expect(formatNumber(1000000, false)).toBe("1.000.000");
  });

  it("should format zero with currency symbol", () => {
    expect(formatNumber(0)).toBe("$0");
  });

  it("should format negative numbers", () => {
    const result = formatNumber(-5000);
    expect(result).toContain("$");
    expect(result).toContain("-");
    expect(result).toContain("5.000");
  });

  it("should return '0' for NaN", () => {
    expect(formatNumber(NaN)).toBe("0");
  });

  it("should round decimals", () => {
    const result = formatNumber(1500.75);
    expect(result).toBe("$1.501");
  });
});

describe("toISOString", () => {
  it("should convert a Date object to ISO string", () => {
    const date = new Date("2024-03-15T10:00:00Z");
    expect(toISOString(date)).toBe("2024-03-15T10:00:00.000Z");
  });

  it("should convert dd-MM-yyyy string to ISO string", () => {
    const result = toISOString("15-03-2024");
    expect(result).toContain("2024-03-15");
  });

  it("should return empty string for null", () => {
    expect(toISOString(null)).toBe("");
  });

  it("should return empty string for undefined", () => {
    expect(toISOString(undefined)).toBe("");
  });

  it("should return empty string for invalid string", () => {
    expect(toISOString("garbage")).toBe("");
  });
});

describe("formatDate", () => {
  it("should format ISO date string to dd-MM-yyyy", () => {
    const result = formatDate("2024-01-15T00:00:00.000Z");
    expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/);
  });

  it("should handle dd-MM-yyyy input format", () => {
    const result = formatDate("19-11-2018");
    expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/);
  });

  it("should return empty string for empty input", () => {
    expect(formatDate("")).toBe("");
  });

  it("should return empty string for invalid date", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("should format ISO datetime to dd-MM-yyyy HH:mm", () => {
    const result = formatDateTime("2024-01-15T15:30:00Z");
    expect(result).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/);
  });

  it("should format midnight UTC", () => {
    const result = formatDateTime("2024-06-01T00:00:00Z");
    expect(result).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/);
  });
});

describe("getPendingInstallments", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return pending monthly installments from current date onward", () => {
    const result = getPendingInstallments(
      "2024-01-15",
      "2024-12-15",
      12,
      "MONTHLY"
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(7);
    result.forEach((item) => {
      expect(item).toMatch(/^Cuota \d+\/12 \(\d{2}-\d{2}-\d{4}\)$/);
    });
  });

  it("should handle WEEKLY frequency with 7-day spacing", () => {
    vi.setSystemTime(new Date("2024-06-01T12:00:00Z"));
    const result = getPendingInstallments(
      "2024-06-01",
      "2024-06-22",
      4,
      "WEEKLY"
    );
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.length).toBeLessThanOrEqual(4);
    result.forEach((item) => {
      expect(item).toMatch(/^Cuota \d+\/4/);
    });
  });

  it("should return empty array when all installments are in the past", () => {
    vi.setSystemTime(new Date("2025-01-01T12:00:00Z"));
    const result = getPendingInstallments(
      "2024-01-15",
      "2024-06-15",
      6,
      "MONTHLY"
    );
    expect(result).toEqual([]);
  });

  it("should return empty array for missing required parameters", () => {
    expect(getPendingInstallments("", "2024-12-31", 0)).toEqual([]);
  });

  it("should include installment falling on current date", () => {
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    const result = getPendingInstallments(
      "15-06-2024",
      "15-12-2024",
      7,
      "MONTHLY"
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toContain("Cuota 1/7");
  });

  it("should handle FREQ_15_DAYS frequency", () => {
    vi.setSystemTime(new Date("2024-06-01T12:00:00Z"));
    const result = getPendingInstallments(
      "01-06-2024",
      "01-08-2024",
      4,
      "FREQ_15_DAYS"
    );
    expect(result).toHaveLength(4);
  });

  it("should handle QUARTERLY / FREQ_90_DAYS frequency", () => {
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
    const result = getPendingInstallments(
      "01-01-2024",
      "31-12-2024",
      4,
      "QUARTERLY"
    );
    expect(result).toHaveLength(4);
  });

  it("should default to monthly for unknown frequency", () => {
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    const result = getPendingInstallments(
      "15-06-2024",
      "15-12-2024",
      7,
      "UNKNOWN"
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toContain("Cuota 1/7");
  });
});
