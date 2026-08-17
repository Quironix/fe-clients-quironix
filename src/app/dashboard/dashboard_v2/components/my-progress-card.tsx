import { MOCK_MY_PROGRESS } from "../constants/mock-extras";
import { GoalMetric } from "../types";

const toneColor = (pct: number, mark: number) =>
  pct >= mark ? "#1FA35C" : pct >= mark - 12 ? "#F59E0B" : "#EF4444";

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

export const MyProgressCard: React.FC<MyProgressCardProps> = ({
  dailyGoal,
  weeklyGoal,
  monthlyGoal,
  isLoading,
}) => {
  const hasRealData = !!(dailyGoal || weeklyGoal || monthlyGoal);

  if (isLoading && !hasRealData) {
    return (
      <div className="qxv2-card qxv2-v2-card">
        <div className="qxv2-card-h">
          <h3>Mi progreso</h3>
          <span className="qxv2-h-sub">Cargando…</span>
        </div>
        <div className="qxv2-body" />
      </div>
    );
  }

  if (hasRealData) {
    const rows: { label: string; goal?: GoalMetric }[] = [
      { label: "Meta de hoy", goal: dailyGoal },
      { label: "Mi semana", goal: weeklyGoal },
      { label: "Mi mes", goal: monthlyGoal },
    ];

    return (
      <div className="qxv2-card qxv2-v2-card">
        <div className="qxv2-card-h">
          <h3>Mi progreso</h3>
          <span className="qxv2-h-sub">Hoy · semana · mes</span>
        </div>
        <div className="qxv2-body">
          {rows.map((r) => {
            const pct = r.goal ? Math.min(100, Math.round(r.goal.percentage)) : 0;
            const valueLabel = r.goal
              ? `${formatAmount(r.goal.current_amount)} / ${formatAmount(r.goal.target_amount)}`
              : "—";
            const color = toneColor(pct, 70);
            return (
              <div className="qxv2-prog-row" key={r.label}>
                <div className="qxv2-prog-top">
                  <span className="qxv2-pr-nm">{r.label}</span>
                  <span className="qxv2-pr-vl">{valueLabel}</span>
                </div>
                <div className="qxv2-prog-track">
                  <span
                    className="qxv2-pr-fill"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <span className="qxv2-prog-sub">
                  {r.goal ? `${pct}% de la meta` : "Sin dato"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="qxv2-card qxv2-v2-card">
      <div className="qxv2-card-h">
        <h3>Mi progreso</h3>
        <span className="qxv2-h-sub">Hoy · semana · mes · datos ilustrativos</span>
      </div>
      <div className="qxv2-body">
        {MOCK_MY_PROGRESS.map((p) => {
          const color = toneColor(p.pct, p.mark);
          return (
            <div className="qxv2-prog-row" key={p.label}>
              <div className="qxv2-prog-top">
                <span className="qxv2-pr-nm">{p.label}</span>
                <span className="qxv2-pr-vl">{p.valueLabel}</span>
              </div>
              <div className="qxv2-prog-track">
                <span className="qxv2-pr-fill" style={{ width: `${p.pct}%`, background: color }} />
                <span className="qxv2-pr-mark" style={{ left: `${p.mark}%` }} />
              </div>
              <span className="qxv2-prog-sub">{p.note}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
