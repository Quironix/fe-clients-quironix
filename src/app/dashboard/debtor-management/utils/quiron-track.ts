const QUIRON_SOURCES = ["AI_EMAIL_READER", "QUIRON_AUTOMATED_TASK"];

export function isQuironTrack(
  track?: {
    agentSource?: string | null;
    metadata?: { source?: string } | null;
  } | null
): boolean {
  if (!track) return false;
  return (
    QUIRON_SOURCES.includes(track.agentSource ?? "") ||
    QUIRON_SOURCES.includes(track.metadata?.source ?? "")
  );
}
