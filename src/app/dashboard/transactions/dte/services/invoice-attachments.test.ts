import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bulkUploadAttachments,
  createInvoiceAttachment,
  deleteInvoiceAttachment,
  getInvoiceAttachments,
} from "./index";

describe("invoice attachments services (PRD_adjuntos_facturas_y_comprobantes_collector.md §5.2/§6)", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("1. bulkUploadAttachments POSTs to the bulk-upload endpoint with a multipart FormData body", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ validCount: 1, invalidCount: 0, errors: [] }),
    });

    const csvFile = new File(["number,nombre_archivo"], "index.csv", {
      type: "text/csv",
    });
    const pdfFile = new File(["%PDF-1.4"], "comprobante.pdf", {
      type: "application/pdf",
    });

    await bulkUploadAttachments("token-1", "client-1", csvFile, [pdfFile]);

    const [url, options] = (global.fetch as any).mock.calls[0];
    expect(url).toContain(
      "/v2/clients/client-1/invoices/attachments/bulk-upload"
    );
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.headers.Authorization).toBe("Bearer token-1");
  });

  it("2. bulkUploadAttachments appends the csv field and one 'files' entry per PDF", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ validCount: 2, invalidCount: 0, errors: [] }),
    });

    const csvFile = new File(["number,nombre_archivo"], "index.csv");
    const pdfFiles = [
      new File(["a"], "a.pdf"),
      new File(["b"], "b.pdf"),
    ];

    await bulkUploadAttachments("token-1", "client-1", csvFile, pdfFiles);

    const [, options] = (global.fetch as any).mock.calls[0];
    const formData = options.body as FormData;
    expect(formData.get("csv")).toBeInstanceOf(File);
    expect(formData.getAll("files")).toHaveLength(2);
  });

  it("3. bulkUploadAttachments returns the parsed JSON response on success", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ validCount: 3, invalidCount: 1, errors: ["x"] }),
    });

    const result = await bulkUploadAttachments(
      "token-1",
      "client-1",
      new File(["a"], "a.csv"),
      [new File(["a"], "a.pdf")]
    );

    expect(result).toEqual({ validCount: 3, invalidCount: 1, errors: ["x"] });
  });

  it("4. bulkUploadAttachments throws a structured error message on a non-ok response", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "CSV inválido" }),
    });

    await expect(
      bulkUploadAttachments(
        "token-1",
        "client-1",
        new File(["a"], "a.csv"),
        [new File(["a"], "a.pdf")]
      )
    ).rejects.toThrow(/CSV inválido/);
  });

  it("5. createInvoiceAttachment POSTs a JSON body with Authorization and Content-Type headers", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "attachment-1" }),
    });

    await createInvoiceAttachment("token-1", "client-1", "invoice-1", {
      file: "base64content",
      filename: "comprobante.pdf",
    });

    const [url, options] = (global.fetch as any).mock.calls[0];
    expect(url).toContain("/v2/clients/client-1/invoices/invoice-1/attachments");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({
      file: "base64content",
      filename: "comprobante.pdf",
    });
  });

  it("6. createInvoiceAttachment throws with the backend error message on failure", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Factura no encontrada para este cliente" }),
    });

    await expect(
      createInvoiceAttachment("token-1", "client-1", "invoice-1", {
        file: "base64content",
        filename: "comprobante.pdf",
      })
    ).rejects.toThrow("Factura no encontrada para este cliente");
  });

  it("7. getInvoiceAttachments GETs the invoice-scoped URL and returns the parsed list", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [{ id: "attachment-1" }],
    });

    const result = await getInvoiceAttachments(
      "token-1",
      "client-1",
      "invoice-1"
    );

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toContain("/v2/clients/client-1/invoices/invoice-1/attachments");
    expect(result).toEqual([{ id: "attachment-1" }]);
  });

  it("8. getInvoiceAttachments throws when the response is not ok", async () => {
    (global.fetch as any).mockResolvedValue({ ok: false, json: async () => ({}) });

    await expect(
      getInvoiceAttachments("token-1", "client-1", "invoice-1")
    ).rejects.toThrow();
  });

  it("9. deleteInvoiceAttachment issues a DELETE to the attachment-scoped URL", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await deleteInvoiceAttachment("token-1", "client-1", "attachment-1");

    const [url, options] = (global.fetch as any).mock.calls[0];
    expect(url).toContain("/v2/clients/client-1/invoices/attachments/attachment-1");
    expect(options.method).toBe("DELETE");
  });

  it("10. deleteInvoiceAttachment throws when the response is not ok", async () => {
    (global.fetch as any).mockResolvedValue({ ok: false, json: async () => ({}) });

    await expect(
      deleteInvoiceAttachment("token-1", "client-1", "attachment-1")
    ).rejects.toThrow();
  });
});
