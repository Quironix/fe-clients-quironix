"use client";

import React, { useState } from "react";
import Header from "../components/header";
import { Button } from "@/components/ui/button";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { UsersIcon } from "lucide-react";
import { useProfileContext } from "@/context/ProfileContext";
import { Step } from "@/components/Stepper/types";
import StepEntity from "./components/steps/step-entity";
import StepDebtors from "./components/steps/step-debtors";
import StepContacts from "./components/steps/step-contacts";

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
        return <StepEntity {...stepProps} />;
      case 1:
        return <StepDebtors {...stepProps} />;
      case 2:
        return <StepContacts {...stepProps} />;
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
          title="Configuración cliente"
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<UsersIcon color="white" />}
          subDescription="Onboarding"
        />
        <div className="h-auto bg-white rounded-md p-4 px-8 border border-gray-200">
          {renderStep()}
        </div>
      </Main>
    </>
  );
};

export default LayoutSettings;
