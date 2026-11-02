import { afterEach, describe, expect, it, vi } from "vitest";
import { getEmailOriginal } from "../index";

const respondWith = (body: unknown) =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => body }),
  );

describe("getEmailOriginal", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns the original email", async () => {
    const original = {
      html: "<p>hola</p>",
      text: null,
      has_external_images: false,
    };
    respondWith(original);

    await expect(
      getEmailOriginal("token", "client-1", "COBRANZA", "email-1"),
    ).resolves.toEqual(original);
  });

  it("throws when the bff answers 200 with an error body", async () => {
    respondWith({
      message: "INBOUND_INVOICE_EMAIL_NOT_FOUND",
      statusCode: 404,
    });

    await expect(
      getEmailOriginal("token", "client-1", "FINANZAS", "email-1"),
    ).rejects.toThrow("INBOUND_INVOICE_EMAIL_NOT_FOUND");
  });
});
