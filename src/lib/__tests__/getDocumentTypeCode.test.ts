import { describe, it, expect, vi } from "vitest";

vi.mock("@/app/dashboard/data", () => ({
  INVOICE_TYPES: [
    {
      country: "CL",
      types: [
        { label: "Factura Electr\u00f3nica", value: "INVOICE", code: "Fac. E" },
        {
          label: "Factura No Afecta o Exenta Electr\u00f3nica",
          value: "EXEMPT_INVOICE",
          code: "Fac. NE",
        },
        {
          label: "Nota de D\u00e9bito Electr\u00f3nica",
          value: "DEBIT_NOTE",
          code: "ND E",
        },
        {
          label: "Nota de Cr\u00e9dito Electr\u00f3nica",
          value: "CREDIT_NOTE",
          code: "NC E",
        },
        {
          label: "Gu\u00eda de Despacho Electr\u00f3nica",
          value: "DISPATCH_GUIDE",
          code: "GD E",
        },
        {
          label: "Factura de Exportaci\u00f3n Electr\u00f3nica",
          value: "EXPORT_INVOICE",
          code: "Fac. Exp. E",
        },
      ],
    },
  ],
}));

import { getDocumentTypeCode } from "../getDocumentTypeCode";

describe("getDocumentTypeCode", () => {
  it("should return 'Fac. E' for INVOICE", () => {
    expect(getDocumentTypeCode("INVOICE")).toBe("Fac. E");
  });

  it("should return 'NC E' for CREDIT_NOTE", () => {
    expect(getDocumentTypeCode("CREDIT_NOTE")).toBe("NC E");
  });

  it("should return 'ND E' for DEBIT_NOTE", () => {
    expect(getDocumentTypeCode("DEBIT_NOTE")).toBe("ND E");
  });

  it("should return 'Fac. NE' for EXEMPT_INVOICE", () => {
    expect(getDocumentTypeCode("EXEMPT_INVOICE")).toBe("Fac. NE");
  });

  it("should return 'Fac. Exp. E' for EXPORT_INVOICE", () => {
    expect(getDocumentTypeCode("EXPORT_INVOICE")).toBe("Fac. Exp. E");
  });

  it("should return 'GD E' for DISPATCH_GUIDE", () => {
    expect(getDocumentTypeCode("DISPATCH_GUIDE")).toBe("GD E");
  });

  it("should return undefined for unknown document type", () => {
    expect(getDocumentTypeCode("NON_EXISTENT_TYPE")).toBeUndefined();
  });

  it("should return undefined for empty string", () => {
    expect(getDocumentTypeCode("")).toBeUndefined();
  });
});
