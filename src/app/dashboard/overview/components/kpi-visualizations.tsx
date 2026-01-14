import React from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = "#6b7280",
  height = 40,
  width = 120,
}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polygon fill={`${color}15`} points={areaPoints} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 8) - 4}
        r="3"
        fill={color}
      />
    </svg>
  );
};

interface GaugeChartProps {
  value: number;
  max: number;
  color: string;
  size?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max,
  color,
  size = 140,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors: Record<string, string> = {
    emerald: "#10b981",
    amber: "#f59e0b",
    red: "#ef4444",
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} className="overflow-visible">
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          } ${size / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          } ${size / 2}`}
          fill="none"
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset || 0}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute bottom-2 flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-xs text-gray-400">de {max}</span>
      </div>
    </div>
  );
};

interface RingChartProps {
  value: number;
  max: number;
  color: string;
  size?: number;
}

export const RingChart: React.FC<RingChartProps> = ({
  value,
  max,
  color,
  size = 100,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colors: Record<string, string> = {
    emerald: "#10b981",
    amber: "#f59e0b",
    red: "#ef4444",
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={(size || 2) / 2}
          cy={(size || 2) / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={(size || 2) / 2}
          cy={(size || 2) / 2}
          r={radius}
          fill="none"
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-[10px] text-gray-400">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

interface BulletChartProps {
  value: number;
  target: number;
  low: number;
  high: number;
  color: string;
}

export const BulletChart: React.FC<BulletChartProps> = ({
  value,
  target,
  low,
  high,
  color,
}) => {
  const max = Math.max(value, target, high) * 1.15;
  const colors: Record<string, string> = {
    emerald: "#10b981",
    amber: "#f59e0b",
    red: "#ef4444",
  };

  return (
    <div className="w-full">
      <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-red-100/80"
          style={{ width: `${(low / max) * 100}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-amber-100/80"
          style={{ width: `${(high / max) * 100}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-emerald-100/80"
          style={{ width: `${(target / max) * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 rounded transition-all duration-700"
          style={{
            width: `${(value / max) * 100}%`,
            backgroundColor: colors[color],
          }}
        />
        <div
          className="absolute top-1 bottom-1 w-0.5 bg-gray-800"
          style={{ left: `${(target / max) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-gray-400">
        <span>0</span>
        <span>Meta: {target}</span>
        <span>{Math.round(max)}</span>
      </div>
    </div>
  );
};
