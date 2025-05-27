"use client";

import React, { useState } from "react";
import { Step } from "@/components/Stepper/types";
import PersonalInformationStep from "./components/steps/PersonalInformationStep";
import TwoFactorStep from "./components/steps/TwoFactorStep";
import TermsAndConditionStep from "./components/steps/TermsAndConditionStep";
import ContractSignStep from "./components/steps/ConstractSignStep";
import SuccessOnboarding from "./components/steps/SuccessOnboarding";
import { useProfileContext } from "@/context/ProfileContext";
import { Loader, Loader2 } from "lucide-react";
const steps: Step[] = [
  { id: 1, label: "Datos personales", completed: false },
  { id: 2, label: "Autenticación", completed: false },
  { id: 3, label: "Verificación", completed: false },
  { id: 4, label: "Confirmación", completed: false },
  { id: 5, label: "Success", completed: false },
];

// Renombramos el componente original a OnboardingSteps
const OnboardingSteps = () => {
  const { profile } = useProfileContext();
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
      profile,
    };

    switch (currentStep) {
      case 0:
        return <PersonalInformationStep {...stepProps} />;
      case 1:
        return <TwoFactorStep {...stepProps} />;
      case 2:
        return <TermsAndConditionStep {...stepProps} />;
      case 3:
        return <ContractSignStep {...stepProps} />;
      case 4:
        return <SuccessOnboarding {...stepProps} />;
      // Aquí irán los demás casos para los otros pasos
      default:
        return null;
    }
  };

  return (
    <section className="bg-[#1249C7] min-h-screen w-screen">
      <div className="container mx-auto h-screen flex items-center justify-center">
        {profile ? (
          renderStep()
        ) : (
          <div className="text-white flex items-center gap-2">
            <Loader className="animate-spin" /> Cargando...
          </div>
        )}
      </div>
    </section>
  );
};

// Este es el layout real de Next.js
const OnboardingLayout = () => {
  return <OnboardingSteps />;
};

export default OnboardingLayout;
