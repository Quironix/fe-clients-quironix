import { formatNumber } from "@/lib/utils";
import { MOCK_TEAM_TREND } from "../constants/mock-extras";
import { TeamMemberRow } from "../types";

interface TeamTableProps {
  data?: TeamMemberRow[];
  isLoading?: boolean;
  highlightExecutiveId?: string;
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const toneColor = (v: number) =>
  v < 50 ? "#EF4444" : v < 70 ? "#F59E0B" : "#1FA35C";

const Metric = ({ value }: { value?: number }) => {
  if (value === undefined) {
    return <span style={{ color: "#98A2B3", fontSize: 12.5 }}>—</span>;
  }
  return (
    <div className="qxv2-t-metric">
      <span className="qxv2-tm-val" style={{ color: toneColor(value) }}>
        {value}%
      </span>
      <span className="qxv2-tm-track">
        <span
          className="qxv2-tm-fill"
          style={{ width: `${Math.min(value, 100)}%`, background: toneColor(value) }}
        />
      </span>
    </div>
  );
};

const TrendSpark = ({ points, color }: { points: number[]; color: string }) => {
  const w = 52;
  const h = 22;
  const n = points.length;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const rg = max - min || 1;
  const x = (i: number) => i * (w / (n - 1 || 1));
  const y = (v: number) => h - 3 - ((v - min) / rg) * (h - 6);
  const pts = points.map((p, i) => [x(i), y(p)] as const);
  const line = pts.map((p) => p.join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r={2.4} fill={color} />
    </svg>
  );
};

const RankingDisplay = ({
  ranking,
  move,
}: {
  ranking?: number;
  move?: "up" | "down" | "flat";
}) => {
  if (ranking !== undefined && ranking > 0) {
    return (
      <span
        style={{
          fontSize: 12.5,
          fontWeight: 800,
          color: ranking === 1 ? "var(--qx-good-tx)" : "#475467",
        }}
      >
        #{ranking} {ranking === 1 ? "🏆" : ""}
      </span>
    );
  }
  if (!move) return <span className="qxv2-t-rank-mv flat">—</span>;
  if (move === "up") return <span className="qxv2-t-rank-mv up">▲ sube</span>;
  if (move === "down") return <span className="qxv2-t-rank-mv down">▼ baja</span>;
  return <span className="qxv2-t-rank-mv flat">— estable</span>;
};

const gridCols = {
  gridTemplateColumns: "1.5fr .9fr .9fr .9fr .7fr .8fr auto",
};

export const TeamTable: React.FC<TeamTableProps> = ({
  data = [],
  isLoading,
  highlightExecutiveId,
}) => {
  return (
    <div className="qxv2-card">
      <div className="qxv2-card-h">
        <h3>Desempeño del equipo</h3>
        <span className="qxv2-h-sub">
          {data.length} ejecutivo{data.length === 1 ? "" : "s"} · semana en curso · tendencia 6 sem.
        </span>
      </div>
      <div className="qxv2-team-rows">
        {isLoading ? (
          <div className="qxv2-h-sub" style={{ padding: "16px" }}>Cargando datos del equipo...</div>
        ) : (
          <>
            <div className="qxv2-team-head v2" style={gridCols}>
              <span>Ejecutivo</span>
              <span>Avance</span>
              <span>Contact.</span>
              <span>Compromisos</span>
              <span>Tendencia 6s</span>
              <span>Ranking</span>
              <span>Caja</span>
            </div>
            {data.map((row) => {
              const trendPoints =
                row.trend && row.trend.length > 0
                  ? row.trend
                  : MOCK_TEAM_TREND[row.executiveId]?.trend;
              const trendColor = trendPoints
                ? toneColor(trendPoints[trendPoints.length - 1])
                : "#98A2B3";

              return (
                <div
                  className="qxv2-team-row v2"
                  style={{
                    ...gridCols,
                    background:
                      row.executiveId === highlightExecutiveId
                        ? "var(--qx-blue-soft)"
                        : undefined,
                    borderRadius:
                      row.executiveId === highlightExecutiveId ? 10 : undefined,
                  }}
                  key={row.executiveId}
                >
                  <div className="qxv2-t-person">
                    <span className="qxv2-t-av">{initials(row.executiveName)}</span>
                    <span className="qxv2-t-name">{row.executiveName}</span>
                  </div>
                  <Metric value={row.progressPercent} />
                  <Metric value={row.contactPercent} />
                  <Metric value={row.commitmentsFulfilledPercent} />
                  <span className="qxv2-t-trend">
                    {trendPoints ? (
                      <TrendSpark points={trendPoints} color={trendColor} />
                    ) : (
                      "—"
                    )}
                  </span>
                  <RankingDisplay
                    ranking={row.ranking}
                    move={MOCK_TEAM_TREND[row.executiveId]?.move}
                  />
                  <span className="qxv2-t-caja">
                    {formatNumber(row.cashGenerated)}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
