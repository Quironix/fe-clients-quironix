import { MOCK_TEAM_CAPACITY } from "../constants/mock-extras";
import { TeamCapacityMember } from "../types";

const toneColor = (pct: number) =>
  pct >= 100 ? "#EF4444" : pct >= 80 ? "#F59E0B" : "#1FA35C";

export interface TeamCapacityCardProps {
  data?: TeamCapacityMember[] | null;
  isLoading?: boolean;
}

export const TeamCapacityCard: React.FC<TeamCapacityCardProps> = ({
  data,
  isLoading,
}) => {
  const hasRealData = !!data && data.length > 0;

  if (isLoading && !hasRealData) {
    return (
      <div className="qxv2-card qxv2-v2-card">
        <div className="qxv2-card-h">
          <h3>Carga del equipo</h3>
          <span className="qxv2-h-sub">Cargando…</span>
        </div>
        <div className="qxv2-body" />
      </div>
    );
  }

  if (hasRealData) {
    const rows = data!.map((m) => ({
      ...m,
      pct:
        m.capacity !== null && m.capacity > 0
          ? Math.round((m.assigned / m.capacity) * 100)
          : null,
    }));
    const rowsWithCapacity = rows.filter((r) => r.pct !== null);
    const worst = [...rowsWithCapacity].sort(
      (a, b) => (b.pct as number) - (a.pct as number),
    )[0];

    return (
      <div className="qxv2-card qxv2-v2-card">
        <div className="qxv2-card-h">
          <h3>Carga del equipo</h3>
          <span className="qxv2-h-sub">Casos asignados vs. capacidad</span>
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
                <span
                  className="qxv2-cg-val"
                  style={{
                    marginLeft: "auto",
                    color: c.pct !== null ? toneColor(c.pct) : undefined,
                  }}
                >
                  {c.pct !== null ? `${c.pct}% · ` : ""}
                  {c.assigned} casos
                  {c.pct === null ? " · Sin cupo definido" : ""}
                </span>
              </div>
              <div className="qxv2-cg-track" style={{ marginTop: 5 }}>
                <span
                  className="qxv2-cg-fill"
                  style={{
                    width: c.pct !== null ? `${Math.min(c.pct, 100)}%` : "0%",
                    background: c.pct !== null ? toneColor(c.pct) : "transparent",
                  }}
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
  }

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
