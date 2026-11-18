"use client";
import { useState } from "react";
import { useProfileContext } from "@/context/ProfileContext";
import { cn } from "@/lib/utils";
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
import { DashCard, DashCardHeader } from "./dash-card";

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

const legendItem = "flex items-center gap-1.5 text-[11.5px] font-bold text-gray-600";
const numLabel = "text-[10.5px] font-extrabold uppercase tracking-[0.09em] text-gray-400";
const numVal = "mt-0.5 text-[30px] font-black tracking-[-0.02em]";
const insight = "mx-5 mt-3 flex flex-wrap items-center gap-3.5 rounded-lg border px-3.5 py-[11px]";
const insightText = "min-w-[220px] flex-1 text-[13px] text-gray-700";
const debtorsEmpty = "px-0.5 py-1.5 text-xs text-gray-500";

const EstimatedVsCollectedChart: React.FC<{
  period: HeroPeriod;
  chartData?: CashDeviationData["chart"];
}> = ({ period, chartData }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const d = MOCK_ESTIMATED_VS_COLLECTED[period];
  const estimated =
    chartData && chartData.estimated.length > 0
      ? chartData.estimated
      : d.estimated;
  const collected =
    chartData && chartData.collected.length > 0
      ? chartData.collected
      : d.collected;
  const labels = chartData && chartData.labels.length > 0 ? chartData.labels : [];
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
  const estColor = "var(--color-gray-400)";

  const isSurplus = collected[n - 1] >= estimated[n - 1];
  const lineColor = isSurplus ? "var(--good)" : "var(--bad)";
  const textClass = isSurplus ? "text-good-fg" : "text-bad-fg";
  const gapLabel = isSurplus ? "Superávit" : "Brecha creciente";

  const hovered = hoveredIndex;
  const tooltipLeftPct = hovered !== null ? (x(hovered) / w) * 100 : 0;
  const tooltipTopPct =
    hovered !== null
      ? (Math.min(y(estimated[hovered]), y(collected[hovered])) / h) * 100
      : 0;

  return (
    <div className="px-5 pt-1 pb-[18px]">
      <h3 className="pb-1 text-[13.5px] font-extrabold text-primary-ink">
        Proyección vs recaudado — {chartLabel}
      </h3>
      <div className="flex gap-4 pt-0.5 pb-2.5">
        <span className={legendItem}>
          <span className="h-[3px] w-2.5 rounded-[2px] bg-[repeating-linear-gradient(90deg,var(--color-gray-400)_0_3px,transparent_3px_6px)]" />
          Proyección de caja
        </span>
        <span className={legendItem}>
          <span className="h-[3px] w-2.5 rounded-[2px]" style={{ background: lineColor }} />
          Recaudado real
        </span>
        <span className={cn(legendItem, textClass)}>{gapLabel}</span>
      </div>
      <div className="relative">
        <svg
          className="block h-[120px] w-full overflow-visible"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
        >
          <polygon points={gap} fill={lineColor} opacity={0.08} />
          <polyline
            points={estLine}
            fill="none"
            stroke={estColor}
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={recLine}
            fill="none"
            stroke={lineColor}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {est.map(([px, py], i) => (
            <circle key={`est-${i}`} cx={px} cy={py} r={i === n - 1 ? 3.2 : 2.4} fill={estColor} />
          ))}
          {rec.map(([px, py], i) => (
            <circle key={`rec-${i}`} cx={px} cy={py} r={i === n - 1 ? 3.6 : 2.8} fill={lineColor} />
          ))}
          {est.map((_, i) => (
            <circle
              key={`hit-${i}`}
              cx={x(i)}
              cy={h / 2}
              r={h / 2}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex((cur) => (cur === i ? null : cur))}
            />
          ))}
        </svg>
        {hovered !== null ? (
          <div
            className="pointer-events-none absolute z-[2] -translate-x-1/2 -translate-y-[110%] whitespace-nowrap rounded-md bg-gray-800 px-2.5 py-1.5 text-[11px] font-bold text-white"
            style={{ left: `${tooltipLeftPct}%`, top: `${tooltipTopPct}%` }}
          >
            <div className="mb-0.5 opacity-80">
              {labels[hovered] ? `Semana del ${labels[hovered]}` : chartLabel}
            </div>
            <div>Estimado {fmt(estimated[hovered])}</div>
            <div>Recaudado {fmt(collected[hovered])}</div>
          </div>
        ) : null}
      </div>
      <div className="mt-1.5 flex justify-end gap-[18px] text-[11.5px] font-extrabold">
        <span className="text-gray-500">Proyección {fmt(estimated[n - 1])}</span>
        <span className={textClass}>Recaudado {fmt(collected[n - 1])}</span>
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

  const th = "border-b border-gray-200 px-1.5 py-1 text-left font-bold text-gray-500";
  const td = "border-b border-gray-100 px-1.5 py-[5px] text-gray-700";

  return (
    <div className="mx-5 mt-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5">
      {isLoading ? (
        <div className={debtorsEmpty}>Cargando deudores…</div>
      ) : !debtors || debtors.length === 0 ? (
        <div className={debtorsEmpty}>
          No hay deudores para este tramo en el período seleccionado.
        </div>
      ) : (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className={th}>Deudor</th>
              <th className={th}>Facturas</th>
              <th className={th}>Monto</th>
            </tr>
          </thead>
          <tbody className="[&>tr:last-child>td]:border-b-0">
            {debtors.map((d) => (
              <tr key={d.debtorId}>
                <td className={td}>{d.debtorName}</td>
                <td className={td}>{d.invoicesCount}</td>
                <td className={td}>{formatAmount(d.amount)}</td>
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
          color: matchingDef?.color || "var(--seg-otras)",
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
  const toggleSegment = (key: string) =>
    setExpandedSegment(expandedSegment === key ? null : key);

  return (
    <DashCard className="pb-4">
      <DashCardHeader
        title="Desviación de caja — explicada por fase"
        sub={`${rangeLabel} · ${realData ? "datos reales" : isLoading ? "cargando…" : "datos ilustrativos"}`}
      >
        <div className="ml-auto flex rounded-lg bg-gray-100 p-[3px]">
          {PERIODS.map((p) => (
            <button
              key={p}
              className={cn(
                "cursor-pointer rounded-md px-3.5 py-1.5 text-[12.5px] font-bold text-gray-600",
                p === period && "bg-white font-extrabold text-gray-900 shadow-[0_1px_3px_rgba(16,24,40,0.12)]",
              )}
              onClick={() => {
                setPeriod(p);
                setExpandedSegment(null);
              }}
            >
              {HERO_PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <QuironAiButton topic="cash-deviation" variant="ghost" size="sm" className="ml-auto" />
      </DashCardHeader>
      <div className="flex flex-wrap gap-11 px-5 pt-3.5 pb-1">
        <div>
          <div className={numLabel}>Esperado del período</div>
          <div className={numVal}>{estimatedStr}</div>
        </div>
        <div>
          <div className={numLabel}>Recaudado real</div>
          <div className={numVal}>{collectedStr}</div>
        </div>
        <div>
          <div className={numLabel}>Desviación</div>
          <div className={`${numVal} text-bad-fg`}>
            {deviationStr}
            <small className="ml-1 text-[14px] font-extrabold">{deviationPctStr}</small>
          </div>
        </div>
      </div>
      {hasNoDeviation ? (
        <div className={`${insight} border-good-bg bg-good-bg`}>
          <p className={insightText}>
            <strong className="text-good-fg">Sin brecha relevante en este período.</strong>{" "}
            Lo recaudado está en línea con lo estimado: no hay facturas vencidas en litigio,
            compromisos incumplidos, fase 1 sin gestión ni pagos sin aplicar que expliquen una diferencia.
          </p>
        </div>
      ) : (
        <>
          <div className="px-5 py-2 text-[12.5px] font-semibold italic text-gray-500">
            ¿Dónde están los {deviationStr.replace("−", "")} que faltan? — cada tramo
            se abre y muestra a los deudores que lo explican
          </div>
          <div className="mx-5 flex h-8 overflow-hidden rounded-md">
            {segments
              .filter((s) => s.pct > 0)
              .map((s) => (
                <button
                  type="button"
                  className={cn(
                    "grid min-w-0 cursor-pointer place-items-center text-[11.5px] font-extrabold text-white transition-[filter] hover:brightness-112",
                    expandedSegment === s.key && "outline-2 -outline-offset-2 outline-slate-800",
                  )}
                  key={s.key}
                  style={{ width: `${Math.max(s.pct, 1)}%`, background: s.color }}
                  title={`${s.label} · ${s.amountStr}`}
                  onClick={() => toggleSegment(s.key)}
                >
                  {s.pct > 8 ? (
                    <span className="overflow-hidden whitespace-nowrap px-1.5">{s.amountStr}</span>
                  ) : null}
                </button>
              ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 pt-2.5">
            {segments.map((s) => (
              <button
                type="button"
                className={cn(
                  legendItem,
                  "cursor-pointer rounded-sm px-1 py-0.5 hover:bg-gray-100",
                  expandedSegment === s.key && "bg-primary-soft",
                  s.pct === 0 && "opacity-55",
                )}
                key={s.key}
                onClick={() => toggleSegment(s.key)}
              >
                <span className="size-2 flex-none rounded-[3px]" style={{ background: s.color }} />
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
          <div className={`${insight} border-gray-100 bg-gray-50`}>
            <p className={insightText}>
              Tramo mayor:{" "}
              <strong className="text-gray-900">
                {insightLabel} — {insightAmountStr} en {insightDebtors} deudores
              </strong>
              . Esa caja no se cobra insistiendo: se cobra resolviendo la causa raíz.
            </p>
            <button className="cursor-pointer whitespace-nowrap rounded-md bg-brand-orange px-[15px] py-[9px] text-[13px] font-extrabold text-white shadow-[0_2px_6px_rgba(242,115,19,0.35)] transition-colors hover:bg-brand-orange-dark">
              Enviar a gestión →
            </button>
          </div>
        </>
      )}
      <EstimatedVsCollectedChart period={period} chartData={realData?.chart} />
    </DashCard>
  );
};
