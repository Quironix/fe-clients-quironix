import { MOCK_EXECUTIVE_SUMMARY } from "../constants/mock-extras";

export const ExecutiveSummaryCard: React.FC = () => {
  const s = MOCK_EXECUTIVE_SUMMARY;

  return (
    <div className="qxv2-card qxv2-summary">
      <div className="qxv2-sm-label">Resumen ejecutivo · Quirón</div>
      <p>{s.text}</p>
      <div className="qxv2-sm-acts-title">Acciones recomendadas</div>
      <div className="qxv2-q-actions">
        {s.actions.map((a) => (
          <div className="qxv2-q-action" key={a.label}>
            <span className="qxv2-qa-tx">{a.label}</span>
            {a.amount && <span className="qxv2-qa-amt">{a.amount}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
