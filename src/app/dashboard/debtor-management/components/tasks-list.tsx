"use client";

import { useProfileContext } from "@/context/ProfileContext";
import {
  AlertTriangle,
  CircleCheckBig,
  File,
  FileText,
  Scale,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCollectorQuadrants } from "../hooks/useCollectorQuadrants";
import { QuadrantType } from "../services/types";
import { TaskIsland } from "./task-island";
import { TaskItem } from "./task-item";
import { TasksPagination } from "./tasks-pagination";

interface TasksListProps {
  selectedQuadrant: QuadrantType;
}

export const TasksList = ({ selectedQuadrant }: TasksListProps) => {
  const { session, profile } = useProfileContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(20); // Límite de items por página

  // Resetear página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedQuadrant]);

  const { data, isLoading, isError } = useCollectorQuadrants({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    params: {
      page: currentPage,
      limit: pageLimit,
      quadrant: selectedQuadrant,
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-gray-500">Cargando tareas...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-red-500">Error al cargar las tareas</div>
      </div>
    );
  }

  // Organizar datos por cuadrante según la respuesta del API
  const riskTasks = data.data.critical_debtors;
  const brokenCommitmentsTasks = data.data.broken_commitments;
  const cashGenerationTasks = data.data.cash_generation;
  const litigationTasks = data.data.litigation;
  const deficientTechnicalFileTasks = data.data.deficient_technical_file;
  const unclassifiedTasks = data.data.unclassified;

  // Mensaje cuando no hay tareas
  const hasAnyTasks =
    riskTasks.length > 0 ||
    brokenCommitmentsTasks.length > 0 ||
    cashGenerationTasks.length > 0 ||
    litigationTasks.length > 0 ||
    deficientTechnicalFileTasks.length > 0;

  if (!hasAnyTasks && unclassifiedTasks.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-gray-500">No hay tareas asignadas</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Deudores Críticos */}
      {riskTasks.length > 0 && (
        <TaskIsland
          title="Deudores Críticos"
          icon={<AlertTriangle className="w-4 h-4" />}
          bgColor="bg-red-100"
          textColor="text-red-700"
        >
          {riskTasks
            .sort((a, b) => b.debtor.due_debt_amount - a.debtor.due_debt_amount)
            .map((task, index) => (
              <TaskItem
                key={task.debtorId}
                debtorId={task.debtorId}
                code={task.debtor.debtor_code}
                name={task.debtor.name}
                incidents={task.debtor.broken_commitments_count}
                incidentsLabel="Incumplimientos"
                debt={task.debtor.due_debt_amount}
                debtLabel="Deuda vencida"
                status={`${task.debtor.broken_commitments_percentage}%`}
                statusBgColor="bg-red-100"
                statusTextColor="text-red-700"
                highlighted={index === 0}
                borderColor="border-red-500"
              />
            ))}
        </TaskIsland>
      )}

      {/* Compromisos Incumplidos */}
      {brokenCommitmentsTasks.length > 0 && (
        <TaskIsland
          title="Compromisos Incumplidos"
          icon={<AlertTriangle className="w-4 h-4" />}
          bgColor="bg-red-100"
          textColor="text-red-700"
        >
          {brokenCommitmentsTasks.map((task, index) => (
            <TaskItem
              key={task.debtorId}
              debtorId={task.debtorId}
              code={task.debtor.debtor_code}
              name={task.debtor.name}
              incidents={task.debtor.broken_commitments_count}
              incidentsLabel="Incumplimientos"
              debt={task.debtor.due_debt_amount}
              debtLabel="Deuda vencida"
              status={`${task.debtor.broken_commitments_percentage}%`}
              statusBgColor="bg-red-100"
              statusTextColor="text-red-700"
              highlighted={index === 0}
              borderColor="border-red-500"
            />
          ))}
        </TaskIsland>
      )}

      {/* Generación de Caja */}
      {cashGenerationTasks.length > 0 && (
        <TaskIsland
          title="Generación de Caja"
          icon={<FileText className="w-4 h-4" />}
          bgColor="bg-orange-100"
          textColor="text-orange-700"
        >
          {cashGenerationTasks.map((task, index) => (
            <TaskItem
              key={task.debtorId}
              debtorId={task.debtorId}
              code={task.debtor.debtor_code}
              name={task.debtor.name}
              incidents={task.debtor.broken_commitments_count}
              incidentsLabel="Incumplimientos"
              debt={task.debtor.due_debt_amount}
              debtLabel="Deuda vencida"
              status={`${task.debtor.broken_commitments_percentage}%`}
              statusBgColor="bg-orange-100"
              statusTextColor="text-orange-700"
              highlighted={index === 0}
              borderColor="border-orange-500"
            />
          ))}
        </TaskIsland>
      )}

      {/* Workflow de Litigios */}
      {litigationTasks.length > 0 && (
        <TaskIsland
          title="Workflow de Litigios"
          icon={<Scale className="w-4 h-4" />}
          bgColor="bg-yellow-100"
          textColor="text-yellow-700"
        >
          {litigationTasks.map((task, index) => (
            <TaskItem
              key={task.debtorId}
              debtorId={task.debtorId}
              code={task.debtor.debtor_code}
              name={task.debtor.name}
              incidents={task.debtor.broken_commitments_count}
              incidentsLabel="Incumplimientos"
              debt={task.debtor.due_debt_amount}
              debtLabel="Deuda vencida"
              status={`${task.debtor.broken_commitments_percentage}%`}
              statusBgColor="bg-yellow-100"
              statusTextColor="text-yellow-700"
              highlighted={index === 0}
              borderColor="border-yellow-500"
            />
          ))}
        </TaskIsland>
      )}

      {/* Expediente Técnico Deficiente */}
      {deficientTechnicalFileTasks.length > 0 && (
        <TaskIsland
          title="Expediente Técnico Deficiente"
          icon={<File className="w-4 h-4" />}
          bgColor="bg-purple-100"
          textColor="text-purple-700"
        >
          {deficientTechnicalFileTasks.map((task, index) => (
            <TaskItem
              key={task.debtorId}
              debtorId={task.debtorId}
              code={task.debtor.debtor_code}
              name={task.debtor.name}
              incidents={task.debtor.broken_commitments_count}
              incidentsLabel="Incumplimientos"
              debt={task.debtor.due_debt_amount}
              debtLabel="Deuda vencida"
              status={`${task.debtor.broken_commitments_percentage}%`}
              statusBgColor="bg-purple-100"
              statusTextColor="text-purple-700"
              highlighted={index === 0}
              borderColor="border-purple-500"
            />
          ))}
        </TaskIsland>
      )}

      {/* Sin Clasificar - Solo mostrar si hay datos */}
      {unclassifiedTasks.length > 0 && (
        <TaskIsland
          title="Sin Clasificar"
          icon={<CircleCheckBig className="w-4 h-4" />}
          bgColor="bg-gray-100"
          textColor="text-gray-700"
        >
          {unclassifiedTasks.map((task, index) => (
            <TaskItem
              key={task.debtorId}
              debtorId={task.debtorId}
              code={task.debtor.debtor_code}
              name={task.debtor.name}
              incidents={0}
              incidentsLabel="Incumplimientos"
              debt="-"
              debtLabel="Deuda vencida"
              status="SIN CLASIFICAR"
              statusBgColor="bg-gray-100"
              statusTextColor="text-gray-700"
              highlighted={index === 0}
              borderColor="border-gray-500"
            />
          ))}
        </TaskIsland>
      )}

      {/* Paginación */}
      {data?.pagination && (
        <TasksPagination
          pagination={data.pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
