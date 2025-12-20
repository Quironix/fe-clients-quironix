import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { KPI } from "../services/types";
import { KPICardDetailed } from "./kpi-card-detailed";
import { GaugeChart, RingChart, Sparkline } from "./kpi-visualizations";

interface ViewProps {
  kpi: KPI;
  status: { status: string; color: string };
  trend: { value: string; direction: string; isGood: boolean };
}

export const CardView: React.FC<ViewProps> = ({ kpi, status, trend }) => (
  <div className="p-4">
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{kpi.value}</span>
          <span className="text-sm text-gray-400">{kpi.unit}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Meta: {kpi.target}
          {kpi.unit}
        </div>
      </div>
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          trend.isGood ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        }`}
      >
        {trend.direction === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend.value}%
      </div>
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          status.color === "emerald"
            ? "bg-emerald-500"
            : status.color === "amber"
            ? "bg-amber-500"
            : "bg-red-500"
        }`}
        style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
      />
    </div>
    {kpi.history && kpi.history.length > 0 && (
      <div className="mt-3">
        <Sparkline
          data={kpi.history.map((h) => h.value)}
          color={
            status.color === "emerald"
              ? "#10b981"
              : status.color === "amber"
              ? "#f59e0b"
              : "#ef4444"
          }
          height={50}
          width={200}
        />
      </div>
    )}
  </div>
);

export const GaugeView: React.FC<ViewProps> = ({ kpi, status }) => (
  <div className="p-4 flex flex-col items-center">
    <GaugeChart value={kpi.value} max={kpi.target} color={status.color} />
    <div
      className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
        status.color === "emerald"
          ? "bg-emerald-50 text-emerald-600"
          : status.color === "amber"
          ? "bg-amber-50 text-amber-600"
          : "bg-red-50 text-red-600"
      }`}
    >
      {status.status === "success" ? "En meta" : status.status === "warning" ? "Cerca" : "Fuera"}
    </div>
  </div>
);

export const SparklineView: React.FC<ViewProps> = ({ kpi, status, trend }) => (
  <div className="p-4">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
        <span className="text-sm text-gray-400">{kpi.unit}</span>
      </div>
      <div
        className={`flex items-center gap-1 text-xs font-medium ${
          trend.isGood ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {trend.direction === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend.value}%
      </div>
    </div>
    {kpi.history && kpi.history.length > 0 && (
      <>
        <Sparkline
          data={kpi.history.map((h) => h.value)}
          color={
            status.color === "emerald"
              ? "#10b981"
              : status.color === "amber"
              ? "#f59e0b"
              : "#ef4444"
          }
          height={60}
          width={220}
        />
        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
          <span>{kpi.history.length} períodos</span>
          <span>
            Meta: {kpi.target}
            {kpi.unit}
          </span>
        </div>
      </>
    )}
  </div>
);

export const RingView: React.FC<ViewProps> = ({ kpi, status, trend }) => {
  const previousValue = kpi.history && kpi.history.length > 1
    ? kpi.history[kpi.history.length - 2].value
    : kpi.value * 0.95;

  return (
    <div className="p-4 flex items-center gap-4">
      <RingChart value={kpi.value} max={kpi.target} color={status.color} size={90} />
      <div className="flex-1">
        <div
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
            trend.isGood ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          }`}
        >
          {trend.direction === "up" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend.value}%
        </div>
        <div className="text-xs text-gray-500">
          Meta: {kpi.target}
          {kpi.unit}
        </div>
        <div className="text-xs text-gray-400">
          Anterior: {previousValue}
          {kpi.unit}
        </div>
      </div>
    </div>
  );
};

export const CompactView: React.FC<ViewProps> = ({ kpi, status, trend }) => (
  <div className="p-3 flex items-center gap-3">
    <div
      className={`w-1 h-10 rounded-full ${
        status.color === "emerald"
          ? "bg-emerald-500"
          : status.color === "amber"
          ? "bg-amber-500"
          : "bg-red-500"
      }`}
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-900">{kpi.value}</span>
        <span className="text-xs text-gray-400">{kpi.unit}</span>
        <div
          className={`flex items-center gap-0.5 text-xs ${
            trend.isGood ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {trend.direction === "up" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend.value}%
        </div>
      </div>
      <div className="h-1 bg-gray-100 rounded-full mt-1">
        <div
          className={`h-full rounded-full ${
            status.color === "emerald"
              ? "bg-emerald-500"
              : status.color === "amber"
              ? "bg-amber-500"
              : "bg-red-500"
          }`}
          style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
        />
      </div>
    </div>
    {kpi.history && kpi.history.length > 0 && (
      <Sparkline data={kpi.history.map((h) => h.value)} color="#9ca3af" height={24} width={50} />
    )}
  </div>
);

export const DetailedView: React.FC<ViewProps> = ({ kpi }) => (
  <KPICardDetailed kpi={kpi} isDragging={false} />
);
