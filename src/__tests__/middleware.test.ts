import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: (handler: any) => handler,
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => ({ type: "next" })),
    redirect: vi.fn((url: URL) => ({ type: "redirect", url: url.toString() })),
  },
}));

describe("root route redirect", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should redirect authenticated users to /dashboard/overview", async () => {
    const middleware = (await import("@/middleware")).default;
    const { NextResponse } = await import("next/server");

    const req = {
      auth: { token: "valid-token" },
      nextUrl: { pathname: "/", origin: "http://localhost:3000" },
    };

    await middleware(req as any);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/dashboard/overview", "http://localhost:3000")
    );
  });

  it("should redirect unauthenticated users to /sign-in", async () => {
    const middleware = (await import("@/middleware")).default;
    const { NextResponse } = await import("next/server");

    const req = {
      auth: null,
      nextUrl: { pathname: "/", origin: "http://localhost:3000" },
    };

    await middleware(req as any);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/sign-in", "http://localhost:3000")
    );
  });
});

describe("clearProfileCache", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should export clearProfileCache as a function", async () => {
    const { clearProfileCache } = await import("@/middleware");
    expect(typeof clearProfileCache).toBe("function");
  });

  it("should not throw when called with a token", async () => {
    const { clearProfileCache } = await import("@/middleware");
    expect(() => clearProfileCache("some-token")).not.toThrow();
  });

  it("should not throw when called without arguments (clear all)", async () => {
    const { clearProfileCache } = await import("@/middleware");
    expect(() => clearProfileCache()).not.toThrow();
  });
});
