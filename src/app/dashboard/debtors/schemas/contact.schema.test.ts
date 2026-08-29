import { describe, expect, it } from "vitest";
import { contactSchema } from "./contact.schema";

const BASE = {
  name: "John Doe",
  role: "Manager",
  function: "finance",
};

describe("contactSchema", () => {
  it("channel=email, email provided, no phone → success", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "email",
      email: "john@example.com",
      phone: "",
    });
    expect(result.success).toBe(true);
  });

  it("channel=email, no email, phone provided → fail on email", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "email",
      email: "",
      phone: "+56912345678",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("email");
    }
  });

  it("channel=phone, phone provided (8+ chars), no email → success", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "phone",
      email: "",
      phone: "+56912345678",
    });
    expect(result.success).toBe(true);
  });

  it("channel=whatsapp, phone provided, no email → success", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "whatsapp",
      email: "",
      phone: "+56912345678",
    });
    expect(result.success).toBe(true);
  });

  it("channel=sms, phone provided, no email → success", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "sms",
      email: "",
      phone: "+56912345678",
    });
    expect(result.success).toBe(true);
  });

  it("channel=phone, no phone, email provided → fail on phone", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "phone",
      email: "john@example.com",
      phone: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("phone");
    }
  });

  it("channel=email, both fields empty → fail on email", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "email",
      email: "",
      phone: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("email");
    }
  });

  it("channel=phone, both fields empty → fail on phone", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "phone",
      email: "",
      phone: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("phone");
    }
  });

  it("channel=email, both fields filled → success", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "email",
      email: "john@example.com",
      phone: "+56912345678",
    });
    expect(result.success).toBe(true);
  });

  it("channel=phone, both fields filled → success", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "phone",
      email: "john@example.com",
      phone: "+56912345678",
    });
    expect(result.success).toBe(true);
  });

  it("channel=EMAIL (uppercase) → same as email (case-insensitive)", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "EMAIL",
      email: "",
      phone: "+56912345678",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("email");
    }
  });

  it("channel=WHATSAPP (uppercase) → same as whatsapp", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "WHATSAPP",
      email: "john@example.com",
      phone: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("phone");
    }
  });

  it("channel not provided (empty string) → fail on channel", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "",
      email: "john@example.com",
      phone: "+56912345678",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("channel");
    }
  });

  it("preferred/enabled/pdf/overdue fields default to enabled=true and the rest false when omitted", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "email",
      email: "john@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.default).toBe(false);
      expect(result.data.enabled).toBe(true);
      expect(result.data.send_pdf).toBe(false);
      expect(result.data.overdue_invoices).toBe(false);
      expect(result.data.collector_ids).toEqual([]);
    }
  });

  it("accepts explicit values for enabled/send_pdf/overdue_invoices", () => {
    const result = contactSchema.safeParse({
      ...BASE,
      channel: "email",
      email: "john@example.com",
      default: true,
      enabled: false,
      send_pdf: true,
      overdue_invoices: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.default).toBe(true);
      expect(result.data.enabled).toBe(false);
      expect(result.data.send_pdf).toBe(true);
      expect(result.data.overdue_invoices).toBe(true);
    }
  });
});
