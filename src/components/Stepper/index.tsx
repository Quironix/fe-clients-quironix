"use client";

import React from "react";
import { StepperProps } from "./types";
import StepItem from "./StepItem";

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepChange,
}) => {
  const handleStepClick = (stepIndex: number) => {
    if (onStepChange) {
      onStepChange(stepIndex);
    }
  };

  return (
    <div className="flex items-center justify-center w-full py-4">
      {steps.map((step, index) => (
        <StepItem
          key={step.id}
          step={step}
          index={index}
          isActive={currentStep === index}
          isLast={index === steps.length - 1}
          onClick={() => handleStepClick(index)}
        />
      ))}
    </div>
  );
};

export default Stepper;
