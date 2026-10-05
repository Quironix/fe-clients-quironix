import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isChunkLoadError,
  reloadOnceOnChunkLoadError,
  RELOAD_COOLDOWN_MS,
  RELOAD_STORAGE_KEY,
} from "../chunk-load-error";

function makeChunkLoadError() {
  const error = new Error("Loading chunk 7203 failed.");
  error.name = "ChunkLoadError";
  return error;
}

describe("isChunkLoadError", () => {
  it("should detect an error named ChunkLoadError", () => {
    expect(isChunkLoadError(makeChunkLoadError())).toBe(true);
  });

  it("should detect a chunk failure by its message", () => {
    expect(isChunkLoadError(new Error("Loading chunk 1294 failed."))).toBe(
      true,
    );
    expect(isChunkLoadError(new Error("Loading CSS chunk 12 failed."))).toBe(
      true,
    );
  });

  it("should ignore unrelated errors and non-error values", () => {
    expect(isChunkLoadError(new Error("Network request failed"))).toBe(false);
    expect(isChunkLoadError("Loading chunk 1 failed.")).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });
});

describe("reloadOnceOnChunkLoadError", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-05T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should reload and remember when it did", () => {
    const reload = vi.fn();

    expect(reloadOnceOnChunkLoadError(makeChunkLoadError(), reload)).toBe(true);

    expect(reload).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(RELOAD_STORAGE_KEY)).toBe(String(Date.now()));
  });

  it("should not reload for unrelated errors", () => {
    const reload = vi.fn();

    expect(reloadOnceOnChunkLoadError(new Error("boom"), reload)).toBe(false);

    expect(reload).not.toHaveBeenCalled();
  });

  it("should not reload again within the cooldown", () => {
    const reload = vi.fn();
    reloadOnceOnChunkLoadError(makeChunkLoadError(), reload);

    vi.advanceTimersByTime(RELOAD_COOLDOWN_MS - 1);

    expect(reloadOnceOnChunkLoadError(makeChunkLoadError(), reload)).toBe(
      false,
    );
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("should reload again once the cooldown has passed", () => {
    const reload = vi.fn();
    reloadOnceOnChunkLoadError(makeChunkLoadError(), reload);

    vi.advanceTimersByTime(RELOAD_COOLDOWN_MS);

    expect(reloadOnceOnChunkLoadError(makeChunkLoadError(), reload)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("should not reload when sessionStorage is unavailable", () => {
    const reload = vi.fn();
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage blocked");
      });

    expect(reloadOnceOnChunkLoadError(makeChunkLoadError(), reload)).toBe(
      false,
    );
    expect(reload).not.toHaveBeenCalled();

    getItem.mockRestore();
  });
});
