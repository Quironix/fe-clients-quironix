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
import Language from "@/components/ui/language";
import { useTranslations } from "next-intl";

const LayoutSettings = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations("settings");
  const { profile } = useProfileContext();

  const steps: Step[] = [
    { id: 1, label: t("steps.entity"), completed: false },
    { id: 2, label: t("steps.debtors"), completed: false },
    { id: 3, label: t("steps.contacts"), completed: false },
  ];
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
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("layoutTitle")}
          description={t("layoutDescription")}
          icon={<UsersIcon color="white" />}
          subDescription={t("layoutSubDescription")}
        />
        <div className="h-auto bg-white rounded-md p-4 px-8 border border-gray-200">
          {renderStep()}
        </div>
      </Main>
    </>
  );
};

export default LayoutSettings;
