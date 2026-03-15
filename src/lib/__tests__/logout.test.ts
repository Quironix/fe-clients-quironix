import { describe, it, expect, vi, beforeEach } from "vitest";
import { clearClientStorage, STORAGE_KEYS_TO_CLEAR } from "../logout";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("clearClientStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should remove all specified keys from localStorage", () => {
    STORAGE_KEYS_TO_CLEAR.forEach((key) => {
      localStorage.setItem(key, "test-value");
    });

    clearClientStorage();

    STORAGE_KEYS_TO_CLEAR.forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  it("should not remove unrelated keys from localStorage", () => {
    localStorage.setItem("unrelated-key", "keep-me");
    STORAGE_KEYS_TO_CLEAR.forEach((key) => {
      localStorage.setItem(key, "remove-me");
    });

    clearClientStorage();

    expect(localStorage.getItem("unrelated-key")).toBe("keep-me");
  });

  it("should not throw when localStorage is empty", () => {
    expect(() => clearClientStorage()).not.toThrow();
  });
});

describe("logout", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should clear storage and call signOut with callbackUrl", async () => {
    const { signOut } = await import("next-auth/react");
    const { logout } = await import("../logout");

    STORAGE_KEYS_TO_CLEAR.forEach((key) => {
      localStorage.setItem(key, "test");
    });

    await logout();

    STORAGE_KEYS_TO_CLEAR.forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
    });
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/sign-in" });
  });
});

describe("STORAGE_KEYS_TO_CLEAR", () => {
  it("should include all expected keys", () => {
    expect(STORAGE_KEYS_TO_CLEAR).toContain("profile");
    expect(STORAGE_KEYS_TO_CLEAR).toContain("litigationSelection");
    expect(STORAGE_KEYS_TO_CLEAR).toContain("paymentPlansSelection");
    expect(STORAGE_KEYS_TO_CLEAR).toContain("collectorsSelection");
    expect(STORAGE_KEYS_TO_CLEAR).toContain("paymentNettingSelection");
  });
});
