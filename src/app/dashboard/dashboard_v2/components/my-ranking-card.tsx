import { formatNumber } from "@/lib/utils";
import { MOCK_TODAY_STATS } from "../constants/mock-extras";
import { TeamMemberRow } from "../types";

const commitmentsToday = MOCK_TODAY_STATS.find(
  (s) => s.label === "Compromisos que vencen hoy"
);

interface MyRankingCardProps {
  team?: TeamMemberRow[];
  currentExecutiveId?: string;
}

export const MyRankingCard: React.FC<MyRankingCardProps> = ({
  team = [],
  currentExecutiveId,
}) => {
  const ranked = [...team].sort((a, b) => b.cashGenerated - a.cashGenerated);
  const matchIndex = ranked.findIndex((r) => r.executiveId === currentExecutiveId);
  // Falls back to the 2nd row when the logged-in user isn't one of the
  // fetched executives (e.g. previewing as an admin, or mock-fallback data
  // with placeholder ids) so the card still demonstrates its content.
  const meIndex = matchIndex >= 0 ? matchIndex : ranked.length > 1 ? 1 : 0;
  const me = ranked.length > 0 ? ranked[meIndex] : undefined;
  const leader = ranked[0];
  const gap =
    me && leader && me !== leader
      ? formatNumber(leader.cashGenerated - me.cashGenerated)
      : null;

  return (
    <div className="qxv2-card qxv2-v2-card">
      <div className="qxv2-card-h">
        <h3>Mi posición en el equipo</h3>
        <span className="qxv2-h-sub">Por caja recuperada</span>
      </div>
      <div className="qxv2-body">
        {me && (
          <div className="qxv2-rank-me">
            <span className="qxv2-rm-pos">
              {meIndex + 1}º<small> de {ranked.length}</small>
            </span>
            <span style={{ fontSize: 12.5, color: "var(--qx-muted)", fontWeight: 700 }}>
              {gap ? (
                <>
                  Estás a <strong style={{ color: "var(--qx-ink)" }}>{gap}</strong> del
                  1er lugar.
                  {commitmentsToday && (
                    <>
                      {" "}
                      Los {commitmentsToday.value} compromisos de hoy (
                      {commitmentsToday.note.replace(" en juego", "")}) te acercan.
                    </>
                  )}
                </>
              ) : (
                "Vas liderando el ranking del equipo."
              )}
            </span>
          </div>
        )}
        <div className="qxv2-rank-list">
          {ranked.map((r, i) => (
            <div
              className={`qxv2-rank-li ${i === meIndex ? "me" : ""}`}
              key={r.executiveId}
            >
              <span className="qxv2-rl-rk">{i + 1}</span>
              <span>{r.executiveName}</span>
              <span className="qxv2-rl-ca">{formatNumber(r.cashGenerated)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
