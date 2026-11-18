import React from "react";
import { MOCK_TODAY_STATS } from "../constants/mock-extras";
import {
  ContactEffectivenessData,
  TaskProgressData,
  UpcomingCommitmentDay,
} from "../types";
import { DashCard, subText, Tone, TONE_TEXT } from "./dash-card";

export interface TodayStatsGridProps {
  taskProgress?: TaskProgressData;
  contactEffectiveness?: ContactEffectivenessData;
  upcomingCommitments?: UpcomingCommitmentDay[];
  todayCash?: number;
  isLoading?: boolean;
}

const grid = "grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5";

const StatTiles = ({ stats }: { stats: { label: string; value: string; tone: Tone; note: string }[] }) => (
  <div className={grid}>
    {stats.map((s) => (
      <DashCard className="px-4 py-3.5" key={s.label}>
        <div className="text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-gray-400">{s.label}</div>
        <div className={`mt-1 text-[24px] font-black tracking-[-0.01em] ${TONE_TEXT[s.tone]}`}>{s.value}</div>
        <div className="mt-0.5 text-[11.5px] font-bold text-gray-500">{s.note}</div>
      </DashCard>
    ))}
  </div>
);

export const TodayStatsGrid: React.FC<TodayStatsGridProps> = ({
  taskProgress,
  contactEffectiveness,
  upcomingCommitments,
  todayCash,
  isLoading,
}) => {
  const hasRealData = !!(taskProgress || contactEffectiveness || upcomingCommitments);

  if (isLoading && !hasRealData) {
    return (
      <div className={grid}>
        <div className={`${subText} p-4`}>Cargando estadísticas de hoy...</div>
      </div>
    );
  }

  if (hasRealData) {
    const todayCommitmentsCount = upcomingCommitments?.find((u) =>
      u.when.startsWith("Hoy"),
    )?.count;

    const pendingTasks = taskProgress?.pending;
    const completedTasks = taskProgress?.completed;
    const totalTasks = taskProgress?.total;

    const effectiveCalls = contactEffectiveness?.todayEffective;
    const totalCalls = contactEffectiveness?.todayTotal;

    // No hay endpoint que entregue caja recuperada "de hoy" en este view — en vez de
    // mostrar un monto inventado junto a métricas reales, se marca como sin dato.
    const formattedCash =
      todayCash !== undefined && todayCash > 0
        ? `$${(todayCash / 1000000).toFixed(1)}M`
        : "—";

    const stats: { label: string; value: string; tone: Tone; note: string }[] = [
      {
        label: "Tareas pendientes hoy",
        value: pendingTasks !== undefined ? `${pendingTasks}` : "—",
        tone: pendingTasks !== undefined && pendingTasks <= 5 ? "good" : "warn",
        note:
          completedTasks !== undefined && totalTasks !== undefined
            ? `${completedTasks} de ${totalTasks} completadas`
            : "Sin dato",
      },
      {
        label: "Compromisos que vencen hoy",
        value: todayCommitmentsCount !== undefined ? `${todayCommitmentsCount}` : "—",
        tone: "warn",
        note: "Revisar transferencias",
      },
      {
        label: "Llamadas efectivas hoy",
        value: effectiveCalls !== undefined ? `${effectiveCalls}` : "—",
        tone: effectiveCalls !== undefined && effectiveCalls >= 15 ? "good" : "warn",
        note: totalCalls !== undefined ? `de ${totalCalls} meta diaria` : "Sin dato",
      },
      {
        label: "Caja recuperada hoy",
        value: formattedCash,
        tone: "good",
        note: "Meta diaria $2,0M",
      },
    ];

    return <StatTiles stats={stats} />;
  }

  return <StatTiles stats={MOCK_TODAY_STATS} />;
};
