import { MockKpiDef } from "../constants/mock-kpis";
import { QuironMiniButton } from "./ai/quiron-buttons";
import { badge, kpi as kc, kpiGrid, pill, TONE_BADGE, TONE_COLOR } from "./dash-card";

const ValRow = ({ k }: { k: MockKpiDef }) => (
  <div className={kc.valRow}>
    <span className={kc.val}>{k.value}</span>
    <span className={kc.unit}>{k.unit}</span>
    <span className={`${badge} ${TONE_BADGE[k.badge.tone]}`}>{k.badge.tx}</span>
  </div>
);

const BodyFill = ({ k, c }: { k: MockKpiDef; c: string }) => {
  const pct = Math.min(k.pct ?? 0, 100);
  return (
    <>
      <ValRow k={k} />
      <div className={kc.meta}>{k.meta}</div>
      <div className="mt-1.5">
        <div className={kc.fillTrack}>
          <div className={kc.fillBar} style={{ width: `${pct}%`, background: c }} />
        </div>
        <span className={kc.fillCap} style={{ color: c }}>
          {(k.pct ?? 0).toFixed(2).replace(".", ",")}% de la meta
        </span>
      </div>
    </>
  );
};

const BodyTrend = ({ k, c }: { k: MockKpiDef; c: string }) => {
  const points = k.trend || [];
  const metaVal = k.metaVal ?? 0;
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
    <>
      <ValRow k={k} />
      <div className={kc.trendBox}>
        <svg className={kc.trendSvg} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <line x1={0} y1={my} x2={w} y2={my} stroke="var(--color-gray-400)" strokeWidth={1} strokeDasharray="3 3" />
          <polygon points={`0,${h} ${line} ${w},${h}`} fill={c} opacity={0.1} />
          <polyline points={line} fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          {pts.length > 0 && <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r={3} fill={c} />}
        </svg>
        <span className={kc.trendLbl} style={{ top: `${(my / h) * 100}%` }}>
          {k.metaLabel}
        </span>
      </div>
    </>
  );
};

const BodyGauge = ({ k, c }: { k: MockKpiDef; c: string }) => {
  const R = 46;
  const cx = 56;
  const cy = 52;
  const C = Math.PI * R;
  const val = Math.max(0, Math.min(100, k.num ?? 0));
  const off = C * (1 - val / 100);
  const target = k.target ?? 0;
  const ang = Math.PI * (1 - target / 100);
  const tx1 = cx + Math.cos(ang) * (R - 7);
  const ty1 = cy - Math.sin(ang) * (R - 7);
  const tx2 = cx + Math.cos(ang) * (R + 7);
  const ty2 = cy - Math.sin(ang) * (R + 7);

  return (
    <>
      <div className="relative mt-2 flex justify-center">
        <svg viewBox="0 0 112 62" className="h-auto w-[150px] max-w-full">
          <path d="M10 52 A46 46 0 0 1 102 52" fill="none" stroke="var(--color-gray-100)" strokeWidth={9} strokeLinecap="round" />
          <path
            d="M10 52 A46 46 0 0 1 102 52"
            fill="none"
            stroke={c}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={off}
          />
          <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="var(--color-gray-900)" strokeWidth={2} />
        </svg>
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-center leading-none">
          <b className="text-[26px] font-black tracking-[-0.02em]" style={{ color: c }}>
            {k.value}
          </b>
          <span className="ml-0.5 text-[11px] font-extrabold text-gray-400">{k.unit}</span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className={`${badge} ${TONE_BADGE[k.badge.tone]}`}>{k.badge.tx}</span>
        <span className="ml-auto text-[11px] font-extrabold text-gray-500">
          ▲ {k.meta?.replace("Meta: ", "Meta ")}
        </span>
      </div>
    </>
  );
};

const BodyShare = ({ k, c }: { k: MockKpiDef; c: string }) => {
  const val = Math.max(0, Math.min(100, k.num ?? 0));
  const target = k.target ?? 0;
  // La marca vertical en la barra queda en la posición exacta del umbral, pero el texto
  // "Umbral X%" se separa de los extremos para que no tape las etiquetas "0%"/"100%".
  const labelPos = Math.min(88, Math.max(12, target));
  return (
    <>
      <ValRow k={k} />
      <div className="mt-1.5 text-[11.5px] font-bold text-gray-500">
        {k.value}
        {k.unit === "%" ? "%" : ""} {k.shareLabel}
      </div>
      <div className="relative mt-1.5 h-3.5 overflow-hidden rounded-sm bg-gray-100">
        <div className="absolute inset-y-0 left-0 rounded-l-sm" style={{ width: `${val}%`, background: c }} />
        <div className="absolute -top-0.5 -bottom-0.5 z-[2] w-0.5 bg-gray-900" style={{ left: `${target}%` }} />
      </div>
      <div className="relative mt-[3px] h-3.5 text-[9px] font-extrabold text-gray-400">
        <span className="absolute left-0">0%</span>
        <span className="absolute -translate-x-1/2 whitespace-nowrap text-gray-900" style={{ left: `${labelPos}%` }}>
          {k.targetLabel}
        </span>
        <span className="absolute right-0">100%</span>
      </div>
    </>
  );
};

const BodyTally = ({ k, c }: { k: MockKpiDef; c: string }) => {
  const done = k.done ?? 0;
  const total = k.total ?? 0;
  return (
    <>
      <ValRow k={k} />
      <div className={kc.meta}>{k.meta}</div>
      <div className="mt-2 flex flex-wrap gap-[3px]">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="size-[11px] rounded-[3px] bg-gray-100"
            style={i < done ? { background: c } : undefined}
          />
        ))}
      </div>
      <span className={kc.fillCap} style={{ color: c }}>
        {done} de {total} logradas hoy
      </span>
    </>
  );
};

const BODY = {
  fill: BodyFill,
  trend: BodyTrend,
  gauge: BodyGauge,
  share: BodyShare,
  tally: BodyTally,
};

export const KpiCardMock: React.FC<{ k: MockKpiDef }> = ({ k }) => {
  const c = TONE_COLOR[k.status];
  const Body = BODY[k.viz];

  return (
    <article className={kc.card}>
      <div className={kc.head}>
        <h4 className={kc.title}>{k.name}</h4>
        {k._isMock ? <span className={pill}>Ilustrativo</span> : null}
        <span className={kc.dot} style={{ background: c }} />
      </div>
      <QuironMiniButton topic={`kpi::${k.name}`} />
      <div className={kc.q}>{k.q}</div>
      <Body k={k} c={c} />
      <div className={kc.foot}>
        <span className={kc.tag}>{k.tag}</span>
      </div>
    </article>
  );
};

export const KpiGridMock: React.FC<{ items: MockKpiDef[] }> = ({ items }) => (
  <div className={kpiGrid}>
    {items.map((k) => (
      <KpiCardMock key={k.name} k={k} />
    ))}
  </div>
);
