"use client";
import { useState } from "react";
import { useProfileContext } from "@/context/ProfileContext";
import {
  HERO_CASH_DEVIATION_SEGMENTS,
  HERO_PERIOD_LABELS,
  HeroPeriod,
  MOCK_ESTIMATED_VS_COLLECTED,
  MOCK_HERO_CASH_DEVIATION,
} from "../constants/mock-extras";
import {
  useCashDeviationByPhase,
  useCashDeviationSegmentDebtors,
} from "../hooks/useDashboardAggregates";
import { CashDeviationData } from "../types";
import { QuironAiButton } from "./ai/quiron-buttons";

const PERIODS: HeroPeriod[] = ["dia", "semana", "mes"];

const formatAmount = (amount: number): string => {
  if (amount >= 1_000_000) {
    const m = (amount / 1_000_000).toFixed(1).replace(".", ",");
    return `$${m}M`;
  }
  if (amount >= 1_000) {
    const k = (amount / 1_000).toFixed(0);
    return `$${k}k`;
  }
  return `$${Math.round(amount).toLocaleString("es-CL")}`;
};

const EstimatedVsCollectedChart: React.FC<{
  period: HeroPeriod;
  chartData?: CashDeviationData["chart"];
}> = ({ period, chartData }) => {
  const d = MOCK_ESTIMATED_VS_COLLECTED[period];
  const estimated =
    chartData && chartData.estimated.length > 0
      ? chartData.estimated
      : d.estimated;
  const collected =
    chartData && chartData.collected.length > 0
      ? chartData.collected
      : d.collected;
  const chartLabel = chartData?.label || d.label;

  const w = 680;
  const h = 120;
  const pad = 8;
  const n = estimated.length;
  const all = [...estimated, ...collected];
  const min = Math.min(...all) * 0.92;
  const max = Math.max(...all) * 1.02;
  const rg = max - min || 1;
  const x = (i: number) => pad + i * ((w - pad * 2) / (n - 1 || 1));
  const y = (v: number) => h - pad - ((v - min) / rg) * (h - pad * 2);
  const est = estimated.map((v, i) => [x(i), y(v)] as const);
  const rec = collected.map((v, i) => [x(i), y(v)] as const);
  const estLine = est.map((p) => p.join(",")).join(" ");
  const recLine = rec.map((p) => p.join(",")).join(" ");
  const gap = `${estLine} ${rec
    .slice()
    .reverse()
    .map((p) => p.join(","))
    .join(" ")}`;
  const fmt = (v: number) => formatAmount(v);

  return (
    <div className="qxv2-body" style={{ paddingTop: 4 }}>
      <div className="qxv2-card-h" style={{ padding: "0 0 4px" }}>
        <h3 style={{ fontSize: 13.5 }}>Estimado vs recaudado — {chartLabel}</h3>
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
        <span style={{ color: "#667085" }}>Estimado {fmt(estimated[n - 1])}</span>
        <span style={{ color: "var(--qx-bad-tx)" }}>Recaudado {fmt(collected[n - 1])}</span>
      </div>
    </div>
  );
};

