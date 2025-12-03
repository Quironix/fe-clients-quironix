import { Gauge, GripVertical, LayoutGrid, LineChart, List, PieChart, Settings } from "lucide-react";
import { useState } from "react";
import { KPI } from "../services/types";
import { CardView, CompactView, GaugeView, RingView, SparklineView } from "./kpi-view-types";

export type ViewType = "card" | "gauge" | "sparkline" | "ring" | "compact";

interface KPIWidgetProps {
  kpi: KPI;
  viewType: ViewType;
  onViewChange: (viewType: ViewType) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
}

const viewTypes: Array<{ id: ViewType; name: string; icon: React.ElementType }> = [
  { id: "card", name: "Card", icon: LayoutGrid },
  { id: "gauge", name: "Gauge", icon: Gauge },
  { id: "sparkline", name: "Sparkline", icon: LineChart },
  { id: "ring", name: "Ring", icon: PieChart },
  { id: "compact", name: "Compacto", icon: List },
];

const getStatus = (kpi: KPI): { status: string; color: string } => {
  const { low, high, direction } = kpi.thresholds;
  const { value } = kpi;

  if (direction === "ascending") {
    if (value >= high) return { status: "success", color: "emerald" };
    if (value >= low) return { status: "warning", color: "amber" };
    return { status: "error", color: "red" };
  }

  if (value <= low) return { status: "success", color: "emerald" };
  if (value <= high) return { status: "warning", color: "amber" };
  return { status: "error", color: "red" };
};

const getTrend = (kpi: KPI): { value: string; direction: string; isGood: boolean } => {
  const current = kpi.value;
  const previous =
    kpi.history && kpi.history.length > 1
      ? kpi.history[kpi.history.length - 2].value
      : current * 0.95;

  const diff = ((current - previous) / previous) * 100;
  const isGood = kpi.thresholds.direction === "ascending" ? diff >= 0 : diff <= 0;

  return {
    value: Math.abs(diff).toFixed(1),
    direction: diff >= 0 ? "up" : "down",
    isGood,
  };
};

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  kpi,
  viewType,
  onViewChange,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const status = getStatus(kpi);
  const trend = getTrend(kpi);

  const views: Record<ViewType, React.ComponentType<any>> = {
    card: CardView,
    gauge: GaugeView,
    sparkline: SparklineView,
    ring: RingView,
    compact: CompactView,
  };

  const ViewComponent = views[viewType];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : "hover:shadow-lg hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400">
            <GripVertical size={16} />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 truncate">{kpi.name}</h3>
          <span
            className={`shrink-0 w-2 h-2 rounded-full ${
              status.color === "emerald"
                ? "bg-emerald-500"
                : status.color === "amber"
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
          />
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-1.5 rounded-lg transition-colors ${
            showSettings
              ? "bg-gray-200 text-gray-700"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Settings size={14} />
        </button>
      </div>

      {showSettings && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Tipo de visualización</p>
          <div className="grid grid-cols-5 gap-1.5">
            {viewTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    onViewChange(type.id);
                    setShowSettings(false);
                  }}
                  className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    viewType === type.id
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <Icon size={12} />
                  {type.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <ViewComponent kpi={kpi} status={status} trend={trend} />

      <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          {kpi.type}
        </span>
      </div>
    </div>
  );
};
