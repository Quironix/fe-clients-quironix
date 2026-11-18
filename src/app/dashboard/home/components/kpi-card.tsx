"use client";
import { STATUS_COLORS } from "../../overview/constants/kpi-constants";
import {
  calculateKPIStatus,
  calculateKPITrend,
  getProgressPercentage,
} from "../../overview/utils/kpi-utils";
import { KPI } from "../../overview/services/types";
import { badge, kpi as k, TONE_BADGE } from "./dash-card";

interface KpiCardProps {
  kpi: KPI;
}

const shortenDefinition = (text: string, maxLen = 80) => {
  const firstSentence = text.split(/(?<=[.:])\s/)[0];
  const base = firstSentence.length <= maxLen ? firstSentence : text;
  if (base.length <= maxLen) return base;
  return `${base.slice(0, maxLen).trimEnd()}…`;
};

const toneFromColor = (color: "emerald" | "amber" | "red") =>
  color === "emerald" ? "good" : color === "amber" ? "warn" : "bad";

const hexFromColor = (color: "emerald" | "amber" | "red") =>
  color === "emerald"
    ? STATUS_COLORS.success.hex
    : color === "amber"
      ? STATUS_COLORS.warning.hex
      : STATUS_COLORS.error.hex;

const TrendSpark = ({
  points,
  metaVal,
  color,
}: {
  points: number[];
  metaVal: number;
  color: string;
}) => {
  const w = 140;
  const h = 52;
  const pad = 6;
  const n = points.length;
  const all = [...points, metaVal];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const rg = max - min || 1;
  const y = (v: number) => h - pad - ((v - min) / rg) * (h - pad * 2);
  const x = (i: number) => i * (w / (n - 1 || 1));
  const pts = points.map((p, i) => [x(i), y(p)] as const);
  const line = pts.map((p) => p.join(",")).join(" ");
  const my = y(metaVal);

  return (
    <div className={k.trendBox}>
      <svg className={k.trendSvg} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <line
          x1={0}
          y1={my}
          x2={w}
          y2={my}
          stroke="var(--color-gray-400)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <polygon points={`0,${h} ${line} ${w},${h}`} fill={color} opacity={0.1} />
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r={3} fill={color} />
      </svg>
      <span className={k.trendLbl} style={{ top: `${(my / h) * 100}%` }}>
        Meta {metaVal}
      </span>
    </div>
  );
};

export const KpiCard: React.FC<KpiCardProps> = ({ kpi }) => {
  const status = calculateKPIStatus(kpi.value, kpi.thresholds);
  const trend = calculateKPITrend(kpi);
  const progressPercentage = getProgressPercentage(
    kpi.value,
    kpi.target,
    kpi.thresholds.direction
  );
  const tone = toneFromColor(status.color);
  const color = hexFromColor(status.color);
  const history = (kpi.history || [])
    .map((h) => h.value)
    .filter((v): v is number => v !== null);

  const badgeTone = trend ? (trend.isGood ? "good" : "bad") : tone;
  const badgeArrow =
    trend?.direction === "up" ? "↑" : trend?.direction === "down" ? "↓" : "→";
  const badgeText = trend ? `${badgeArrow} ${trend.value}%` : status.label;

  return (
    <article className={k.card}>
      <div className={k.head}>
        <h4 className={k.title}>{kpi.name}</h4>
        <span className={k.dot} style={{ background: color }} />
      </div>
      {kpi.definition && (
        <div className={k.q} title={kpi.definition}>
          {shortenDefinition(kpi.definition)}
        </div>
      )}
      <div className={k.valRow}>
        <span className={k.val}>{kpi.value}</span>
        <span className={k.unit}>{kpi.unit}</span>
        <span className={`${badge} ${TONE_BADGE[badgeTone]}`}>{badgeText}</span>
      </div>
      {history.length >= 2 ? (
        <TrendSpark points={history} metaVal={kpi.target} color={color} />
      ) : (
        <div className="mt-1.5">
          <div className={k.meta}>Meta: {kpi.target}{kpi.unit}</div>
          <div className={k.fillTrack}>
            <div
              className={k.fillBar}
              style={{
                width: `${Math.min(progressPercentage, 100)}%`,
                background: color,
              }}
            />
          </div>
        </div>
      )}
      <div className={k.foot}>
        <span className={k.tag}>{kpi.type}</span>
      </div>
    </article>
  );
};
