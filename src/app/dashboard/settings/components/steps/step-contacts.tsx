"use client";
import Stepper from "@/components/Stepper";
import { StepProps } from "../../types";
import StepLayout from "../StepLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon, Loader } from "lucide-react";
import { useState } from "react";

const StepContacts: React.FC<StepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  currentStep,
  steps,
  onStepChange,
  profile,
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <StepLayout>
      <section className="h-full">
        <div className="h-1/6 ">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={onStepChange}
          />
        </div>
        <div className="h-4/6 ">
          <div className="h-full w-full space-y-6">
            <div className="grid grid-cols-2 gap-4"></div>
          </div>
        </div>
        <div
          className={`h-1/6 flex items-center ${isFirstStep ? "justify-end" : "justify-between"}`}
        >
          {!isFirstStep && (
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="px-6 py-2"
            >
              <ArrowLeftIcon className="w-4 h-4" /> Volver
            </Button>
          )}
          <Button type="submit" className="px-6 py-2" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" /> Cargando
              </div>
            ) : (
              <>
                Continuar <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </section>
    </StepLayout>
  );
};

export default StepContacts;
