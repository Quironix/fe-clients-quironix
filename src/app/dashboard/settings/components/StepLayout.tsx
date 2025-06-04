"use client";

import React from "react";
import { StepLayoutProps } from "../types";

const StepLayout: React.FC<StepLayoutProps> = ({ children }) => {
  return <div className="h-auto">{children}</div>;
};

export default StepLayout;
