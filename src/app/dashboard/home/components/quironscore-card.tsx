import { QuironAiButton } from "./ai/quiron-buttons";
import { DashCard, DashCardHeader, eyebrow, pill, TONE_COLOR, track } from "./dash-card";

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
  TONE_COLOR[v < 50 ? "bad" : v < 70 ? "warn" : "good"];

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
  const color = TONE_COLOR.warn;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block h-11 w-full">
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
    <DashCard>
      <DashCardHeader title="Quironscore">
        <span className={pill}>En validación</span>
        <QuironAiButton topic="quironscore" variant="ghost" size="sm" className="ml-auto" />
      </DashCardHeader>
      <div className="flex items-center gap-4 px-5 pt-3.5 pb-1.5">
        <div className="relative size-[112px] flex-none">
          <svg viewBox="0 0 112 112">
            <circle cx="56" cy="56" r="48" fill="none" stroke="var(--color-gray-100)" strokeWidth="10" />
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke={TONE_COLOR.warn}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 56 56)"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div>
              <b className="block text-center text-[27px] font-black tracking-[-0.02em]">{MOCK_SCORE}</b>
              <i className="block text-center text-[10px] font-extrabold not-italic tracking-[0.06em] text-gray-400">
                DE 100
              </i>
            </div>
          </div>
        </div>
        <div>
          <span className="inline-block rounded-full bg-warn-bg px-2.5 py-1 text-[11.5px] font-extrabold text-warn-fg">
            {MOCK_BAND}
          </span>
          <div className="mt-[7px] text-xs font-extrabold text-good-fg">▲ {MOCK_DELTA}</div>
          <div className="mt-1.5 text-[11px] font-semibold text-gray-400">
            0–40 crítico · 40–70 presión · 70–100 saludable
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-5 pt-2">
        {MOCK_COMPONENTS.map((c) => (
          <div className="grid grid-cols-[1fr_90px_28px] items-center gap-2.5" key={c.label}>
            <span className="text-xs font-bold text-gray-600">{c.label}</span>
            <span className={`${track} h-1.5`}>
              <span
                className="block h-full rounded-full"
                style={{ width: `${c.value}%`, background: toneColor(c.value) }}
              />
            </span>
            <span className="text-right text-xs font-extrabold" style={{ color: toneColor(c.value) }}>
              {c.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mx-5 mt-3 border-t border-gray-100 pt-3">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className={eyebrow}>Evolución · últimas 9 semanas</span>
          <span className="text-[11px] font-extrabold text-good-fg">▲ {last - first} pts</span>
        </div>
        <HistorySpark points={MOCK_HISTORY} />
      </div>
      <div className="px-5 pt-3 text-[11px] font-semibold italic text-gray-400">
        Evolución del Health Score · la fórmula final se validará en la siguiente etapa.
      </div>
    </DashCard>
  );
};
