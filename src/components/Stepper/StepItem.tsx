"use client";

import React from "react";
import { StepItemProps } from "./types";

const StepItem: React.FC<StepItemProps> = ({
  step,
  index,
  isActive,
  isLast,
  onClick,
}) => {
  return (
    <div className="flex items-center">
      <button
        onClick={onClick}
        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all
          ${
            isActive
              ? "border-orange-500 bg-orange-100 text-orange-500"
              : step.completed
                ? "border-orange-500 bg-white text-orange-500"
                : "border-gray-300 bg-white text-gray-500"
          }`}
      >
        {index + 1}
      </button>

      {!isLast && (
        <div
          className={`h-[2px] w-24 mx-2 transition-all ${
            step.completed ? "bg-orange-500" : "bg-gray-300"
          }`}
        />
      )}
    </div>
  );
};

export default StepItem;
