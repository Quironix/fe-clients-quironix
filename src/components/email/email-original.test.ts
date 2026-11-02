import { describe, expect, it } from "vitest";
import { emailOriginalSrcDoc } from "./email-original";

const policyOf = (srcDoc: string) =>
  srcDoc.match(/Content-Security-Policy" content="([^"]*)"/)?.[1];

describe("emailOriginalSrcDoc", () => {
  it("blocks scripts and external images until the user asks for them", () => {
    const srcDoc = emailOriginalSrcDoc(
      '<img src="https://tracker.example.com/pixel.gif"><script>x()</script>',
      ["https://storage.example.com/bucket/logo.png?token=abc"],
      false,
    );

    expect(policyOf(srcDoc)).toBe(
      "default-src 'none'; style-src 'unsafe-inline'; img-src data: https://storage.example.com/bucket/logo.png",
    );
  });

  it("allows external images once requested", () => {
    expect(policyOf(emailOriginalSrcDoc("<p>hola</p>", [], true))).toBe(
      "default-src 'none'; style-src 'unsafe-inline'; img-src data: https: http:",
    );
  });

  it("keeps standards mode when the email declares a doctype", () => {
    expect(
      emailOriginalSrcDoc("\n<!DOCTYPE html><p>hola</p>", [], false),
    ).toMatch(/^<!doctype html><meta /);
    expect(emailOriginalSrcDoc("<p>hola</p>", [], false)).toMatch(/^<meta /);
  });

  it("drops attachment urls that would break the policy", () => {
    const srcDoc = emailOriginalSrcDoc(
      "<p>hola</p>",
      ["https://storage.example.com/a;script-src *", "not a url"],
      false,
    );

    expect(policyOf(srcDoc)).toBe(
      "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
    );
  });
});
