import React, { useState } from "react";
import Stepper from "./index";
import { Step } from "./types";

const steps: Step[] = [
  { id: 1, label: "Paso 1", completed: true },
  { id: 2, label: "Paso 2", completed: false },
  { id: 3, label: "Paso 3", completed: false },
  { id: 4, label: "Paso 4", completed: false },
];

const StepperExample: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
      />
    </div>
  );
};

export default StepperExample;
