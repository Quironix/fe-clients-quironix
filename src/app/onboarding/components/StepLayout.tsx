"use client";

import React from "react";
import { StepLayoutProps } from "../types";

const StepLayout: React.FC<StepLayoutProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="bg-white w-full max-w-6xl flex gap-8">
      {/* Panel izquierdo */}
      <div className="w-2/5 bg-[#2F6EFF] p-8 text-white">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-md">{description}</p>
      </div>

      {/* Panel derecho */}
      <div className="w-3/5 p-8">{children}</div>
    </div>
  );
};

export default StepLayout;
