const RELOAD_STORAGE_KEY = "chunk_load_error_reloaded_at";
const RELOAD_COOLDOWN_MS = 60_000;
const CHUNK_LOAD_MESSAGE = /Loading (CSS )?chunk .+ failed/i;

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" || CHUNK_LOAD_MESSAGE.test(error.message)
  );
}

export function reloadOnceOnChunkLoadError(
  error: unknown,
  reload: () => void = () => window.location.reload(),
): boolean {
  if (!isChunkLoadError(error)) return false;

  try {
    const lastReloadAt = Number(sessionStorage.getItem(RELOAD_STORAGE_KEY));
    if (Date.now() - lastReloadAt < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_STORAGE_KEY, String(Date.now()));
  } catch {
    return false;
  }

  reload();
  return true;
}

export { RELOAD_STORAGE_KEY, RELOAD_COOLDOWN_MS };
