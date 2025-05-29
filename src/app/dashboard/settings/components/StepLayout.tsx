"use client";

import React from "react";
import { StepLayoutProps } from "../types";

const StepLayout: React.FC<StepLayoutProps> = ({ children }) => {
  return <div className="h-full">{children}</div>;
};

export default StepLayout;
