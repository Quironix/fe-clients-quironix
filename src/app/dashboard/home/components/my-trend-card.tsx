import React from "react";
import { WeeklyCashTrendItem } from "../types";
import { CardMessage, loadingOrEmpty } from "./card-message";

export interface MyTrendCardProps {
  data?: WeeklyCashTrendItem[];
  isLoading?: boolean;
}

export const MyTrendCard: React.FC<MyTrendCardProps> = ({
  data,
  isLoading,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="qxv2-card qxv2-v2-card">
        <div className="qxv2-card-h">
          <h3>Mi tendencia</h3>
        </div>
        <CardMessage>{loadingOrEmpty(isLoading)}</CardMessage>
      </div>
    );
  }

  const series = data.map((d) => d.amount);
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
  const color = "#1FA35C";

  const latestVal = series[n - 1] || 0;
  const latestFormatted =
    latestVal >= 1000000
      ? `$${(latestVal / 1000000).toFixed(1).replace(".", ",")}M`
      : `$${Math.round(latestVal).toLocaleString("es-CL")}`;

  return (
    <div className="qxv2-card qxv2-v2-card">
      <div className="qxv2-card-h">
        <h3>Mi tendencia</h3>
        <span className="qxv2-h-sub">
          Caja recuperada por semana (últimas 8)
        </span>
      </div>
      <div className="qxv2-body">
        <>
          <svg
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            style={{ width: "100%", height: 60, display: "block" }}
          >
            <polygon
              points={`0,${h} ${line} ${w},${h}`}
              fill={color}
              opacity={0.08}
            />
            <polyline
              points={line}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {pts.length > 0 && (
              <circle
                cx={pts[n - 1][0]}
                cy={pts[n - 1][1]}
                r={2.6}
                fill={color}
              />
            )}
          </svg>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              fontSize: 11,
              fontWeight: 800,
              color: "#98A2B3",
            }}
          >
            <span>hace {n} sem.</span>
            <span style={{ color: "var(--qx-good-tx)" }}>
              Esta semana: {latestFormatted}
            </span>
          </div>
        </>
      </div>
    </div>
  );
};
