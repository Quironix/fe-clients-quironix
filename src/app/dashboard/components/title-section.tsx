import React from "react";

interface TitleSectionProps {
  title?: string;
  description?: string;
  icon: React.ReactNode;
  subDescription?: string;
}

const TitleSection = ({ title, description, icon, subDescription }: TitleSectionProps) => {
  return (
    <div className="border border-[#0A78F3] rounded-xl p-1 px-3 flex items-center bg-white mb-5">
      <div className="flex items-center justify-start max-w-40 min-w-40 gap-2">
        <div className="bg-primary rounded-lg  p-3 flex items-center justify-center text-white">
          {icon}
        </div>
        {subDescription && (
          <span className="text-base font-bold text-primary text-left leading-tight">
            {subDescription}
          </span>
        )}
      </div>
      <div className="h-16 border-l border-[#0A8BF3] mx-6" />
      <div className="flex flex-col justify-center">
        {title && <h2 className="text-xl font-black text-gray-800 leading-tight">{title}</h2>}
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
};

export default TitleSection;
