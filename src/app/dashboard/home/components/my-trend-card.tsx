import React from "react";
import { MOCK_MY_TREND } from "../constants/mock-extras";
import { WeeklyCashTrendItem } from "../types";
import { cardBody, DashCard, DashCardHeader } from "./dash-card";

export interface MyTrendCardProps {
  data?: WeeklyCashTrendItem[];
  isLoading?: boolean;
}

export const MyTrendCard: React.FC<MyTrendCardProps> = ({
  data,
  isLoading,
}) => {
  const hasRealData = data && data.length > 0;
  const series = hasRealData ? data.map((d) => d.amount) : MOCK_MY_TREND.series;
  const w = 620;
  const h = 60;
  const pad = 4;
  const n = series.length;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const rg = max - min || 1;
  const x = (i: number) => i * (w / (n - 1 || 1));
  const y = (v: number) => h - pad - ((v - min) / rg) * (h - pad * 2);
  const pts = series.map((v, i) => [x(i), y(v)] as const);
  const line = pts.map((p) => p.join(",")).join(" ");
  const color = "var(--good)";

  const latestVal = series[n - 1] || 0;
  const latestFormatted =
    latestVal >= 1000000
      ? `$${(latestVal / 1000000).toFixed(1).replace(".", ",")}M`
      : `$${Math.round(latestVal).toLocaleString("es-CL")}`;

  return (
    <DashCard>
      <DashCardHeader
        title="Mi tendencia"
        sub={
          hasRealData
            ? "Caja recuperada por semana (últimas 8)"
            : `${MOCK_MY_TREND.label} · datos ilustrativos`
        }
      />
      <div className={cardBody}>
        {isLoading ? (
          <div className="p-4 text-[13px] text-gray-500">Cargando tendencia...</div>
        ) : (
          <>
            <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block h-[60px] w-full">
              <polygon points={`0,${h} ${line} ${w},${h}`} fill={color} opacity={0.08} />
              <polyline
                points={line}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pts.length > 0 && (
                <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r={2.6} fill={color} />
              )}
            </svg>
            <div className="mt-1.5 flex justify-between text-[11px] font-extrabold text-gray-400">
              <span>hace {n} sem.</span>
              <span className="text-good-fg">Esta semana: {latestFormatted}</span>
            </div>
          </>
        )}
      </div>
    </DashCard>
  );
};
