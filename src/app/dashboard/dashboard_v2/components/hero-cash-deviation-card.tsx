"use client";
import { useState } from "react";
import {
  HERO_CASH_DEVIATION_SEGMENTS,
  HERO_PERIOD_LABELS,
  HeroPeriod,
  MOCK_ESTIMATED_VS_COLLECTED,
  MOCK_HERO_CASH_DEVIATION,
} from "../constants/mock-extras";

const PERIODS: HeroPeriod[] = ["dia", "semana", "mes"];

const EstimatedVsCollectedChart: React.FC<{ period: HeroPeriod }> = ({ period }) => {
  const d = MOCK_ESTIMATED_VS_COLLECTED[period];
  const w = 680;
  const h = 120;
  const pad = 8;
  const n = d.estimated.length;
  const all = [...d.estimated, ...d.collected];
  const min = Math.min(...all) * 0.92;
  const max = Math.max(...all) * 1.02;
  const rg = max - min || 1;
  const x = (i: number) => pad + i * ((w - pad * 2) / (n - 1 || 1));
  const y = (v: number) => h - pad - ((v - min) / rg) * (h - pad * 2);
  const est = d.estimated.map((v, i) => [x(i), y(v)] as const);
  const rec = d.collected.map((v, i) => [x(i), y(v)] as const);
  const estLine = est.map((p) => p.join(",")).join(" ");
  const recLine = rec.map((p) => p.join(",")).join(" ");
  const gap = `${estLine} ${rec
    .slice()
    .reverse()
    .map((p) => p.join(","))
    .join(" ")}`;
  const fmt = (v: number) => `$${String(v).replace(".", ",")}${d.unit}`;

  return (
    <div className="qxv2-body" style={{ paddingTop: 4 }}>
      <div className="qxv2-card-h" style={{ padding: "0 0 4px" }}>
        <h3 style={{ fontSize: 13.5 }}>Estimado vs recaudado — {d.label}</h3>
      </div>
      <div className="qxv2-mline-legend">
        <span className="qxv2-lg">
          <span className="qxv2-dot dash" />
          Estimado de caja
        </span>
        <span className="qxv2-lg">
          <span className="qxv2-dot" style={{ background: "var(--qx-bad)" }} />
          Recaudado real
        </span>
        <span className="qxv2-lg" style={{ color: "var(--qx-bad-tx)" }}>
          Brecha creciente
        </span>
      </div>
      <div className="qxv2-mline-wrap">
        <svg
          className="qxv2-mline-svg"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
        >
          <polygon points={gap} fill="var(--qx-bad)" opacity={0.08} />
          <polyline
            points={estLine}
            fill="none"
            stroke="#98A2B3"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={recLine}
            fill="none"
            stroke="var(--qx-bad)"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={est[n - 1][0]} cy={est[n - 1][1]} r={3.2} fill="#98A2B3" />
          <circle cx={rec[n - 1][0]} cy={rec[n - 1][1]} r={3.6} fill="var(--qx-bad)" />
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 18, marginTop: 6, fontSize: 11.5, fontWeight: 800 }}>
        <span style={{ color: "#667085" }}>Estimado {fmt(d.estimated[n - 1])}</span>
        <span style={{ color: "var(--qx-bad-tx)" }}>Recaudado {fmt(d.collected[n - 1])}</span>
      </div>
    </div>
  );
};

export const HeroCashDeviationCard: React.FC = () => {
  const [period, setPeriod] = useState<HeroPeriod>("semana");
  const d = MOCK_HERO_CASH_DEVIATION[period];

  return (
    <div className="qxv2-card qxv2-hero">
      <div className="qxv2-card-h">
        <h3>Desviación de caja — explicada por fase</h3>
        <span className="qxv2-h-sub">{d.range} · datos ilustrativos</span>
        <div className="qxv2-seg">
          {PERIODS.map((p) => (
            <button
              key={p}
              className={p === period ? "on" : ""}
              onClick={() => setPeriod(p)}
            >
              {HERO_PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>
      <div className="qxv2-nums">
        <div className="qxv2-num">
          <div className="qxv2-n-label">Estimado de caja</div>
          <div className="qxv2-n-val">{d.estimated}</div>
        </div>
        <div className="qxv2-num">
          <div className="qxv2-n-label">Recaudado real</div>
          <div className="qxv2-n-val">{d.collected}</div>
        </div>
        <div className="qxv2-num neg">
          <div className="qxv2-n-label">Desviación</div>
          <div className="qxv2-n-val">
            {d.deviation}
            <small>{d.deviationPct}</small>
          </div>
        </div>
      </div>
      <div className="qxv2-q-line">
        ¿Dónde están los {d.deviation.replace("−", "")} que faltan? — cada tramo
        se abre y muestra a los deudores que lo explican
      </div>
      <div className="qxv2-stack">
        {HERO_CASH_DEVIATION_SEGMENTS.map((s, i) => (
          <div
            className="qxv2-segb"
            key={s.key}
            style={{ width: `${s.pct}%`, background: s.color }}
            title={`${s.label} · ${d.segAmounts[i]}`}
          >
            {s.pct > 8 ? <span>{d.segAmounts[i]}</span> : null}
          </div>
        ))}
      </div>
      <div className="qxv2-legend">
        {HERO_CASH_DEVIATION_SEGMENTS.map((s, i) => (
          <span className="qxv2-lg" key={s.key}>
            <span className="qxv2-dot" style={{ background: s.color }} />
            {s.label} · {d.segAmounts[i]}
          </span>
        ))}
      </div>
      <div className="qxv2-insight">
        <p>
          Tramo mayor: <strong>Litigio sin resolver — {d.insightAmount} en 4 deudores</strong>.
          Esa caja no se cobra insistiendo: se cobra resolviendo la disputa.
        </p>
        <button className="qxv2-btn-orange">Enviar a gestión →</button>
      </div>
      <EstimatedVsCollectedChart period={period} />
    </div>
  );
};
