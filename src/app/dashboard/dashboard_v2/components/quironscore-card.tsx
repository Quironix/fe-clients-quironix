const MOCK_SCORE = 78;
const MOCK_DELTA = "+3 pts vs semana anterior";
const MOCK_BAND = "Cartera en rango saludable";

const MOCK_COMPONENTS = [
  { label: "Puntualidad de pago", value: 82 },
  { label: "Contactabilidad", value: 71 },
  { label: "Cumplimiento de compromisos", value: 75 },
  { label: "Normalización de litigios", value: 84 },
];

const MOCK_HISTORY = [64, 67, 69, 70, 71, 73, 75, 76, 78];

const toneColor = (v: number) =>
  v < 50 ? "#EF4444" : v < 70 ? "#F59E0B" : "#1FA35C";

const HistorySpark = ({ points }: { points: number[] }) => {
  const w = 260;
  const h = 44;
  const pad = 4;
  const n = points.length;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const rg = max - min || 1;
  const x = (i: number) => i * (w / (n - 1 || 1));
  const y = (v: number) => h - pad - ((v - min) / rg) * (h - pad * 2);
  const pts = points.map((p, i) => [x(i), y(p)] as const);
  const line = pts.map((p) => p.join(",")).join(" ");
  const color = "#F59E0B";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={`0,${h} ${line} ${w},${h}`} fill={color} opacity={0.08} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r={2.6} fill={color} />
    </svg>
  );
};

export const QuironscoreCard: React.FC = () => {
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (MOCK_SCORE / 100) * circumference;
  const last = MOCK_HISTORY[MOCK_HISTORY.length - 1];
  const first = MOCK_HISTORY[0];

  return (
    <div className="qxv2-card qxv2-score">
      <div className="qxv2-card-h">
        <h3>Quironscore</h3>
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
          En validación
        </span>
      </div>
      <div className="qxv2-sc-top">
        <div className="qxv2-donut">
          <svg viewBox="0 0 112 112">
            <circle cx="56" cy="56" r="48" fill="none" stroke="#EFF1F7" strokeWidth="10" />
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 56 56)"
            />
          </svg>
          <div className="qxv2-d-val">
            <div>
              <b>{MOCK_SCORE}</b>
              <i>DE 100</i>
            </div>
          </div>
        </div>
        <div className="qxv2-sc-side">
          <span className="qxv2-band">{MOCK_BAND}</span>
          <div className="qxv2-delta" style={{ color: "var(--qx-good-tx)" }}>
            ▲ {MOCK_DELTA}
          </div>
          <div className="qxv2-scale">0–40 crítico · 40–70 presión · 70–100 saludable</div>
        </div>
      </div>
      <div className="qxv2-sc-comps">
        {MOCK_COMPONENTS.map((c) => (
          <div className="qxv2-sc-comp" key={c.label}>
            <span className="qxv2-c-name">{c.label}</span>
            <span className="qxv2-c-track">
              <span
                className="qxv2-c-fill"
                style={{ width: `${c.value}%`, background: toneColor(c.value) }}
              />
            </span>
            <span className="qxv2-c-val" style={{ color: toneColor(c.value) }}>
              {c.value}
            </span>
          </div>
        ))}
      </div>
      <div className="qxv2-sc-hist">
        <div className="qxv2-sh-top">
          <span className="qxv2-sh-lbl">Evolución · últimas 9 semanas</span>
          <span className="qxv2-sh-trend" style={{ color: "var(--qx-good-tx)" }}>
            ▲ {last - first} pts
          </span>
        </div>
        <HistorySpark points={MOCK_HISTORY} />
      </div>
      <div className="qxv2-sc-note">
        Evolución del Health Score · la fórmula final se validará en la siguiente etapa.
      </div>
    </div>
  );
};
