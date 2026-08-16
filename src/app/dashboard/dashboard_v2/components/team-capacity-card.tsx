import { MOCK_TEAM_CAPACITY } from "../constants/mock-extras";

const toneColor = (pct: number) =>
  pct >= 100 ? "#EF4444" : pct >= 80 ? "#F59E0B" : "#1FA35C";

export const TeamCapacityCard: React.FC = () => {
  const rows = MOCK_TEAM_CAPACITY;
  const worst = [...rows].sort((a, b) => b.pct - a.pct)[0];

  return (
    <div className="qxv2-card qxv2-v2-card">
      <div className="qxv2-card-h">
        <h3>Carga del equipo</h3>
        <span className="qxv2-h-sub">
          Casos asignados vs. capacidad · datos ilustrativos
        </span>
      </div>
      <div className="qxv2-body">
        {rows.map((c) => (
          <div className="qxv2-t-carga" style={{ marginBottom: 13 }} key={c.executiveId}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="qxv2-t-av" style={{ width: 24, height: 24, fontSize: 10 }}>
                {c.executiveName
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800 }}>{c.executiveName}</span>
              <span className="qxv2-cg-val" style={{ marginLeft: "auto", color: toneColor(c.pct) }}>
                {c.pct}% · {c.cases} casos
              </span>
            </div>
            <div className="qxv2-cg-track" style={{ marginTop: 5 }}>
              <span
                className="qxv2-cg-fill"
                style={{ width: `${Math.min(c.pct, 100)}%`, background: toneColor(c.pct) }}
              />
            </div>
          </div>
        ))}
        {worst && (
          <div className="qxv2-aging-foot">
            <strong style={{ color: "var(--qx-bad-tx)" }}>
              {worst.executiveName} está al {worst.pct}%
            </strong>{" "}
            de capacidad — es quien más soporte necesita esta semana.
          </div>
        )}
      </div>
    </div>
  );
};
