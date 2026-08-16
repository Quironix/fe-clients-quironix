import { MOCK_MY_PROGRESS } from "../constants/mock-extras";

const toneColor = (pct: number, mark: number) =>
  pct >= mark ? "#1FA35C" : pct >= mark - 12 ? "#F59E0B" : "#EF4444";

export const MyProgressCard: React.FC = () => {
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
