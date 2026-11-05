import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerLitigationManagement } from "./litigation-tracks";
import { createTrack } from "../../debtor-management/services/tracks";
import { queueTrackSummaryEmail } from "../../debtor-management/services/email-sender";

vi.mock("../../debtor-management/services/tracks", () => ({
  createTrack: vi.fn(),
}));
vi.mock("../../debtor-management/services/email-sender", () => ({
  queueTrackSummaryEmail: vi.fn(),
}));

const credentials = { accessToken: "token-1", clientId: "client-1" };
const management = {
  kind: "ENTRY" as const,
  debtorId: "debtor-1",
  invoiceIds: ["inv-1", "inv-1"],
  litigationIds: ["lit-1"],
  contacts: [{ name: "Ana", email: "ana@deudor.cl" }],
  selectedContact: "Ana",
  nextManagementDate: new Date("2026-11-10T00:00:00"),
  nextManagementTime: "09:00",
  sendEmail: true,
};

describe("registerLitigationManagement", () => {
  beforeEach(() => {
    vi.mocked(createTrack).mockResolvedValue({ track: { id: "track-1" } } as never);
    vi.mocked(queueTrackSummaryEmail).mockResolvedValue({
      success: true,
      message: "",
    });
  });

  it("guarda la gestión y encola su correo en el backend", async () => {
    const result = await registerLitigationManagement(credentials, management);

    expect(result).toEqual({ email: "QUEUED", recipient: "ana@deudor.cl" });
    expect(vi.mocked(createTrack).mock.calls[0][2]).toMatchObject({
      contact: { type: "EMAIL", value: "ana@deudor.cl", name: "Ana" },
      invoice_ids: ["inv-1"],
      case_data: { litigationIds: ["lit-1"] },
    });
    expect(queueTrackSummaryEmail).toHaveBeenCalledWith(
      ["track-1"],
      "token-1",
      "client-1"
    );
  });

  it("si no se pudo encolar lo informa como fallido", async () => {
    vi.mocked(queueTrackSummaryEmail).mockResolvedValue({
      success: false,
      message: "error",
    });

    const result = await registerLitigationManagement(credentials, management);

    expect(result.email).toBe("FAILED");
  });

  it("sin correo pedido no encola nada", async () => {
    vi.mocked(queueTrackSummaryEmail).mockClear();
    const result = await registerLitigationManagement(credentials, {
      ...management,
      sendEmail: false,
    });

    expect(result.email).toBe("SKIPPED");
    expect(queueTrackSummaryEmail).not.toHaveBeenCalled();
  });
});
