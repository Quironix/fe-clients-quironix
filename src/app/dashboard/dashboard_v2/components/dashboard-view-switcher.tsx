import { DASHBOARD_TYPE_LABELS, DashboardType } from "../types";

interface DashboardViewSwitcherProps {
  options: DashboardType[];
  value: DashboardType | null;
  onChange: (type: DashboardType) => void;
}

export const DashboardViewSwitcher: React.FC<DashboardViewSwitcherProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === option
              ? "bg-orange-500 text-white"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          {DASHBOARD_TYPE_LABELS[option]}
        </button>
      ))}
    </div>
  );
};
