import { MOCK_TEAM_CAPACITY } from "../constants/mock-extras";
import { TeamCapacityMember } from "../types";
import { avatar, cardBody, DashCard, DashCardHeader, TONE_COLOR, track } from "./dash-card";

const toneColor = (pct: number) =>
  TONE_COLOR[pct >= 100 ? "bad" : pct >= 80 ? "warn" : "good"];

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

export interface TeamCapacityCardProps {
  data?: TeamCapacityMember[] | null;
  isLoading?: boolean;
}

const CapacityRow = ({
  name,
  label,
  pct,
}: {
  name: string;
  label: string;
  pct: number | null;
}) => (
  <div className="mb-[13px] flex flex-col gap-[3px]">
    <div className="flex items-baseline gap-2">
      <span className={`${avatar} size-6 text-[10px]`}>{initials(name)}</span>
      <span className="text-[12.5px] font-extrabold">{name}</span>
      <span
        className="ml-auto text-[11.5px] font-extrabold"
        style={{ color: pct !== null ? toneColor(pct) : undefined }}
      >
        {label}
      </span>
    </div>
    <div className={`${track} mt-[5px] h-[5px]`}>
      <span
        className="block h-full rounded-full"
        style={{
          width: pct !== null ? `${Math.min(pct, 100)}%` : "0%",
          background: pct !== null ? toneColor(pct) : "transparent",
        }}
      />
    </div>
  </div>
);

const WorstNote = ({ name, pct }: { name: string; pct: number }) => (
  <div className="mt-3 text-[11.5px] font-bold text-gray-500">
    <strong className="text-bad-fg">
      {name} está al {pct}%
    </strong>{" "}
    de capacidad — es quien más soporte necesita esta semana.
  </div>
);

export const TeamCapacityCard: React.FC<TeamCapacityCardProps> = ({
  data,
  isLoading,
}) => {
  const hasRealData = !!data && data.length > 0;

  if (isLoading && !hasRealData) {
    return (
      <DashCard>
        <DashCardHeader title="Carga del equipo" sub="Cargando…" />
        <div className={cardBody} />
      </DashCard>
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
      <DashCard>
        <DashCardHeader title="Carga del equipo" sub="Casos asignados vs. capacidad" />
        <div className={cardBody}>
          {rows.map((c) => (
            <CapacityRow
              key={c.executiveId}
              name={c.executiveName}
              pct={c.pct}
              label={`${c.pct !== null ? `${c.pct}% · ` : ""}${c.assigned} casos${c.pct === null ? " · Sin cupo definido" : ""}`}
            />
          ))}
          {worst && <WorstNote name={worst.executiveName} pct={worst.pct as number} />}
        </div>
      </DashCard>
    );
  }

  const rows = MOCK_TEAM_CAPACITY;
  const worst = [...rows].sort((a, b) => b.pct - a.pct)[0];

  return (
    <DashCard>
      <DashCardHeader
        title="Carga del equipo"
        sub="Casos asignados vs. capacidad · datos ilustrativos"
      />
      <div className={cardBody}>
        {rows.map((c) => (
          <CapacityRow
            key={c.executiveId}
            name={c.executiveName}
            pct={c.pct}
            label={`${c.pct}% · ${c.cases} casos`}
          />
        ))}
        {worst && <WorstNote name={worst.executiveName} pct={worst.pct} />}
      </div>
    </DashCard>
  );
};
