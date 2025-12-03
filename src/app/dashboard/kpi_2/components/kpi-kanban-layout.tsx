import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityIcon, GaugeIcon, TrendingUpIcon } from "lucide-react";
import { useState } from "react";
import { KPI, KPIType } from "../services/types";
import { ViewMode } from "../types/preferences";
import { KPICardCompact } from "./kpi-card-compact";

interface KPIKanbanLayoutProps {
  kpis: KPI[];
  viewMode: ViewMode;
  onReorder: (newOrder: string[]) => void;
}

interface SortableKPIItemProps {
  kpi: KPI;
}

const SortableKPIItem = ({ kpi }: SortableKPIItemProps) => {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KPICardCompact kpi={kpi} isDragging={isDragging} />
    </div>
  );
};

interface KanbanColumnProps {
  title: string;
  type: KPIType;
  kpis: KPI[];
  icon: React.ReactNode;
  color: string;
}

const KanbanColumn = ({ title, kpis, icon, color }: KanbanColumnProps) => {
  const successCount = kpis.filter((k) => k.status === "success").length;
  const warningCount = kpis.filter((k) => k.status === "warning").length;
  const errorCount = kpis.filter((k) => k.status === "error").length;

  const getBgColor = () => {
    switch (color) {
      case "blue":
        return "bg-blue-50 border-blue-200";
      case "purple":
        return "bg-purple-50 border-purple-200";
      case "indigo":
        return "bg-indigo-50 border-indigo-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getIconColor = () => {
    switch (color) {
      case "blue":
        return "text-blue-600";
      case "purple":
        return "text-purple-600";
      case "indigo":
        return "text-indigo-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className={`border-2 ${getBgColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={getIconColor()}>{icon}</div>
            <CardTitle className="text-base font-bold">{title}</CardTitle>
          </div>
          <Badge variant="secondary" className="font-semibold">
            {kpis.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
            {successCount} ✓
          </Badge>
          <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
            {warningCount} !
          </Badge>
          <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
            {errorCount} ✕
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        <SortableContext items={kpis.map((kpi) => kpi.id)} strategy={verticalListSortingStrategy}>
          {kpis.length > 0 ? (
            kpis.map((kpi) => <SortableKPIItem key={kpi.id} kpi={kpi} />)
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No hay KPIs en esta categoría
            </div>
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
};

export const KPIKanbanLayout = ({
  kpis,
  viewMode,
  onReorder,
}: KPIKanbanLayoutProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const kpisByType = {
    "Calidad Producida": kpis.filter((k) => k.type === "Calidad Producida"),
    Eficiencia: kpis.filter((k) => k.type === "Eficiencia"),
    Impecabilidad: kpis.filter((k) => k.type === "Impecabilidad"),
  };

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KanbanColumn
          title="Calidad Producida"
          type="Calidad Producida"
          kpis={kpisByType["Calidad Producida"]}
          icon={<ActivityIcon className="h-5 w-5" />}
          color="blue"
        />
        <KanbanColumn
          title="Eficiencia"
          type="Eficiencia"
          kpis={kpisByType["Eficiencia"]}
          icon={<TrendingUpIcon className="h-5 w-5" />}
          color="purple"
        />
        <KanbanColumn
          title="Impecabilidad"
          type="Impecabilidad"
          kpis={kpisByType["Impecabilidad"]}
          icon={<GaugeIcon className="h-5 w-5" />}
          color="indigo"
        />
      </div>

      <DragOverlay>
        {activeKpi && (
          <div className="opacity-90">
            <KPICardCompact kpi={activeKpi} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
