import React from "react";

const TitleStep = ({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="h-10 w-10 bg-[#F1F5F9] rounded-full flex items-center justify-center text-[#1249C7]">
        {icon}
      </div>
      <h1 className="text-md font-bold">{title}</h1>
    </div>
  );
};

export default TitleStep;
