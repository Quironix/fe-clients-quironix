import { cn, formatNumber } from "@/lib/utils";
import { MOCK_TEAM_TREND } from "../constants/mock-extras";
import { TeamMemberRow } from "../types";
import { avatar, DashCard, DashCardHeader, subText, TONE_COLOR, track } from "./dash-card";

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
  TONE_COLOR[v < 50 ? "bad" : v < 70 ? "warn" : "good"];

const Metric = ({ value }: { value?: number }) => {
  if (value === undefined) {
    return <span className="text-[12.5px] text-gray-400">—</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12.5px] font-extrabold" style={{ color: toneColor(value) }}>
        {value}%
      </span>
      <span className={`${track} h-[5px]`}>
        <span
          className="block h-full rounded-full"
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
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block h-[22px] w-[52px]">
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
      <span className={cn("text-[12.5px] font-extrabold", ranking === 1 ? "text-good-fg" : "text-gray-600")}>
        #{ranking} {ranking === 1 ? "🏆" : ""}
      </span>
    );
  }
  if (move === "up") return <span className="text-[11px] font-black text-good-fg">▲ sube</span>;
  if (move === "down") return <span className="text-[11px] font-black text-bad-fg">▼ baja</span>;
  return <span className="text-[11px] font-black text-gray-400">{move ? "— estable" : "—"}</span>;
};

const gridCols = "grid grid-cols-[1.5fr_0.9fr_0.9fr_0.9fr_0.7fr_0.8fr_auto] items-center gap-3";

export const TeamTable: React.FC<TeamTableProps> = ({
  data = [],
  isLoading,
  highlightExecutiveId,
}) => {
  return (
    <DashCard>
      <DashCardHeader
        title="Desempeño del equipo"
        sub={`${data.length} ejecutivo${data.length === 1 ? "" : "s"} · semana en curso · tendencia 6 sem.`}
      />
      <div className="px-5 pt-1.5 pb-2.5">
        {isLoading ? (
          <div className={`${subText} p-4`}>Cargando datos del equipo...</div>
        ) : (
          <>
            <div
              className={`${gridCols} pt-2.5 pb-2 text-[10.5px] font-extrabold uppercase tracking-[0.07em] text-gray-400`}
            >
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
                : "var(--color-gray-400)";
              const highlighted = row.executiveId === highlightExecutiveId;

              return (
                <div
                  className={cn(
                    gridCols,
                    "border-t border-gray-100 py-[11px]",
                    highlighted && "rounded-lg bg-primary-soft",
                  )}
                  key={row.executiveId}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`${avatar} size-[30px] text-[11px]`}>{initials(row.executiveName)}</span>
                    <span className="truncate text-[13px] font-extrabold">{row.executiveName}</span>
                  </div>
                  <Metric value={row.progressPercent} />
                  <Metric value={row.contactPercent} />
                  <Metric value={row.commitmentsFulfilledPercent} />
                  <span className="flex items-center gap-1.5">
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
                  <span className="text-[13px] font-extrabold">
                    {formatNumber(row.cashGenerated)}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </DashCard>
  );
};
