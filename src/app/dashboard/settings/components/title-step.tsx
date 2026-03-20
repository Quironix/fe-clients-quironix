import React from "react";
import { InfoIcon } from "../../components/info-icon";

const TitleStep = ({
  title,
  icon,
  helperText,
}: {
  title: string;
  icon: React.ReactNode;
  helperText?: string;
}) => {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="h-10 w-10 bg-[#F1F5F9] rounded-full flex items-center justify-center text-[#1249C7]">
        {icon}
      </div>
      <h1 className="text-md font-bold">{title}</h1>
      {helperText && (
        // <span className="text-sm font-bold flex justify-start gap-2">
        <InfoIcon
          color="#2f6eff"
          size="sm"
          tooltipContent={helperText}
          tooltipClassName="max-w-xl"
        />
        // </span>
      )}
    </div>
  );
};

export default TitleStep;
