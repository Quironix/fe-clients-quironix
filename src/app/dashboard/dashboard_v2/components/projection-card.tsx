import { MOCK_PROJECTION } from "../constants/mock-extras";

export const ProjectionCard: React.FC = () => {
  const p = MOCK_PROJECTION;

  return (
    <div className="qxv2-card qxv2-v2-card">
      <div className="qxv2-card-h">
        <h3>Proyección — si se resuelven los litigios</h3>
        <span className="qxv2-h-sub">Escenario simulado · datos ilustrativos</span>
      </div>
      <div className="qxv2-body">
        <div className="qxv2-proj">
          <div className="qxv2-p-col qxv2-proj-col-bad">
            <div className="qxv2-p-lbl">{p.currentLabel}</div>
            <div className="qxv2-p-num">{p.currentValue}</div>
          </div>
          <div className="qxv2-p-arrow">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" />
            </svg>
          </div>
          <div className="qxv2-p-col qxv2-proj-col-good">
            <div className="qxv2-p-lbl">{p.projectedLabel}</div>
            <div className="qxv2-p-num">{p.projectedValue}</div>
          </div>
          <div className="qxv2-p-col">
            <div className="qxv2-p-lbl">{p.targetLabel}</div>
            <div className="qxv2-p-num" style={{ color: "#98A2B3" }}>
              {p.targetValue}
            </div>
          </div>
        </div>
        <div className="qxv2-proj-note">{p.note}</div>
      </div>
    </div>
  );
};
