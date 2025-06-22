"use client";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import { Step } from "@/components/Stepper/types";
import Language from "@/components/ui/language";
import { SkeletonFormDebtor } from "@/components/ui/skeleton-form-debtor";
import { useProfileContext } from "@/context/ProfileContext";
import { FileCog } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDebtorsStore } from "../../store";
import AttentionStep from "./components/steps/attention-step";
import ContactInfoStep from "./components/steps/contact-info-step";
import DebtorsDataStep from "./components/steps/debtor-data";
const steps: Step[] = [
  { id: 1, label: "Configuración de la entidad", completed: false },
  { id: 2, label: "Configuración de deudores", completed: false },
  { id: 3, label: "Configuración de contactos", completed: false },
];

const LayoutSettings = ({ children }: { children: React.ReactNode }) => {
  const { profile, session } = useProfileContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsState, setStepsState] = useState<Step[]>(steps);
  const { fetchDebtorById, isFetchingDebtor } = useDebtorsStore();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id && profile?.client?.id) {
      fetchDebtorById(session?.token, profile?.client?.id, id);
    }
  }, [id, profile?.client?.id]);

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
        return (
          <>
            {isFetchingDebtor ? (
              <SkeletonFormDebtor />
            ) : (
              <DebtorsDataStep {...stepProps} />
            )}
          </>
        );
      case 1:
        return <AttentionStep {...stepProps} />;
      case 2:
        return <ContactInfoStep {...stepProps} />;
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
          title={`${id ? "Edición" : "Creación"} de deudores`}
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<FileCog color="white" />}
          subDescription="Configuración de la cartera"
        />
        <div className="bg-white rounded-md p-4 px-8 border border-gray-200">
          {renderStep()}
        </div>
      </Main>
    </>
  );
};

export default LayoutSettings;
