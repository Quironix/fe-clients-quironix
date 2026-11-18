import { formatNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { TodayPriorityTask } from "../types";
import { avatar, btnGhost, DashCard, DashCardHeader, subText } from "./dash-card";

interface TodayPrioritiesProps {
  data?: TodayPriorityTask[];
  isLoading?: boolean;
}

export const TodayPriorities: React.FC<TodayPrioritiesProps> = ({
  data = [],
  isLoading,
}) => {
  const router = useRouter();
  const sorted = data
    .filter((task) => typeof task.amount === "number" && task.amount > 0)
    .sort((a, b) => a.priority - b.priority);

  return (
    <DashCard>
      <DashCardHeader
        title="Prioridades de hoy"
        sub="Ordenadas por impacto en caja · Motor de Tareas"
      />
      <div className="px-5 pt-1 pb-2">
        {isLoading ? (
          <div className={subText}>Cargando...</div>
        ) : sorted.length === 0 ? (
          <div className="px-0.5 py-1.5 text-xs text-gray-500">
            No hay prioridades con monto pendiente para hoy.
          </div>
        ) : (
          sorted.map((task, i) => (
            <div
              className="grid grid-cols-[26px_minmax(0,1.6fr)_auto_auto_auto] items-center gap-3.5 border-t border-gray-100 py-3 first:border-t-0"
              key={task.id}
            >
              <span className={`${avatar} size-6 text-[11.5px] font-black`}>{i + 1}</span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-extrabold">{task.debtorName}</div>
                <div className="mt-px text-[11.5px] font-semibold text-gray-500">{task.description}</div>
              </div>
              <span className="text-right text-[14px] font-black">{formatNumber(task.amount)}</span>
              <button
                className={btnGhost}
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
    </DashCard>
  );
};
