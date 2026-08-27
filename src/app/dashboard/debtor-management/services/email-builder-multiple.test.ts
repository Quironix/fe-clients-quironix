import { describe, expect, it } from "vitest";
import { buildMultipleEmailPayload } from "./email-builder-multiple";

// Local minimal shapes instead of importing ManagementFormData/SavedManagement
// from add-management-tab.tsx: that file transitively pulls in
// ManagementLitigationForm.tsx, which the vite/esbuild JSX transform in this
// repo's vitest config fails to parse (pre-existing, unrelated to this fix —
// confirmed the same failure happens on develop HEAD via `git stash`).
type TestFormData = Record<string, any>;
type TestManagement = Record<string, any>;

const invoices = [
  { id: "inv-1", balance: 4200000 },
  { id: "inv-2", balance: 800000 },
] as any;

const baseFormData = (overrides: Partial<TestFormData> = {}): TestFormData => ({
  managementType: "CALL_OUT",
  debtorComment: "WILL_DEPOSIT_OR_TRANSFER",
  executiveComment: "WITH_PAYMENT_COMMITMENT",
  contactType: "EMAIL",
  contactValue: "principal@ejemplo.com",
  observation: "",
  nextManagementDate: "",
  nextManagementTime: "",
  caseData: {},
  ...overrides,
});

const baseManagement = (
  formOverrides: Partial<TestFormData> = {},
): TestManagement => ({
  id: "mgmt-1",
  formData: baseFormData(formOverrides),
  selectedInvoices: invoices,
  createdAt: new Date(),
});

const baseParams = (managements: TestManagement[]) => ({
  managements,
  profile: { client: { name: "ACME" } },
  contactEmail: "principal@ejemplo.com",
  contactName: "Deudor 1",
  debtorName: "Deudor 1",
});

describe("buildMultipleEmailPayload — committed amount", () => {
  it("uses the edited committed amount instead of the invoice sum when it's a number", () => {
    const payload = buildMultipleEmailPayload(
      baseParams([baseManagement({ caseData: { amount: 1000 } })]),
    );
    expect(payload.dynamicTemplateData.managements[0].header_amount).toBe("1.000");
  });

  it("falls back to the invoice sum when the committed amount is a string (regression: native <input> onChange must coerce to number)", () => {
    const payload = buildMultipleEmailPayload(
      baseParams([baseManagement({ caseData: { amount: "1000" } })]),
    );
    expect(payload.dynamicTemplateData.managements[0].header_amount).toBe("5.000.000");
  });

  it("falls back to the invoice sum when no committed amount was entered", () => {
    const payload = buildMultipleEmailPayload(
      baseParams([baseManagement({ caseData: {} })]),
    );
    expect(payload.dynamicTemplateData.managements[0].header_amount).toBe("5.000.000");
  });

  it("keeps each management's own committed amount independent when batching several", () => {
    const payload = buildMultipleEmailPayload(
      baseParams([
        baseManagement({ caseData: { amount: 1000 } }),
        baseManagement({ caseData: { amount: 2000 } }),
      ]),
    );
    expect(payload.dynamicTemplateData.managements[0].header_amount).toBe("1.000");
    expect(payload.dynamicTemplateData.managements[1].header_amount).toBe("2.000");
  });

  it("honors the committed amount regardless of management channel (MAIL_OUT, not just CALL_OUT — the combo lookup matches only on debtor_comment/executive_comment, see management-types.ts:1326-1329)", () => {
    const payload = buildMultipleEmailPayload(
      baseParams([
        baseManagement({ managementType: "MAIL_OUT", caseData: { amount: 1000 } }),
      ]),
    );
    expect(payload.dynamicTemplateData.managements[0].header_amount).toBe("1.000");
  });
});
