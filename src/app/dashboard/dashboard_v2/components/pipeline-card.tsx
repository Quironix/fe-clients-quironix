import { MOCK_PIPELINE } from "../constants/mock-extras";

export const PipelineCard: React.FC = () => {
  return (
    <div className="qxv2-card">
      <div className="qxv2-card-h">
        <h3>Lo que viene — próximos vencimientos</h3>
        <span className="qxv2-h-sub">
          Anticípate: compromisos futuros · datos ilustrativos
        </span>
      </div>
      {MOCK_PIPELINE.map((day) => (
        <div className="qxv2-pipe-day" key={day.when}>
          <div className="qxv2-pd-h">
            <span className="qxv2-pd-when">{day.when}</span>
            <span className="qxv2-pd-cnt">
              {day.items.length} caso{day.items.length > 1 ? "s" : ""}
            </span>
          </div>
          {day.items.map((item) => (
            <div className="qxv2-pipe-item" key={item.debtorName}>
              <span className="qxv2-pi-nm">
                {item.debtorName}
                <small>{item.note}</small>
              </span>
              <span className="qxv2-pi-mo">{item.amount}</span>
              <button className="qxv2-btn-ghost" style={{ padding: "5px 10px" }}>
                Preparar →
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
