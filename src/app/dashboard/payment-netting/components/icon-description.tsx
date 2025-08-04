import React from "react";

const IconDescription = ({
  icon,
  description,
  value,
}: {
  icon: React.ReactNode;
  description: string | React.ReactNode;
  value: string;
}) => {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex flex-col">
        <span className="text-sm  text-gray-300 font-medium">
          {description}
        </span>
        <span className="text-sm  text-black font-medium">{value}</span>
      </div>
    </div>
  );
};

export default IconDescription;
