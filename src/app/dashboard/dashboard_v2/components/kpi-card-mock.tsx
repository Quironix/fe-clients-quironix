import { MockKpiDef } from "../constants/mock-kpis";

const STATUS_HEX: Record<string, string> = {
  good: "#1FA35C",
  warn: "#F59E0B",
  bad: "#EF4444",
};

const ValRow = ({ k }: { k: MockKpiDef }) => (
  <div className="qxv2-k-val-row">
    <span className="qxv2-k-val">{k.value}</span>
    <span className="qxv2-k-unit">{k.unit}</span>
    <span className={`qxv2-badge ${k.badge.tone}`}>{k.badge.tx}</span>
  </div>
);

const BodyFill = ({ k, c }: { k: MockKpiDef; c: string }) => {
  const pct = Math.min(k.pct ?? 0, 100);
  return (
    <>
      <ValRow k={k} />
      <div className="qxv2-k-meta">{k.meta}</div>
      <div className="qxv2-fill-wrap">
        <div className="qxv2-fill-track">
          <div className="qxv2-fill-bar" style={{ width: `${pct}%`, background: c }} />
        </div>
        <span className="qxv2-fill-cap" style={{ color: c }}>
          {String(k.pct).replace(".", ",")}% de la meta
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
      <div className="qxv2-trend-box">
        <svg className="qxv2-trend-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <line x1={0} y1={my} x2={w} y2={my} stroke="#98A2B3" strokeWidth={1} strokeDasharray="3 3" />
          <polygon points={`0,${h} ${line} ${w},${h}`} fill={c} opacity={0.1} />
          <polyline points={line} fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          {pts.length > 0 && <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r={3} fill={c} />}
        </svg>
        <span className="qxv2-trend-lbl" style={{ top: `${(my / h) * 100}%` }}>
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
      <div className="qxv2-gauge-wrap">
        <svg viewBox="0 0 112 62" className="qxv2-gauge-svg">
          <path d="M10 52 A46 46 0 0 1 102 52" fill="none" stroke="#EFF1F7" strokeWidth={9} strokeLinecap="round" />
          <path
            d="M10 52 A46 46 0 0 1 102 52"
            fill="none"
            stroke={c}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={off}
          />
          <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="var(--qx-ink)" strokeWidth={2} />
        </svg>
        <div className="qxv2-gauge-val">
          <b style={{ color: c }}>{k.value}</b>
          <span>{k.unit}</span>
        </div>
      </div>
      <div className="qxv2-gauge-foot">
        <span className={`qxv2-badge ${k.badge.tone}`}>{k.badge.tx}</span>
        <span className="qxv2-gauge-meta">▲ {k.meta?.replace("Meta: ", "Meta ")}</span>
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
      <div className="qxv2-share-cap">
        {k.value}
        {k.unit === "%" ? "%" : ""} {k.shareLabel}
      </div>
      <div className="qxv2-share-track">
        <div className="qxv2-share-fill" style={{ width: `${val}%`, background: c }} />
        <div className="qxv2-share-mark" style={{ left: `${target}%` }} />
      </div>
      <div className="qxv2-share-scale">
        <span>0%</span>
        <span className="qxv2-share-tlbl" style={{ left: `${labelPos}%` }}>
          {k.targetLabel}
        </span>
        <span>100%</span>
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
      <div className="qxv2-k-meta">{k.meta}</div>
      <div className="qxv2-tally">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="qxv2-pip"
            style={i < done ? { background: c } : undefined}
          />
        ))}
      </div>
      <span className="qxv2-fill-cap" style={{ color: c }}>
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
  const c = STATUS_HEX[k.status];
  const Body = BODY[k.viz];

  return (
    <article className="qxv2-kpi">
      <div className="qxv2-k-head">
        <h4>{k.name}</h4>
        {k._isMock ? (
          <span
            className="qxv2-h-sub"
            style={{
              fontSize: 10.5,
              background: "var(--qx-blue-soft)",
              color: "var(--qx-blue-bright)",
              fontWeight: 800,
              padding: "3px 9px",
              borderRadius: 999,
            }}
          >
            Ilustrativo
          </span>
        ) : null}
        <span className="qxv2-k-dot" style={{ background: c }} />
      </div>
      <div className="qxv2-k-q">{k.q}</div>
      <Body k={k} c={c} />
      <div className="qxv2-k-foot">
        <span className="qxv2-k-tag">{k.tag}</span>
      </div>
    </article>
  );
};

export const KpiGridMock: React.FC<{ items: MockKpiDef[] }> = ({ items }) => (
  <div className="qxv2-kpi-grid">
    {items.map((k) => (
      <KpiCardMock key={k.name} k={k} />
    ))}
  </div>
);
