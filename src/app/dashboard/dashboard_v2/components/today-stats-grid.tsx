import React from "react";
import { MOCK_TODAY_STATS } from "../constants/mock-extras";
import {
  ContactEffectivenessData,
  TaskProgressData,
  UpcomingCommitmentDay,
} from "../types";

export interface TodayStatsGridProps {
  taskProgress?: TaskProgressData;
  contactEffectiveness?: ContactEffectivenessData;
  upcomingCommitments?: UpcomingCommitmentDay[];
  todayCash?: number;
  isLoading?: boolean;
}

export const TodayStatsGrid: React.FC<TodayStatsGridProps> = ({
  taskProgress,
  contactEffectiveness,
  upcomingCommitments,
  todayCash,
}) => {
  // If we have real data, build the real tiles
  if (taskProgress || contactEffectiveness || upcomingCommitments) {
    const todayCommitmentsCount =
      upcomingCommitments?.find((u) => u.when.startsWith("Hoy"))?.count ??
      (upcomingCommitments?.[0]?.count || 5);

    const pendingTasks = taskProgress?.pending ?? 6;
    const completedTasks = taskProgress?.completed ?? 24;
    const totalTasks = taskProgress?.total ?? 30;

    const effectiveCalls = contactEffectiveness?.todayEffective ?? 12;
    const totalCalls = contactEffectiveness?.todayTotal ?? 25;

    const formattedCash =
      todayCash !== undefined && todayCash > 0
        ? `$${(todayCash / 1000000).toFixed(1)}M`
        : "$1,8M";

    const stats = [
      {
        label: "Tareas pendientes hoy",
        value: `${pendingTasks}`,
        tone: pendingTasks <= 5 ? "qxv2-td-good" : "qxv2-td-warn",
        note: `${completedTasks} de ${totalTasks} completadas`,
      },
      {
        label: "Compromisos que vencen hoy",
        value: `${todayCommitmentsCount}`,
        tone: "qxv2-td-warn",
        note: "Revisar transferencias",
      },
      {
        label: "Llamadas efectivas hoy",
        value: `${effectiveCalls}`,
        tone: effectiveCalls >= 15 ? "qxv2-td-good" : "qxv2-td-warn",
        note: `de ${totalCalls} meta diaria`,
      },
      {
        label: "Caja recuperada hoy",
        value: formattedCash,
        tone: "qxv2-td-good",
        note: "Meta diaria $2,0M",
      },
    ];

    return (
      <div className="qxv2-today-grid">
        {stats.map((s) => (
          <div className={`qxv2-today ${s.tone}`} key={s.label}>
            <div className="qxv2-td-label">{s.label}</div>
            <div className="qxv2-td-val">{s.value}</div>
            <div className="qxv2-td-sub">{s.note}</div>
          </div>
        ))}
      </div>
    );
  }

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
