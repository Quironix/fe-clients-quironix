"use client";

import React, { useState } from "react";
import Header from "@/app/dashboard/components/header";
import { Button } from "@/components/ui/button";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import { UsersIcon } from "lucide-react";
import { useProfileContext } from "@/context/ProfileContext";
import { Step } from "@/components/Stepper/types";
import DebtorsDataStep from "./components/steps/debtor-data";
const steps: Step[] = [
  { id: 1, label: "Configuración de la entidad", completed: false },
  { id: 2, label: "Configuración de deudores", completed: false },
  { id: 3, label: "Configuración de contactos", completed: false },
];

const LayoutSettings = ({ children }: { children: React.ReactNode }) => {
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
        return <DebtorsDataStep {...stepProps} />;
      // Aquí irán los demás casos para los otros pasos
      default:
        return null;
    }
  };

  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            size="icon"
            className="bg-orange-500 text-white rounded-full hover:bg-orange-400 cursor-pointer"
          >
            ES
          </Button>
        </div>
      </Header>
      <Main>
        <TitleSection
          title="Usuarios"
          description="Aquí puedes ver un resumen de tus usuarios."
          icon={<UsersIcon color="white" />}
          subDescription="Usuarios"
        />
        <div className="h-screen bg-white rounded-md p-4 px-8 border border-gray-200">
          {renderStep()}
        </div>
      </Main>
    </>
  );
};

export default LayoutSettings;
