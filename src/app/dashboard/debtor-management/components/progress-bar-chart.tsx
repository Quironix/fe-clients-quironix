import { cn } from "@/lib/utils";

interface ProgressBarChartProps {
  color: string;
  leftValue: number;
  rightValue: number;
  separatorColor?: string;
  text?: string;
  symbol?: string;
}

const formatValue = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return `${value}`;
};

export const ProgressBarChart = ({
  color,
  leftValue,
  rightValue,
  separatorColor = "#ffffff",
  text,
  symbol = "$",
}: ProgressBarChartProps) => {
  const total = leftValue + rightValue;
  const leftPercentage = total > 0 ? (leftValue / total) * 100 : 50;
  const rightPercentage = total > 0 ? (rightValue / total) * 100 : 50;

  return (
    <div className="flex w-full">
      <span
        className="rounded-l-md px-3 py-1 text-xs text-gray-800 font-semibold flex items-center justify-center min-w-[100px]"
        style={{ width: `${leftPercentage}%`, backgroundColor: color }}
      >
        <div className="flex justify-between items-center gap-1">
          <span>
            {symbol} {formatValue(leftValue)}
          </span>{" "}
          <span>{text && text}</span>
        </div>
      </span>
      <span className="w-[5px]" style={{ backgroundColor: separatorColor }} />
      <span
        className="rounded-r-md px-3 py-1 text-xs text-gray-800 font-semibold bg-gray-300 flex items-center justify-center"
        style={{ width: `${rightPercentage}%` }}
      >
        {symbol} {formatValue(rightValue)}
      </span>
    </div>
  );
};

export { formatValue };
