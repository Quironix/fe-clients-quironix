import { formatNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { TodayPriorityTask } from "../types";

interface TodayPrioritiesProps {
  data?: TodayPriorityTask[];
  isLoading?: boolean;
}

export const TodayPriorities: React.FC<TodayPrioritiesProps> = ({
  data = [],
  isLoading,
}) => {
  const router = useRouter();
  const sorted = data.slice().sort((a, b) => a.priority - b.priority);

  return (
    <div className="qxv2-card">
      <div className="qxv2-card-h">
        <h3>Prioridades de hoy</h3>
        <span className="qxv2-h-sub">
          Ordenadas por impacto en caja · Motor de Tareas
        </span>
      </div>
      <div className="qxv2-task-rows">
        {isLoading ? (
          <div className="qxv2-h-sub">Cargando...</div>
        ) : (
          sorted.map((task, i) => (
            <div className="qxv2-task" key={task.id}>
              <span className="qxv2-rank">{i + 1}</span>
              <div className="qxv2-t-main">
                <div className="qxv2-t-deudor">{task.debtorName}</div>
                <div className="qxv2-t-sug">{task.description}</div>
              </div>
              <span className="qxv2-t-monto">{formatNumber(task.amount)}</span>
              <button
                className="qxv2-btn-ghost"
                disabled={!task.debtorId}
                onClick={() =>
                  task.debtorId &&
                  router.push(
                    `/dashboard/debtor-management/${task.debtorId}?tab=add-management`,
                  )
                }
              >
                Gestionar →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
