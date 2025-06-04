import TitleStep from "@/app/dashboard/settings/components/title-step";
import { StepProps } from "@/app/dashboard/settings/types";
import Stepper from "@/components/Stepper";
import { Cog } from "lucide-react";
import React from "react";

const DebtorsDataStep: React.FC<StepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  return (
    <section className="h-full">
      <div className="h-1/6">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={onStepChange}
        />
      </div>
      <div className="h-4/6 space-y-4  border border-gray-200 rounded-md p-5">
        <TitleStep title="Configuración de entidad" icon={<Cog size={16} />} />
      </div>
    </section>
  );
};

export default DebtorsDataStep;