const SegmentDebtorsPanel: React.FC<{
  clientId: string;
  accessToken: string;
  segment: string;
  period: HeroPeriod;
}> = ({ clientId, accessToken, segment, period }) => {
  const { data: debtors, isLoading } = useCashDeviationSegmentDebtors({
    accessToken,
    clientId,
    segment,
    period,
    enabled: !!accessToken && !!clientId,
  });

  return (
    <div className="qxv2-seg-debtors">
      {isLoading ? (
        <div className="qxv2-seg-debtors-empty">Cargando deudores…</div>
      ) : !debtors || debtors.length === 0 ? (
        <div className="qxv2-seg-debtors-empty">
          No hay deudores para este tramo en el período seleccionado.
        </div>
      ) : (
        <table className="qxv2-seg-debtors-table">
          <thead>
            <tr>
              <th>Deudor</th>
              <th>Facturas</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {debtors.map((d) => (
              <tr key={d.debtorId}>
                <td>{d.debtorName}</td>
                <td>{d.invoicesCount}</td>
                <td>{formatAmount(d.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export const HeroCashDeviationCard: React.FC = () => {
  const [period, setPeriod] = useState<HeroPeriod>("semana");
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
  const { session, profile } = useProfileContext();

  const { data: realData, isLoading } = useCashDeviationByPhase({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    period,
    enabled: !!session?.token && !!profile?.client?.id,
  });

  const mock = MOCK_HERO_CASH_DEVIATION[period];

  const estimatedStr = realData
    ? formatAmount(realData.estimatedAmount)
    : mock.estimated;
  const collectedStr = realData
    ? formatAmount(realData.collectedAmount)
    : mock.collected;
  const deviationStr = realData
    ? `−${formatAmount(realData.deviationAmount)}`
    : mock.deviation;
  const deviationPctStr = realData
    ? `(−${realData.deviationPct}%)`
    : mock.deviationPct;
  const rangeLabel = realData?.rangeLabel || mock.range;

  const segments = realData
    ? realData.segments.map((s) => {
        const matchingDef = HERO_CASH_DEVIATION_SEGMENTS.find((d) => d.key === s.key);
        return {
          key: s.key,
          label: s.label,
          color: matchingDef?.color || "#94A3B8",
          pct: s.pct,
          amountStr: formatAmount(s.amount),
        };
      })
    : HERO_CASH_DEVIATION_SEGMENTS.map((s, i) => ({
        ...s,
        amountStr: mock.segAmounts[i] || "",
      }));

  const insightLabel = realData
    ? realData.insight?.topSegmentLabel || "—"
    : "Fase 1 vencida sin gestión";
  const insightAmountStr = realData
    ? formatAmount(realData.insight?.topSegmentAmount || 0)
    : mock.insightAmount;
  const insightDebtors = realData
    ? realData.insight?.topSegmentDebtorsCount ?? 0
    : 3;

  const hasNoDeviation = !!realData && realData.deviationAmount <= 0;

  return (
    <div className="qxv2-card qxv2-hero">
      <div className="qxv2-card-h">
        <h3>Desviación de caja — explicada por fase</h3>
        <span className="qxv2-h-sub">
          {rangeLabel} · {realData ? "datos reales" : isLoading ? "cargando…" : "datos ilustrativos"}
        </span>
        <div className="qxv2-seg">
          {PERIODS.map((p) => (
            <button
              key={p}
              className={p === period ? "on" : ""}
              onClick={() => {
                setPeriod(p);
                setExpandedSegment(null);
              }}
            >
              {HERO_PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <QuironAiButton
          topic="cash-deviation"
          variant="ghost"
          size="sm"
          style={{ marginLeft: "auto" }}
        />
      </div>
      <div className="qxv2-nums">
        <div className="qxv2-num">
          <div className="qxv2-n-label">Estimado de caja</div>
          <div className="qxv2-n-val">{estimatedStr}</div>
        </div>
        <div className="qxv2-num">
          <div className="qxv2-n-label">Recaudado real</div>
          <div className="qxv2-n-val">{collectedStr}</div>
        </div>
        <div className="qxv2-num neg">
          <div className="qxv2-n-label">Desviación</div>
          <div className="qxv2-n-val">
            {deviationStr}
            <small>{deviationPctStr}</small>
          </div>
        </div>
      </div>
      {hasNoDeviation ? (
        <div className="qxv2-insight" style={{ background: "var(--qx-good-bg)", borderColor: "var(--qx-good-bg)" }}>
          <p>
            <strong style={{ color: "var(--qx-good-tx)" }}>Sin brecha relevante en este período.</strong>{" "}
            Lo recaudado está en línea con lo estimado: no hay facturas vencidas en litigio,
            compromisos incumplidos, fase 1 sin gestión ni pagos sin aplicar que expliquen una diferencia.
          </p>
        </div>
      ) : (
        <>
          <div className="qxv2-q-line">
            ¿Dónde están los {deviationStr.replace("−", "")} que faltan? — cada tramo
            se abre y muestra a los deudores que lo explican
          </div>
          <div className="qxv2-stack">
            {segments
              .filter((s) => s.pct > 0)
              .map((s) => (
                <button
                  type="button"
                  className={`qxv2-segb${expandedSegment === s.key ? " qxv2-segb-active" : ""}`}
                  key={s.key}
                  style={{ width: `${Math.max(s.pct, 1)}%`, background: s.color }}
                  title={`${s.label} · ${s.amountStr}`}
                  onClick={() =>
                    setExpandedSegment(expandedSegment === s.key ? null : s.key)
                  }
                >
                  {s.pct > 8 ? <span>{s.amountStr}</span> : null}
                </button>
              ))}
          </div>
          <div className="qxv2-legend">
            {segments.map((s) => (
              <button
                type="button"
                className={`qxv2-lg qxv2-lg-btn${expandedSegment === s.key ? " qxv2-lg-active" : ""}${s.pct === 0 ? " qxv2-lg-empty" : ""}`}
                key={s.key}
                onClick={() =>
                  setExpandedSegment(expandedSegment === s.key ? null : s.key)
                }
              >
                <span className="qxv2-dot" style={{ background: s.color }} />
                {s.label} · {s.amountStr}
              </button>
            ))}
          </div>
          {expandedSegment ? (
            <SegmentDebtorsPanel
              clientId={profile?.client?.id || ""}
              accessToken={session?.token || ""}
              segment={expandedSegment}
              period={period}
            />
          ) : null}
          <div className="qxv2-insight">
            <p>
              Tramo mayor: <strong>{insightLabel} — {insightAmountStr} en {insightDebtors} deudores</strong>.
              Esa caja no se cobra insistiendo: se cobra resolviendo la causa raíz.
            </p>
            <button className="qxv2-btn-orange">Enviar a gestión →</button>
          </div>
        </>
      )}
      <EstimatedVsCollectedChart period={period} chartData={realData?.chart} />
    </div>
  );
};
