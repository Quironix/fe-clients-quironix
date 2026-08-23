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
  isLoading,
}) => {
  const hasRealData = !!(taskProgress || contactEffectiveness || upcomingCommitments);

  if (isLoading && !hasRealData) {
    return (
      <div className="qxv2-today-grid">
        <div className="qxv2-h-sub" style={{ padding: "16px" }}>
          Cargando estadísticas de hoy...
        </div>
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

    const stats = [
      {
        label: "Tareas pendientes hoy",
        value: pendingTasks !== undefined ? `${pendingTasks}` : "—",
        tone: pendingTasks !== undefined && pendingTasks <= 5 ? "qxv2-td-good" : "qxv2-td-warn",
        note:
          completedTasks !== undefined && totalTasks !== undefined
            ? `${completedTasks} de ${totalTasks} completadas`
            : "Sin dato",
      },
      {
        label: "Compromisos que vencen hoy",
        value: todayCommitmentsCount !== undefined ? `${todayCommitmentsCount}` : "—",
        tone: "qxv2-td-warn",
        note: "Revisar transferencias",
      },
      {
        label: "Llamadas efectivas hoy",
        value: effectiveCalls !== undefined ? `${effectiveCalls}` : "—",
        tone: effectiveCalls !== undefined && effectiveCalls >= 15 ? "qxv2-td-good" : "qxv2-td-warn",
        note: totalCalls !== undefined ? `de ${totalCalls} meta diaria` : "Sin dato",
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
