import { ReactNode } from "react";

interface IndicatorCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  height?: string;
}

export const IndicatorCard = ({
  icon,
  title,
  children,
  height = "h-[140px]",
}: IndicatorCardProps) => {
  return (
    <div
      className={`bg-white shadow-xl rounded-md p-3 space-y-2 ${height} flex flex-col justify-center`}
    >
      <div className="flex gap-3 justify-between items-center mb-5">
        <div className="flex gap-1">
          {icon}
          <span>{title}</span>
        </div>
      </div>
      {children}
    </div>
  );
};
