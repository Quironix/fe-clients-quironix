import { cn } from "@/lib/utils";
import React from "react";

const IconDescription = ({
  icon,
  description,
  value,
  className,
}: {
  icon: React.ReactNode;
  description: string | React.ReactNode;
  value: string;
  className?: string;
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {icon}
      <div className="flex flex-col">
        <span className="text-sm  text-gray-400 font-medium">
          {description}
        </span>
        <span className="text-sm  text-black font-medium">{value}</span>
      </div>
    </div>
  );
};

export default IconDescription;
