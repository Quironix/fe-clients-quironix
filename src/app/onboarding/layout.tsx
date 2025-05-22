"use client";

import React, { useState } from "react";
import { Step } from "@/components/Stepper/types";
import PersonalInformationStep from "./components/steps/PersonalInformationStep";
import TwoFactorStep from "./components/steps/TwoFactorStep";

const steps: Step[] = [
  { id: 1, label: "Datos personales", completed: false },
  { id: 2, label: "Autenticación", completed: false },
  { id: 3, label: "Verificación", completed: false },
  { id: 4, label: "Confirmación", completed: false },
];

// Renombramos el componente original a OnboardingSteps
const OnboardingSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsState, setStepsState] = useState<Step[]>(steps);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const newSteps = [...stepsState];
      newSteps[currentStep].completed = true;
      setStepsState(newSteps);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const renderStep = () => {
    const stepProps = {
      onNext: handleNext,
      onBack: handleBack,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === steps.length - 1,
      currentStep,
      steps: stepsState,
      onStepChange: handleStepChange,
    };

    switch (currentStep) {
      case 0:
        return <PersonalInformationStep {...stepProps} />;
      case 1:
        return <TwoFactorStep {...stepProps} />;
      // Aquí irán los demás casos para los otros pasos
      default:
        return null;
    }
  };

  return (
    <section className="bg-[#1249C7] min-h-screen w-screen">
      <div className="container mx-auto h-screen flex items-center justify-center">
        {renderStep()}
      </div>
    </section>
  );
};

// Este es el layout real de Next.js
const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  return <OnboardingSteps />;
};

export default OnboardingLayout;
