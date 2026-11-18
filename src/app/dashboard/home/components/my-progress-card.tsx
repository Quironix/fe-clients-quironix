import { MOCK_MY_PROGRESS } from "../constants/mock-extras";
import { GoalMetric } from "../types";
import { cardBody, DashCard, DashCardHeader, TONE_COLOR } from "./dash-card";

const toneColor = (pct: number, mark: number) =>
  TONE_COLOR[pct >= mark ? "good" : pct >= mark - 12 ? "warn" : "bad"];

const formatAmount = (amount: number) =>
  Math.abs(amount) >= 1000000
    ? `$${(amount / 1000000).toFixed(1)}M`
    : `$${Math.round(amount / 1000)}K`;

export interface MyProgressCardProps {
  dailyGoal?: GoalMetric;
  weeklyGoal?: GoalMetric;
  monthlyGoal?: GoalMetric;
  isLoading?: boolean;
}

const ProgressRow = ({
  label,
  value,
  pct,
  color,
  mark,
  note,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
  mark?: number;
  note: string;
}) => (
  <div className="mb-[15px] flex flex-col gap-[5px] last:mb-0">
    <div className="flex items-baseline justify-between">
      <span className="text-[12.5px] font-extrabold text-gray-600">{label}</span>
      <span className="text-[12.5px] font-black">{value}</span>
    </div>
    <div className="relative h-2.5 overflow-hidden rounded-full bg-gray-100">
      <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      {mark !== undefined && (
        <span className="absolute -top-[3px] -bottom-[3px] w-0.5 bg-gray-900" style={{ left: `${mark}%` }} />
      )}
    </div>
    <span className="text-[11px] font-bold text-gray-400">{note}</span>
  </div>
);

export const MyProgressCard: React.FC<MyProgressCardProps> = ({
  dailyGoal,
  weeklyGoal,
  monthlyGoal,
  isLoading,
}) => {
  const hasRealData = !!(dailyGoal || weeklyGoal || monthlyGoal);

  if (isLoading && !hasRealData) {
    return (
      <DashCard>
        <DashCardHeader title="Mi progreso" sub="Cargando…" />
        <div className={cardBody} />
      </DashCard>
    );
  }

  if (hasRealData) {
    const rows: { label: string; goal?: GoalMetric }[] = [
      { label: "Meta de hoy", goal: dailyGoal },
      { label: "Mi semana", goal: weeklyGoal },
      { label: "Mi mes", goal: monthlyGoal },
    ];

    return (
      <DashCard>
        <DashCardHeader title="Mi progreso" sub="Hoy · semana · mes" />
        <div className={cardBody}>
          {rows.map((r) => {
            const pct = r.goal ? Math.min(100, Math.round(r.goal.percentage)) : 0;
            return (
              <ProgressRow
                key={r.label}
                label={r.label}
                value={
                  r.goal
                    ? `${formatAmount(r.goal.current_amount)} / ${formatAmount(r.goal.target_amount)}`
                    : "—"
                }
                pct={pct}
                color={toneColor(pct, 70)}
                note={r.goal ? `${pct}% de la meta` : "Sin dato"}
              />
            );
          })}
        </div>
      </DashCard>
    );
  }

  return (
    <DashCard>
      <DashCardHeader title="Mi progreso" sub="Hoy · semana · mes · datos ilustrativos" />
      <div className={cardBody}>
        {MOCK_MY_PROGRESS.map((p) => (
          <ProgressRow
            key={p.label}
            label={p.label}
            value={p.valueLabel}
            pct={p.pct}
            color={toneColor(p.pct, p.mark)}
            mark={p.mark}
            note={p.note}
          />
        ))}
      </div>
    </DashCard>
  );
};
