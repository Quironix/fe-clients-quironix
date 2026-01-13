import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { KPI } from "../services/types";
import { ViewMode } from "../types/preferences";
import { KPICardCompact } from "./kpi-card-compact";
import { KPICardDetailed } from "./kpi-card-detailed";
import { KPICard } from "./kpi-card";
import { KPIGauge } from "./kpi-gauge";

interface KPIDraggableGridProps {
  kpis: KPI[];
  viewMode: ViewMode;
  gridColumns: number;
  onReorder: (newOrder: string[]) => void;
}

interface SortableKPIProps {
  kpi: KPI;
  viewMode: ViewMode;
}

const SortableKPI = ({ kpi, viewMode }: SortableKPIProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: kpi.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {viewMode === "compact" && <KPICardCompact kpi={kpi} isDragging={isDragging} />}
      {viewMode === "card" && <KPICard kpi={kpi} />}
      {viewMode === "gauge" && <KPIGauge kpi={kpi} size="md" />}
      {viewMode === "detailed" && <KPICardDetailed kpi={kpi} isDragging={isDragging} />}
    </div>
  );
};

export const KPIDraggableGrid = ({
  kpis,
  viewMode,
  gridColumns,
  onReorder,
}: KPIDraggableGridProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = kpis.findIndex((kpi) => kpi.id === active.id);
      const newIndex = kpis.findIndex((kpi) => kpi.id === over.id);

      const newKpis = [...kpis];
      const [movedKpi] = newKpis.splice(oldIndex, 1);
      newKpis.splice(newIndex, 0, movedKpi);

      onReorder(newKpis.map((kpi) => kpi.id));
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeKpi = kpis.find((kpi) => kpi.id === activeId);

  const gridClass = `grid gap-4 ${
    gridColumns === 1
      ? "grid-cols-1"
      : gridColumns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : gridColumns === 3
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }`;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={kpis.map((kpi) => kpi.id)} strategy={rectSortingStrategy}>
        <div className={gridClass}>
          {kpis.map((kpi) => (
            <SortableKPI key={kpi.id} kpi={kpi} viewMode={viewMode} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeKpi && (
          <div className="opacity-90">
            {viewMode === "compact" && <KPICardCompact kpi={activeKpi} />}
            {viewMode === "card" && <KPICard kpi={activeKpi} />}
            {viewMode === "gauge" && <KPIGauge kpi={activeKpi} size="md" />}
            {viewMode === "detailed" && <KPICardDetailed kpi={activeKpi} />}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
