import { MOCK_TODAY_STATS } from "../constants/mock-extras";

export const TodayStatsGrid: React.FC = () => {
  return (
    <div className="qxv2-today-grid">
      {MOCK_TODAY_STATS.map((s) => (
        <div className={`qxv2-today ${s.tone}`} key={s.label}>
          <div className="qxv2-td-label">{s.label}</div>
          <div className="qxv2-td-val">{s.value}</div>
          <div className="qxv2-td-sub">{s.note}</div>
        </div>
      ))}
    </div>
  );
};
