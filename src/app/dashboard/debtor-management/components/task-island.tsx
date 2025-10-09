import { ReactNode } from "react";

interface TaskIslandProps {
  title: string;
  icon: ReactNode;
  bgColor: string;
  textColor: string;
  children: ReactNode;
}

export const TaskIsland = ({
  title,
  icon,
  bgColor,
  textColor,
  children,
}: TaskIslandProps) => {
  return (
    <div className="mb-5">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${bgColor} ${textColor}`}
      >
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <div className="bg-white rounded-b-lg mt-2">{children}</div>
    </div>
  );
};
